import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { generateSignedUrl } from '~/helper/functions';
import { supabase } from '~/utils/supabase'; // Make sure this path is correct for your setup

const BalancesComponent = ({ groupId, user }) => {
  const [balances, setBalances] = useState([]);
  const [totalGet, setTotalGet] = useState(0);
  const [totalOwe, setTotalOwe] = useState(0);
  const [loading, setLoading] = useState(true);

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
        .or(`user_id.eq.${user.id}`);

      if (balancesError) throw balancesError;


      // Calculate total amount 'you get' and 'you owe'
      let getTotal = 0;
      let oweTotal = 0;
      const formattedBalances = await Promise.all(allBalances.map(async (balance) => {
        const amount = balance.amount;
        if (amount > 0) {
          getTotal += amount;
        } else {
          oweTotal += amount;
        }

        const profile =
          balance.user_id === user.id
            ? balance.profiles
            : balance.users;


        return {
          name: profile?.full_name || 'Unknown',
          avatarUrl: profile?.avatar_url || '',
          amount,
          color: amount > 0 ? 'text-green-500' : 'text-red-500',
        };
      }));
      console.log("formatted Balances", formattedBalances)

      setTotalGet(getTotal);
      setTotalOwe(oweTotal);

      const updatedFormattedBalances = await Promise.all(formattedBalances.map(async (balance) => {

        const avatarUrl = balance.avatarUrl;
        if (!avatarUrl) {
          return balance;
        }
        else{
         
        const signedUrl = await generateSignedUrl("avatars",avatarUrl,3600);
        return {
          ...balance,
          avatarUrl: signedUrl,
        };
      }
      }));  
      setBalances(updatedFormattedBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="bg-white rounded-xl m-4 p-4 shadow-md">
      <View className="mb-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg">You get</Text>
          <Text className="text-lg font-bold text-green-500">₹ {totalGet.toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-lg">You owed</Text>
          <Text className="text-lg font-bold text-red-500">-₹ {Math.abs(totalOwe).toFixed(2)}</Text>
        </View>
      </View>
      <Text className="text-gray-500 mb-2">Balances</Text>
      {balances.map(({ name, amount, color, avatarUrl }, index) => (
        <View key={index} className="flex-row items-center mb-2">
          {avatarUrl ?(
          <Image
            source={{ uri: avatarUrl }}
            className="w-8 h-8 rounded-full bg-gray-300 mr-3"
            defaultSource={{ uri: 'path/to/default/avatar.png' }} // Fallback avatar
          />):(
            <View className="w-8 h-8 rounded-full bg-gray-300 mr-3"></View>
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

export default BalancesComponent;
