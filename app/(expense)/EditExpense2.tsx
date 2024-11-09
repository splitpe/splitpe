import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal, FlatList, Alert } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { expenseCategories } from '~/types/expensetype';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '~/types/colors';
import CurrencyPicker, { currencies } from '../../components/Currencypicker';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/contexts/AuthProvider';
import { generateSignedUrl } from '~/helper/functions';
import { useLocalSearchParams } from 'expo-router';

export default function EditExpenseScreen() {
  // Get the expense ID from navigation params
  const { expenseId } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showExpenseTypeModal, setShowExpenseTypeModal] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState(expenseCategories[0]);
  const [payers, setPayers] = useState([]);
  const [splits, setSplits] = useState([]);
  const [splitType, setSplitType] = useState('equal');
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [currency, setCurrency] = useState(currencies[0]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the existing expense data
  useEffect(() => {
    async function fetchExpenseDetails() {
      try {
        setIsLoading(true);
        
        // Fetch expense details
        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .select(`
            *,
            groups:group_id(*),
            expense_payments(*),
            expense_splits(*)
          `)
          .eq('id', expenseId)
          .single();

        if (expenseError) throw expenseError;

        // Set initial values
        setDescription(expenseData.description);
        setAmount(expenseData.amount.toString());
        setGroupName({ name: expenseData.groups.name, id: expenseData.group_id });
        setCurrency({ code: expenseData.currency });
        
        // Find and set expense type
        const expenseType = expenseCategories.find(cat => cat.name === expenseData.category);
        setSelectedExpenseType(expenseType || expenseCategories[0]);

        // Set split type based on expense_splits
        const splitTypeFromDB = expenseData.expense_splits[0]?.split_type || 'equal';
        setSplitType(splitTypeFromDB);

        // Fetch and set payers
        const payersData = await Promise.all(expenseData.expense_payments.map(async (payment) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payment.user_id)
            .single();

          if (userData.avatar_url) {
            userData.avatar_url = await generateSignedUrl('avatars', userData.avatar_url, 3600);
          }

          return {
            id: payment.id,
            user_id: payment.user_id,
            amount: payment.paid_amount.toString(),
            user: userData
          };
        }));
        setPayers(payersData);

        // Fetch and set splits
        const splitsData = await Promise.all(expenseData.expense_splits.map(async (split) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', split.user_id)
            .single();

          if (userData.avatar_url) {
            userData.avatar_url = await generateSignedUrl('avatars', userData.avatar_url, 3600);
          }

          return {
            id: split.id,
            user_id: split.user_id,
            amount: split.split_amount.toString(),
            percentage: ((split.split_amount / expenseData.amount) * 100).toString(),
            user: userData
          };
        }));
        setSplits(splitsData);

      } catch (error) {
        console.error('Error fetching expense details:', error);
        Alert.alert('Error', 'Failed to load expense details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchExpenseDetails();
  }, [expenseId]);

  // Fetch groups (same as AddExpenseScreen)
  useEffect(() => {
    async function getGroupDetails(userId) {
      const { data, error } = await supabase
        .from('user_groups')
        .select('groups(*)')
        .eq('user_id', userId);

      if (error) {
        console.error(error);
      } else {
        const updatedGroups = await Promise.all(data.map(async (group) => {
          group = group.groups;
          if (group.profile_picture_url) {
            const ProfileSignedUrl = await generateSignedUrl('avatars', group.profile_picture_url, 3600);
            return {
              ...group,
              profile_picture_url: ProfileSignedUrl,
            };
          }
          return group;
        }));
        setGroups(updatedGroups);
      }
    }

    getGroupDetails(user.id);
  }, []);

  // Fetch group members when group changes
  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!groupName.id) return;

      const { data, error } = await supabase
        .from('user_groups')
        .select('id,user_id,group_id,role,user:profiles!user_groups_user_id_fkey(full_name,avatar_url)')
        .eq('group_id', groupName.id);

      if (error) {
        console.error(error);
      } else {
        const updatedGroupMembers = await Promise.all(data.map(async (item) => {
          if (item.user.avatar_url) {
            const avatarSignedUrl = await generateSignedUrl('avatars', item.user.avatar_url, 3600);
            return {
              ...item,
              user: {
                ...item.user,
                avatar_url: avatarSignedUrl,
              }
            };
          }
          return item;
        }));
        setGroupMembers(updatedGroupMembers);
      }
    };

    fetchGroupMembers();
  }, [groupName]);

  // Handle splits calculations
  useEffect(() => {
    if (splitType === 'equal') {
      const equalAmount = (parseFloat(amount) / groupMembers.length).toFixed(2);
      const equalPercentage = (100 / groupMembers.length).toFixed(2);
      setSplits(prevSplits => 
        prevSplits.map(split => ({ ...split, amount: equalAmount, percentage: equalPercentage }))
      );
    }
  }, [amount, splitType, groupMembers]);

  const handleUpdateExpense = async () => {
    const totalAmount = parseFloat(amount);
    if (totalAmount <= 0) {
      return Alert.alert('Please enter a valid amount.');
    } else if (splits.length === 0) {
      return Alert.alert('Please add at least one split.');
    } else if (payers.length === 0) {
      return Alert.alert('Please add at least one payer.');
    }

    const totalSplitAmount = splits.reduce((acc, split) => acc + parseFloat(split.amount), 0);
    const totalPayerAmount = payers.reduce((acc, payer) => acc + parseFloat(payer.amount), 0);

    if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
      return Alert.alert('Split amounts do not add up to the total amount.');
    }

    if (Math.abs(totalPayerAmount - totalAmount) > 0.01) {
      return Alert.alert('Payer amounts do not add up to the total amount.');
    }

    try {
      // Update the expense
      const { error: expenseError } = await supabase
        .from('expenses')
        .update({
          group_id: groupName.id,
          category: selectedExpenseType.name,
          amount: totalAmount,
          currency: currency.code,
          description
        })
        .eq('id', expenseId);

      if (expenseError) throw expenseError;

      // Update expense payments
      await supabase
        .from('expense_payments')
        .delete()
        .eq('expense_id', expenseId);

      const paymentsData = payers.map((payer) => ({
        expense_id: expenseId,
        user_id: payer.user_id,
        group_id: groupName.id,
        paid_amount: parseFloat(payer.amount),
      }));

      const { error: paymentError } = await supabase
        .from('expense_payments')
        .insert(paymentsData);

      if (paymentError) throw paymentError;

      // Update expense splits
      await supabase
        .from('expense_splits')
        .delete()
        .eq('expense_id', expenseId);

      const splitsData = splits.map((split) => ({
        expense_id: expenseId,
        user_id: split.user_id,
        split_type: splitType,
        split_amount: parseFloat(split.amount),
        owed_amount: splitType === 'percentage'
          ? (parseFloat(split.percentage) / 100) * totalAmount
          : parseFloat(split.amount),
      }));

      const { error: splitError } = await supabase
        .from('expense_splits')
        .insert(splitsData);

      if (splitError) throw splitError;

      Alert.alert('Success', 'Expense updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Failed to update expense');
    }
  };

  const handleAddPayer = (selectedPayer) => {
    if (!payers.some(payer => payer.user_id === selectedPayer.user_id)) {
      setPayers([...payers, { ...selectedPayer, amount: '0.00' }]);
    }
    setShowPayerModal(false);
  };

  const handlePayerChange = (id, field, value) => {
    setPayers(payers.map(payer =>
      payer.id === id ? { ...payer, [field]: value } : payer
    ));
  };

  const handleSplitChange = (id, field, value) => {
    setSplits(splits.map(split => {
      if (split.id === id) {
        if (field === 'percentage') {
          const percentage = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
          const newAmount = ((parseFloat(amount) * percentage) / 100).toFixed(2);
          return { ...split, [field]: percentage.toString(), amount: newAmount };
        } else {
          return { ...split, [field]: value };
        }
      }
      return split;
    }));
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  
  return (
    <ScrollView className="flex-1 bg-white px-4 pt-6 pb-20">
      <Text className="text-3xl text-bg-dark font-bold mb-6">Edit Transaction</Text>
  
      <View className="space-y-4 gap-3">
        <TouchableOpacity 
          className="bg-primary-light rounded-lg flex-row items-center justify-between px-4 py-3"
          onPress={() => setShowGroupDropdown(true)}
        >
          <Text className="text-lg text-primary-dark">
            {groupName.name || 'Group name'}
          </Text>
          <Entypo name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
  
        <TouchableOpacity 
          className="bg-primary-light rounded-lg flex-row items-center justify-between px-4 py-3"
          onPress={() => setShowExpenseTypeModal(true)}
        >
          <Text className="text-lg text-primary-dark">
            {selectedExpenseType ? selectedExpenseType.name : 'Select expense type'}
          </Text>
          <Entypo name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
  
        <View className="flex-row space-x-2">
          <View className="flex-1 bg-primary-light rounded-lg px-4 py-3">
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              className="text-lg text-primary-dark"
            />
          </View>
        </View>
  
        <View className="flex-row gap-2 space-x-2">
          <View className="flex-1 bg-primary-light rounded-lg px-4 py-3">
            <TextInput
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="text-lg text-primary-dark"
            />
          </View>
        </View>
      </View>
  
      <View className="my-6 border-t border-gray-200" />
  
      <Text className="text-2xl font-semibold mb-4">Paid by</Text>
  
      {payers.length === 0 ? (
        <View className='flex-row gap-2 space-x-2 mb-4'>
          <Text className="text-lg text-primary-dark">No payers added</Text>
        </View>
      ) : (
        payers.map((payer, index) => (
          <View key={payer.id} className="flex-row gap-2 space-x-2 mb-4">
            <View className="flex-1 bg-primary-light rounded-lg px-4 py-3">
              <Text className="text-lg text-primary-dark">{payer.user?.full_name}</Text>
            </View>
            <View className="flex-1 bg-primary-light rounded-lg px-4 py-3">
              <TextInput
                placeholder="0.00"
                value={payer.amount}
                onChangeText={(value) => handlePayerChange(payer.id, 'amount', value)}
                keyboardType="numeric"
                className="text-lg text-primary-dark"
              />
            </View>
            <TouchableOpacity 
              className="items-center justify-center" 
              onPress={() => setPayers(payers.filter((p) => p.id !== payer.id))}
            >
              <Entypo name="circle-with-cross" size={30} color={Colors.primary.DEFAULT} />
            </TouchableOpacity>
          </View>
        ))
      )}
  
      <TouchableOpacity
        className="bg-primary rounded-lg py-3 mb-6"
        onPress={() => setShowPayerModal(true)}
      >
        <Text className="text-center text-lg font-semibold text-primary-light">Add Payer</Text>
      </TouchableOpacity>
  
      <View className="space-y-4 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold">Split</Text>
          <View className="flex-row gap-2">
            {['equal', 'unequal', 'percentage'].map((type) => (
              <TouchableOpacity
                key={type}
                className={`px-3 py-2 rounded-lg ${splitType === type ? 'bg-primary' : 'bg-primary-light'}`}
                onPress={() => setSplitType(type)}
              >
                <Text className={`text-sm ${splitType === type ? 'text-white' : 'text-primary-dark'}`}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
  
        {splits.map((split) => (
          <View key={split.id} className="flex-row items-center justify-between">
            <Text className="text-lg text-primary-dark">{split.user.full_name}</Text>
            <View className="flex-row items-center gap-2 space-x-2">
              {splitType !== 'equal' && (
                <TextInput
                  placeholder={splitType === 'percentage' ? '0%' : '0.00'}
                  value={splitType === 'percentage' ? split.percentage : split.amount}
                  onChangeText={(value) => handleSplitChange(split.id, splitType === 'percentage' ? 'percentage' : 'amount', value)}
                  keyboardType="numeric"
                  className="bg-primary-light rounded-lg px-3 py-2 text-lg text-primary-dark w-20"
                />
              )}
              <View className="bg-primary-light rounded-lg px-3 py-2 opacity-50">
                <Text className="text-lg text-primary-dark">₹ {split.amount}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
  
      <TouchableOpacity 
        onPress={handleUpdateExpense}
        className="bg-primary rounded-lg py-3 mt-6 mb-12"
      >
        <Text className="text-center text-lg font-semibold text-primary-light">
          Update Transaction
        </Text>
      </TouchableOpacity>
  
      <Modal
        visible={showGroupDropdown}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-4">
            <Text className="text-xl font-bold mb-4">Select Group</Text>
            <FlatList
              data={groups}
              renderItem={({ item }) => (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row items-center justify-start py-3 border-b border-gray-200"
                  onPress={() => {
                    setGroupName({name: item.name, id: item.id});
                    setShowGroupDropdown(false);
                  }}
                >
                  {item.profile_picture_url ? (
                    <Image 
                      className='w-10 h-10 rounded-full mr-4'
                      source={{ uri: item.profile_picture_url }}
                    />
                  ) : (
                    <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-4" />
                  )}
                  <Text className="text-lg">{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity
              className="mt-4 bg-primary-light rounded-lg py-3"
              onPress={() => setShowGroupDropdown(false)}
            >
              <Text className="text-center text-lg font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
      <Modal
        visible={showExpenseTypeModal}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-4" style={{ maxHeight: '80%' }}>
            <Text className="text-xl font-bold mb-4">Select Expense Type</Text>
            <FlatList
              data={expenseCategories}
              renderItem={renderExpenseTypeItem}
              keyExtractor={(item) => item.name}
            />
            <TouchableOpacity
              className="mt-4 bg-primary-light rounded-lg py-3"
              onPress={() => setShowExpenseTypeModal(false)}
            >
              <Text className="text-center text-lg font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
      <Modal
        visible={showPayerModal}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl p-4" style={{ maxHeight: '80%' }}>
            <Text className="text-xl font-bold mb-4">Select Payer</Text>
            <FlatList
              data={groupMembers}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity
              className="mt-4 bg-primary-light rounded-lg py-3"
              onPress={() => setShowPayerModal(false)}
            >
              <Text className="text-center text-lg font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
    </ScrollView>
  );

}