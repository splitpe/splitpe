import React, { useEffect, useState } from 'react';
import { View, Text ,Image } from 'react-native';
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
      // Fetch balances where the current user is involved
      const { data: userBalances, error: balancesError } = await supabase
        .from('balances')
        .select(`
          amount,
          balance_with_user_id,
          user_id,
          profiles!balances_balance_with_user_id_new_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .or(`user_id.eq.${user.id},balance_with_user_id.eq.${user.id}`);

      if (balancesError) throw balancesError;

      // Process balances
      let receivable = 0;
      let payable = 0;
      const processedBalances = [];
      
      userBalances.forEach(balance => {
        let amount = balance.amount;
        let name = balance.profiles.full_name;
        let avatarUrl = balance.profiles.avatar_url;

        // If the current user is the balance_with_user_id, invert the amount
        if (balance.balance_with_user_id === user.id) {
          amount = -amount;
        }

        // Add to totals
        if (amount > 0) {
          receivable += amount;
        } else {
          payable += Math.abs(amount);
        }

        // Only add non-zero balances to the display list
        if (amount !== 0) {
          processedBalances.push({
            name,
            amount,
            avatarUrl,
            color: amount > 0 ? 'text-green-500' : 'text-red-500'
          });
        }
      });

      setBalances(processedBalances);
      setTotalReceivable(receivable);
      setTotalPayable(payable);


    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  return (
    <View className="bg-white rounded-xl m-4 p-4 shadow-md">
      <View className="mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg">You get</Text>
          <Text className="text-lg font-bold text-green-500">
            ₹ {totalReceivable.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-lg">You owed</Text>
          <Text className="text-lg font-bold text-red-500">
            -₹ {totalPayable.toFixed(2)}
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
            {amount > 0 ? '₹ ' : '-₹ '}{Math.abs(amount).toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default BalanceDisplay;