import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { supabase } from '~/utils/supabase';

const AddExpense = ({ groupId, users }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPayers, setSelectedPayers] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splits, setSplits] = useState([]);

  const handleAddPayer = (userId, contribution) => {
    setSelectedPayers((prev) => [...prev, { userId, contribution: parseFloat(contribution) }]);
  };

  const handleAddSplit = (userId, shareType, shareAmount) => {
    setSplits((prev) => [
      ...prev,
      { userId, shareType, shareAmount: parseFloat(shareAmount) },
    ]);
  };

  const handleAddExpense = async () => {
    if (!amount || selectedPayers.length === 0 || splits.length === 0) {
      return Alert.alert('Please fill out all fields and add payers and splits.');
    }

    const totalAmount = parseFloat(amount);

    try {
      // Step 1: Insert the expense
      const { data: newExpense, error: expenseError } = await supabase
        .from('expenses')
        .insert([{ group_id: groupId, amount: totalAmount, description }])
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Step 2: Insert expense payments (payers)
      const paymentsData = selectedPayers.map((payer) => ({
        expense_id: newExpense.id,
        user_id: payer.userId,
        contribution: payer.contribution,
      }));

      const { error: paymentError } = await supabase
        .from('expense_payments')
        .insert(paymentsData);

      if (paymentError) throw paymentError;

      // Step 3: Calculate owed amounts for splits and insert into expense_splits table
      const splitsData = splits.map((split) => {
        const userOwed =
          split.shareType === 'percentage'
            ? (split.shareAmount / 100) * totalAmount
            : split.shareType === 'fixed'
            ? split.shareAmount
            : totalAmount / splits.length;

        return {
          expense_id: newExpense.id,
          user_id: split.userId,
          share_type: split.shareType,
          share_amount: split.shareAmount,
          owed_amount: userOwed,
        };
      });

      const { error: splitError } = await supabase
        .from('expense_splits')
        .insert(splitsData);

      if (splitError) throw splitError;

      Alert.alert('Expense added successfully!');
      // Reset form
      setAmount('');
      setDescription('');
      setSelectedPayers([]);
      setSelectedParticipants([]);
      setSplits([]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error adding expense');
    }
  };

  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-4">Add Expense</Text>

      <Text className="text-lg">Amount</Text>
      <TextInput
        className="border p-2 rounded mb-4"
        placeholder="Total amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text className="text-lg">Description</Text>
      <TextInput
        className="border p-2 rounded mb-4"
        placeholder="Expense description"
        value={description}
        onChangeText={setDescription}
      />

      {/* Payer Selection */}
      <Text className="text-lg mb-2">Payers</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="flex-row items-center mb-2">
            <Text className="flex-1">{item.name}</Text>
            <TextInput
              className="border p-2 rounded w-20 mr-2"
              placeholder="Amount"
              keyboardType="numeric"
              onChangeText={(value) => handleAddPayer(item.id, value)}
            />
          </View>
        )}
      />

      {/* Split Selection */}
      <Text className="text-lg mt-4 mb-2">Splits</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="flex-row items-center mb-2">
            <Text className="flex-1">{item.name}</Text>
            <TextInput
              className="border p-2 rounded w-20 mr-2"
              placeholder="Share Amount"
              keyboardType="numeric"
              onChangeText={(value) =>
                handleAddSplit(item.id, 'fixed', value)
              }
            />
            <TextInput
              className="border p-2 rounded w-20"
              placeholder="Percentage"
              keyboardType="numeric"
              onChangeText={(value) =>
                handleAddSplit(item.id, 'percentage', value)
              }
            />
          </View>
        )}
      />

      <Button title="Add Expense" onPress={handleAddExpense} />
    </View>
  );
};

export default AddExpense;
