import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity,Image, ScrollView, Modal, FlatList, Alert } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { expenseCategories } from '~/types/expensetype';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '~/types/colors';
import CurrencyPicker, { currencies } from '~/components/Currencypicker';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/contexts/AuthProvider';
import { generateSignedUrl } from '~/helper/functions';
import CustomStackScreen from '~/components/CustomStackScreen';
import { router, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';




export default function AddExpenseScreen() {
    const [groupMembers, setGroupMembers] = useState([]);
    const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showExpenseTypeModal, setShowExpenseTypeModal] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState(expenseCategories[0]);
  const [payers, setPayers] = useState([]);
  const [splits, setSplits] = useState(groupMembers.map(member => ({ ...member, amount: '0.00', percentage: '0' })));
  const [splitType, setSplitType] = useState('equal'); // 'equal', 'unequal', 'percentage'
  const [showPayerModal, setShowPayerModal] = useState(false);
  const [currency, setCurrency] = useState(currencies[0]);
  const [groups, setGroups] = useState([]);
  const { user } = useAuth();


  const {groupID} = useLocalSearchParams();



useEffect(() => {
    if(payers.length > 0){
        setPayers(payers.map(payer => ({ ...payer, amount: parseFloat(amount/payers.length).toFixed(2) })));
    }
}, [amount]);


  useEffect(() => {
    async function getGroupDetails(userId: string) {
      const { data, error } = await supabase
        .from('user_groups')
        .select('groups(*)')
        .eq('user_id', userId)
    
      if (error) {
        console.error(error);
      }
      else {
        //console.log(data);
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
        if (groupID) {
          const filteredGroups = updatedGroups.filter((g) => g.id.toString() === groupID);
          console.log("GroupID",groupID)
          console.log("Filtered Groups",filteredGroups);
          console.log("Updated Groups",updatedGroups);
          setGroupName({ name: filteredGroups[0].name, id: filteredGroups[0].id });
          setGroups(filteredGroups);
        }
        else{
        setGroups(updatedGroups);
        }
      }
    }

    getGroupDetails(user.id);
  }, []);




  const renderMember = ({ item }: { item: Member }) => (
    <TouchableOpacity onPress={() => handleAddPayer(item)} key={item.id} className="flex-row items-center mb-2 p-2 border border-gray-200 bg-white rounded-lg">
      {item.user.avatar_url ? (
        <Image className='w-10 h-10 rounded-full mr-4'
          source={{ uri: item.user.avatar_url }}></Image>
      ): (
        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-4">
      </View>
      )}
      <Text className="text-lg">{item.user?.full_name}</Text>
      </TouchableOpacity>
  )


  useEffect(() => {
    const fetchGroupMembers = async () => {
        if (groupName.id) {
          console.log('The group ID',groupName.id)
        }
        else
        {
            return
        }
      const { data, error } = await supabase
      .from('user_groups')
      .select('id,user_id, group_id,role,user:profiles!user_groups_user_id_fkey(full_name,avatar_url)')
      .eq('group_id', groupName.id)

      if (error) {
        console.error(error);
      }
      else {

        const updatedGroupMembers = await Promise.all(data.map(async (item) => {

          if(item.user_id.toString() === user.id.toString()){
           // console.log("Inside the item comparision", item.user_id.toString(), user.id.toString())
            handleAddPayer(item);
          }

          if (item.user.avatar_url) {
           
            const avatarSignedUrl = await generateSignedUrl('avatars', item.user.avatar_url, 3600);
            return {
              ...item,
              user:{
                ...item.user,
                avatar_url: avatarSignedUrl,
              }
              
            };
          }
          return item;
        }));

        //console.log('The group ID',groupName.id)
        setGroupMembers(updatedGroupMembers);
      }
    }
    fetchGroupMembers();
  }, [groupName])



  useEffect(() => {
    if (splitType === 'equal') {
      const equalAmount = (parseFloat(amount) / groupMembers.length).toFixed(2);
      const equalPercentage = (100 / groupMembers.length).toFixed(2);
      setSplits(groupMembers.map(member => ({ ...member, amount: equalAmount, percentage: equalPercentage })));
    }
    else if (splitType === 'unequal') {
        const equalAmount = (parseFloat(amount) / groupMembers.length).toFixed(2);
        const equalPercentage = (100 / groupMembers.length).toFixed(2);  
        setSplits(groupMembers.map(member => ({ ...member, amount: equalAmount, percentage: equalPercentage })));
    }
  }, [amount, splitType, groupMembers]);

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


  const handleAddExpense = async () => {
    const totalAmount = parseFloat(amount);
    if (totalAmount <= 0 ) {
      return Alert.alert('Please enter a valid amount.');      
    }
    else if (splits.length === 0) {
      return Alert.alert('Please add at least one split.');
    }
    else if (payers.length === 0) {
      return Alert.alert('Please add at least one payer.');
    }

  const totalSplitAmount = splits.reduce((acc, split) => acc + parseFloat(split.amount), 0);

  if (totalSplitAmount !== totalAmount) {
    return Alert.alert('Split amounts do not add up to the total amount.');
  }

  const totalPayerAmount = payers.reduce((acc, payer) => acc + parseFloat(payer.amount), 0);

if (totalPayerAmount !== totalAmount) {
  return Alert.alert('Payer amounts do not add up to the total amount.');
}


    try {
      // Step 1: Insert the expense
      const { data: newExpense, error: expenseError } = await supabase
        .from('expenses')
        .insert([{ group_id: groupName.id,category:selectedExpenseType.name, amount: totalAmount, currency: currency.code, description }])
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Step 2: Insert expense payments (payers)
      const paymentsData = payers.map((payer) => ({
        expense_id: newExpense.id,
        user_id: payer.user_id,
        group_id: payer.group_id,
        paid_amount: payer.amount,
      }));

      const { error: paymentError } = await supabase
        .from('expense_payments')
        .insert(paymentsData);

      if (paymentError) throw paymentError;

      // Step 3: Calculate owed amounts for splits and insert into expense_splits table
      const splitsData = splits.map((split) => {
        const userOwed =
          splitType === 'percentage'
            ? (split.percentage / 100) * totalAmount
            : splitType === 'unequal'
            ? split.amount
            : totalAmount / splits.length;

        return {
          expense_id: newExpense.id,
          user_id: split.user_id,
          split_type: splitType,
          group_id: groupName.id,
          split_amount: split.amount,
          owed_amount: userOwed,
        };
      });

      const { error: splitError } = await supabase
        .from('expense_splits')
        .insert(splitsData);

      if (splitError) throw splitError;

    //   expense_id: newExpense.id,
    //   user_id: payer.user_id,
    //   group_id: payer.group_id,
    //   paid_amount: payer.amount,


    // expense_id: newExpense.id,
    // user_id: split.user_id,
    // split_type: splitType,
    // split_amount: split.amount,
    // owed_amount: userOwed,


    // Step 4: Calculate and update balances
    // Create a map of all users involved
    const allUsers = new Set([
        ...payers.map(p => p.user_id),
        ...splits.map(s => s.user_id)
      ]);
  
      // Create a balance matrix for all users
      const balanceMatrix = {};
      for (const userId of allUsers) {
        balanceMatrix[userId] = {};
        for (const otherId of allUsers) {
          if (userId !== otherId) {
            balanceMatrix[userId][otherId] = 0;
          }
        }
      }
  
      // Calculate what each person paid
      const paidAmounts = {};
      payers.forEach(payer => {
        paidAmounts[payer.user_id] = parseFloat(payer.amount);
      });
  
      // Calculate what each person owes
      const owedAmounts = {};
      splits.forEach(split => {
        owedAmounts[split.user_id] = parseFloat(split.amount);
      });
  
      // Calculate net balances
      for (const payerId of allUsers) {
        for (const owerId of allUsers) {
          if (payerId !== owerId) {
            const paidAmount = paidAmounts[payerId] || 0;
            const owedAmount = owedAmounts[owerId] || 0;
            
            // Calculate the share this owner owes to this payer
            const shareOfPayment = (paidAmount / totalAmount) * owedAmount;
            if (shareOfPayment > 0) {
              balanceMatrix[payerId][owerId] += shareOfPayment;
              balanceMatrix[owerId][payerId] -= shareOfPayment;
            }
          }
        }
      }
  
      // Update balances in database
      for (const userId of allUsers) {
        for (const otherId of Object.keys(balanceMatrix[userId])) {
          const balanceAmount = balanceMatrix[userId][otherId];
          if (balanceAmount !== 0) {
            // Check for existing balance
            const { data: existingBalance, error: balanceError } = await supabase
              .from('balances')
              .select()
              .eq('user_id', userId)
              .eq('balance_with_user_id', otherId)
              .eq('group_id', groupName.id)
              .single();
  
            if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;
  
            if (existingBalance) {
              // Update existing balance
              await supabase
                .from('balances')
                .update({
                  amount: existingBalance.amount + balanceAmount,
                  last_updated: new Date().toISOString()
                })
                .eq('id', existingBalance.id);
            } else {
              // Create new balance record
              await supabase
                .from('balances')
                .insert({
                  user_id: userId,
                  balance_with_user_id: otherId,
                  group_id: groupName.id,
                  amount: balanceAmount,
                  last_updated: new Date().toISOString()
                });
            }
          }
        }
      }
  
    





      Alert.alert('Expense added successfully!');
      // Reset form
      setAmount('');
      setDescription('');
      setPayers([]);
      setSplits([]);
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error adding expense');
    }
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

  
  // Function to update balances
  const updateBalance = async (payerId, recipientId, amount, groupId) => {
    try {
      // Check if a balance record exists between the payer and recipient
      const { data: existingBalance, error: balanceError } = await supabase
        .from('balances')
        .select()
        .eq('user_id', payerId)
        .eq('balance_with_user_id', recipientId)
        .eq('group_id', groupId)
        .single();
  
      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError; // Ignore 'no data found' error
  
      if (existingBalance) {
        // Update the existing balance
        const newAmount = existingBalance.amount + amount;
        await supabase
          .from('balances')
          .update({ amount: newAmount, last_updated: new Date().toISOString() })
          .eq('id', existingBalance.id);
      } else {
        // Insert a new balance record
        await supabase.from('balances').insert({
          user_id: payerId,
          balance_with_user_id: recipientId,
          group_id: groupId,
          amount: amount,
          last_updated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const renderExpenseTypeItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-gray-200"
      onPress={() => {
        setSelectedExpenseType(item);
        setShowExpenseTypeModal(false);
      }}
    >
      <View className="w-10 h-10 bg-primary-light rounded-full items-center justify-center mr-3">
        <item.iconSet name={item.icon} size={24} color="#666" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-primary-dark">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.description}</Text>
      </View>
    </TouchableOpacity>
  );





  return (
    <>
       
       <ScrollView className="flex-1 bg-white px-4 pt-6 pb-20">
       <CustomStackScreen />
      <Text className="text-3xl text-bg-dark font-bold mb-6">Add Transaction</Text>

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
        {/* <View className='flex-row items-center justify-center pt-3 text-center'>
        <CurrencyPicker selectedCurrency={currency} onSelectCurrency={setCurrency} />
        </View> */}
      </View>

      <View className="my-6 border-t border-gray-200" />

      <Text className="text-2xl font-semibold mb-4">Paid by</Text>

      {payers.length === 0 ? (
      <View className='flex-row gap-2 space-x-2 mb-4'>
      <Text className="text-lg text-primary-dark">No payers added</Text>
      </View>
  
)       :(payers.map((payer, index) => (
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
          <TouchableOpacity className="items-center justify-center" onPress={() => setPayers(payers.filter((p) => p.id !== payer.id))}>
          <Entypo name="circle-with-cross" size={30} color={Colors.primary.DEFAULT} />
</TouchableOpacity>

        </View>
      )))}

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

      <TouchableOpacity onPress={() => handleAddExpense()}
        className="bg-primary rounded-lg py-3 mt-6 mb-12 "        
      >
        <Text className="text-center text-lg font-semibold text-primary-light">Add Transaction</Text>
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
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                key={item.id}
                  className="flex-row items-center justify-start py-3 border-b border-gray-200"
                  onPress={() => {
                    setGroupName({name: item.name, id: item.id}); // setGroupName(item.name);
                    setShowGroupDropdown(false);
                  }}
                
                >

            {item.profile_picture_url ? 
            (<Image className='w-10 h-10 rounded-full mr-4'
          source={{ uri: item.profile_picture_url }}>
          </Image>
      ): (
        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-4">
      </View>
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
    </>
  );
}