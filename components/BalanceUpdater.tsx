import { useEffect } from 'react';
import { supabase } from '~/utils/supabase';

// Function to initialize subscriptions and listen to database changes
function useBalanceUpdater() {
  useEffect(() => {
    // Listen for new expenses and update balances accordingly
    const expenseSubscription = supabase
      .channel('table-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'expenses' },
        async (payload) => {
          const newExpense = payload.new;
          await updateBalancesForExpense(newExpense);
        }
      )
      .subscribe();

    // Listen for changes in expense splits
    const splitSubscription = supabase
      .channel('table-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'expense_splits' },
        async (payload) => {
          const splitDetails = payload.new;
          await updateBalancesForSplit(splitDetails);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'expense_splits' },
        async (payload) => {
          const updatedSplit = payload.new;
          await updateBalancesForSplit(updatedSplit);
        }
      )
      .subscribe();

    // Listen for new settlements to update balances
    const settlementSubscription = supabase
      .channel('table-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payment_settlements' },
        async (payload) => {
          const settlement = payload.new;
          await processSettlement(settlement);
        }
      )
      .subscribe();

    // Cleanup subscriptions on component unmount
    return () => {
      supabase.removeChannel(expenseSubscription);
      supabase.removeChannel(splitSubscription);
      supabase.removeChannel(settlementSubscription);
    };
  }, []);
}

// Function to handle new expenses and update balances
async function updateBalancesForExpense(expense) {
  const { id: expenseId, group_id: groupId, paid_by_user_id, amount } = expense;

  // Fetch splits for this expense
  const { data: splits } = await supabase
    .from('expense_splits')
    .select('*')
    .eq('expense_id', expenseId);

  // Update balances based on each user's owed amount
  for (const split of splits) {
    const { user_id, owed_amount } = split;
    if (user_id !== paid_by_user_id) {
      await updateBalance(paid_by_user_id, user_id, owed_amount, groupId);
    }
  }
}

// Function to update balances when expense splits change
async function updateBalancesForSplit(split) {
  const { expense_id, user_id, owed_amount } = split;

  // Get the expense details to find the payer
  const { data: expense } = await supabase
    .from('expenses')
    .select('paid_by_user_id, group_id')
    .eq('id', expense_id)
    .single();

  if (expense) {
    const { paid_by_user_id, group_id } = expense;
    if (user_id !== paid_by_user_id) {
      await updateBalance(paid_by_user_id, user_id, owed_amount, group_id);
    }
  }
}

// Function to handle settlements and adjust balances
async function processSettlement(settlement) {
  const { payer_id, receiver_id, amount, group_id } = settlement;
  // Reduce balance between payer and receiver by settlement amount
  await updateBalance(payer_id, receiver_id, -amount, group_id);
}

// Helper function to update balances in the `balances` table
async function updateBalance(userId, balanceWithUserId, amount, groupId) {
  const { data: balanceRecord } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .eq('balance_with_user_id', balanceWithUserId)
    .eq('group_id', groupId)
    .single();

  if (balanceRecord) {
    // If a balance record exists, update the amount
    await supabase
      .from('balances')
      .update({
        amount: balanceRecord.amount + amount,
        last_updated: new Date(),
      })
      .eq('id', balanceRecord.id);
  } else {
    // If no balance record exists, create a new one
    await supabase.from('balances').insert({
      group_id: groupId,
      user_id: userId,
      balance_with_user_id: balanceWithUserId,
      amount: amount,
      last_updated: new Date(),
    });
  }
}

// Component to use in your app that listens for balance updates
export default function BalanceUpdater() {
  // Initialize balance updater on component mount
  useBalanceUpdater();

  return null; // No UI needed, it simply runs in the background
}
