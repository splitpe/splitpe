import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/contexts/AuthProvider';

const BalanceDisplay = ({ groupId }) => {
  const [balances, setBalances] = useState([]);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchBalances();
  }, [groupId]);

  const fetchBalances = async () => {
    try {
      // Fetch all balances where the current user is involved
      const { data: allBalances, error: balancesError } = await supabase
        .from('balances')
        .select(`
          amount,
          balance_with_user_id,
          user_id,
          profiles!balances_balance_with_user_id_new_fkey(
            full_name,
            avatar_url
          ),
          users:profiles!balances_user_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .or(`user_id.eq.${user.id},balance_with_user_id.eq.${user.id}`);

      if (balancesError) throw balancesError;

      // Create a map to consolidate balances by user
      const balanceMap = new Map();

      allBalances.forEach(balance => {
        let otherUserId;
        let amount = balance.amount;
        let otherUser;

        // Determine the other user and correct amount direction
        if (balance.user_id === user.id) {
          // Current user is the creditor
          otherUserId = balance.balance_with_user_id;
          otherUser = balance.profiles; // Using profiles for balance_with_user
        } else {
          // Current user is the debtor
          otherUserId = balance.user_id;
          otherUser = balance.users; // Using users for user_id relationship
          amount = Math.abs(balance.amount); // Take the absolute value of the amount
          if (balance.balance_with_user_id === user.id) {
            amount = -amount; // Invert amount if current user is the balance_with_user
          }
        
        }

        // Add or update balance in the map
        const existingBalance = balanceMap.get(otherUserId) || {
          name: otherUser?.full_name || 'Unknown User',
          avatarUrl: otherUser?.avatar_url,
          amount: 0
        };

        balanceMap.set(otherUserId, {
          ...existingBalance,
          amount: existingBalance.amount + Math.abs(amount)
        });
      });

      // Convert map to array and calculate totals
      let receivable = 0;
      let payable = 0;
      const consolidatedBalances = Array.from(balanceMap.entries())
        .map(([userId, balance]) => {
          // Round to 2 decimal places to avoid floating point issues
          const roundedAmount = Math.round(balance.amount * 100) / 100;
          
          if (roundedAmount > 0) {
            receivable += roundedAmount;
          } else {
            payable += Math.abs(roundedAmount);
          }

          return {
            ...balance,
            amount: roundedAmount,
            color: roundedAmount > 0 ? 'text-green-500' : 'text-red-500'
          };
        })
        .filter(balance => Math.abs(balance.amount) > 0.01) // Filter out zero or nearly-zero balances
        .sort((a, b) => b.amount - a.amount); // Sort by amount (highest to lowest)
      console.log("Consolidated Balances",consolidatedBalances)
      console.log("Balances Map",balanceMap)
      setBalances(consolidatedBalances);
      setTotalReceivable(Math.round(receivable * 100) / 100);
      setTotalPayable(Math.round(payable * 100) / 100);

    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  return (
    <View className="bg-white rounded-xl m-4 p-4 shadow-md">
      <View className="mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg">You get</Text>
          <Text className="text-lg font-bold text-green-500">
            ₹ {formatCurrency(totalReceivable)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-lg">You owe</Text>
          <Text className="text-lg font-bold text-red-500">
            -₹ {formatCurrency(totalPayable)}
          </Text>
        </View>
      </View>

      <Text className="text-gray-500 mb-2">Balances</Text>
      
      {balances.map(({ name, amount, avatarUrl, color }) => (
        <View key={name} className="flex-row items-center mb-2">
          {avatarUrl ? (
            <Image 
              source={{ uri: avatarUrl }}
              className="w-8 h-8 rounded-full mr-3"
            />
          ) : (
            <View className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
          )}
          <Text className="flex-1">{name}</Text>
          <Text className={`font-bold ${color}`}>
            {amount > 0 ? '₹ ' : '-₹ '}{formatCurrency(amount)}
          </Text>
        </View>
      ))}

      {balances.length === 0 && (
        <Text className="text-gray-500 text-center py-2">
          No outstanding balances
        </Text>
      )}
    </View>
  );
};

export default BalanceDisplay;