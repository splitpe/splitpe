import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { styled } from 'nativewind';

function useBalanceUpdater() {
  useEffect(() => {
    const expenseSubscription = supabase
      .channel('table-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'expenses' },
        async (payload) => {
          const newExpense = payload.new;
          await handleNewExpense(newExpense);
        }
      )
      .subscribe();

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
      .subscribe();

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

    return () => {
      supabase.removeChannel(expenseSubscription);
      supabase.removeChannel(splitSubscription);
      supabase.removeChannel(settlementSubscription);
    };
  }, []);
}

// 1. Function to handle adding a new expense with unequal shares and multiple payers
async function handleNewExpense(expense) {
  const { id: expenseId, group_id: groupId, amount } = expense;

  // Fetch all payers for the expense
  const { data: expensePayments } = await supabase
    .from('expense_payments')
    .select('user_id, contribution')
    .eq('expense_id', expenseId);

  // Fetch all participants and their shares for the expense
  const { data: expenseSplits } = await supabase
    .from('expense_splits')
    .select('user_id, share_type, share_amount')
    .eq('expense_id', expenseId);

  for (const split of expenseSplits) {
    const { user_id: participantId, share_type, share_amount } = split;

    // Determine each participant’s owed amount based on their share type
    const userOwed = calculateOwedAmount(share_type, share_amount, amount);

    // Loop through each payer to adjust balances
    for (const payer of expensePayments) {
      const { user_id: payerId, contribution } = payer;

      // Calculate the portion of the owed amount based on payer’s contribution
      const adjustedOwed = (contribution / amount) * userOwed;

      if (participantId !== payerId) {
        await updateBalance(payerId, participantId, adjustedOwed, groupId);
      }
    }
  }
}

// 2. Function to handle balance updates for splits with custom shares
async function updateBalancesForSplit(split) {
  const { expense_id, user_id: participantId, share_type, share_amount } = split;

  const { data: expense } = await supabase
    .from('expenses')
    .select('amount')
    .eq('id', expense_id)
    .single();

  const { data: expensePayments } = await supabase
    .from('expense_payments')
    .select('user_id, contribution')
    .eq('expense_id', expense_id);

  const userOwed = calculateOwedAmount(share_type, share_amount, expense.amount);

  // Adjust balances based on each payer's contribution
  for (const payer of expensePayments) {
    const { user_id: payerId, contribution } = payer;
    const payerOwedAmount = (contribution / expense.amount) * userOwed;

    if (participantId !== payerId) {
      await updateBalance(payerId, participantId, payerOwedAmount, split.group_id);
    }
  }
}

// 3. Function to process a partial settlement for a given balance
async function processSettlement(settlement) {
  const { payer_id, receiver_id, amount, group_id } = settlement;

  // Deduct only the settled portion from the balance between payer and receiver
  await updateBalance(payer_id, receiver_id, -amount, group_id);
}

// 4. Function to update balance between two users in a specific group
async function updateBalance(userId, balanceWithUserId, amount, groupId) {
  const { data: balanceRecord } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', userId)
    .eq('balance_with_user_id', balanceWithUserId)
    .eq('group_id', groupId)
    .single();

  if (balanceRecord) {
    await supabase
      .from('balances')
      .update({ amount: balanceRecord.amount + amount, last_updated: new Date() })
      .eq('id', balanceRecord.id);
  } else {
    await supabase.from('balances').insert({
      group_id: groupId,
      user_id: userId,
      balance_with_user_id: balanceWithUserId,
      amount: amount,
      last_updated: new Date(),
    });
  }
}

// Helper function to calculate the owed amount based on share type
function calculateOwedAmount(shareType, shareAmount, totalAmount) {
  if (shareType === 'percentage') {
    return (shareAmount / 100) * totalAmount;
  } else if (shareType === 'fixed') {
    return shareAmount;
  } else {
    return totalAmount / numUsers; // Default to equal split
  }
}
