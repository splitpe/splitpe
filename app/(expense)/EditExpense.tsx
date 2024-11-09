import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal, FlatList, Alert } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { expenseCategories } from '~/types/expensetype';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '~/types/colors';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/contexts/AuthProvider';
import { generateSignedUrl } from '~/helper/functions';
import CustomStackScreen from '~/components/CustomStackScreen';
import { useLocalSearchParams } from 'expo-router';

export default function EditExpenseScreen() {
    const [groupMembers, setGroupMembers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [groupID,setGroupID] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('0.00');
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [showExpenseTypeModal, setShowExpenseTypeModal] = useState(false);
    const [selectedExpenseType, setSelectedExpenseType] = useState(expenseCategories[0]);
    const [payers, setPayers] = useState([]);
    const [splits, setSplits] = useState([]);
    const [splitType, setSplitType] = useState('unequal'); // 'equal', 'unequal', 'percentage'
    const [showPayerModal, setShowPayerModal] = useState(false);
    const [groups, setGroups] = useState([]);
    const { user } = useAuth();

    // New state for tracking the expense to be edited
    const [expenseId, setExpenseId] = useState(null);

    const { expenseID } = useLocalSearchParams();

    // Fetch expense details when the screen loads
    useEffect(() => {
        const fetchExpenseDetails = async () => {
            if (!expenseID) {
                Alert.alert('Error', 'No expense selected for editing');
                return;
            }

            try {
                console.log("Expense ID",expenseID)
                // Fetch expense details
                const { data: expenseData, error: expenseError } = await supabase
                    .from('expenses')
                    .select('*, expense_payments(*), expense_splits(*), groups(*)')
                    .eq('id', parseInt(expenseID))
                    .single();

                if (expenseError) throw expenseError;

                // Set basic expense details
                setExpenseId(expenseData.id);
                setGroupName({ name: expenseData.groups.name, id: expenseData.group_id });
                setGroupID(expenseData.group_id);
                setDescription(expenseData.description);
                setAmount(expenseData.amount.toString());
                
                // Set expense type
                const matchedExpenseType = expenseCategories.find(cat => cat.name === expenseData.category);
                if (matchedExpenseType) setSelectedExpenseType(matchedExpenseType);

                // Fetch and set payers
                const payerDetails = await Promise.all(expenseData.expense_payments.map(async (payment) => {
                    const { data: userData, error: userError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', payment.user_id)
                        .single();

                    if (userError) throw userError;

                    return {
                        user:userData,
                        amount: payment.paid_amount.toString(),
                        group_id: payment.group_id
                    };
                }));
                console.log("Payers Details",payerDetails);
                setPayers(payerDetails);

                // Fetch and set splits
                const splitDetails = await Promise.all(expenseData.expense_splits.map(async (split) => {
                    const { data: userData, error: userError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', split.user_id)
                        .single();

                    if (userError) throw userError;

                    return {
                        user:userData,
                        amount: split.split_amount.toString(),
                        percentage: (split.owed_amount / expenseData.amount * 100).toFixed(2),
                        split_type: split.split_type
                    };
                }));

                console.log("Split Details",splitDetails);
                setSplits(splitDetails);
                setSplitType(splitDetails[0]?.split_type || 'equal');

            } catch (error) {
                console.error('Error fetching expense details:', error);
                Alert.alert('Error', 'Failed to load expense details');
            }
        };

        fetchExpenseDetails();
    }, [expenseID]);

    // Fetch group members when group is selected
    useEffect(() => {
        const fetchGroupMembers = async () => {
            if (!groupName.id) return;

            try {
                const { data, error } = await supabase
                    .from('user_groups')
                    .select('id, user_id, group_id, user:profiles!user_groups_user_id_fkey(full_name, avatar_url,id)')
                    .eq('group_id', groupName.id);

                if (error) throw error;

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
                console.log('Updated group members in EditExpense:', updatedGroupMembers);
                setGroupMembers(updatedGroupMembers);
            } catch (error) {
                console.error('Error fetching group members:', error);
            }
        };

        fetchGroupMembers();
    }, [groupName]);

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


      const handleAddPayer = (selectedPayer) => {
        if (!payers.some(payer => payer.user.id === selectedPayer.user.id)) {
          setPayers([...payers, { ...selectedPayer, amount: '0.00' }]);
        }
        setShowPayerModal(false);
      };
    
      const handlePayerChange = (id, field, value) => {
        setPayers(payers.map(payer => 
          payer.user.id === id ? { ...payer, [field]: value } : payer
        ));
      };

      const handleSplitChange = (id, field, value) => {
        setSplits(splits.map(split => {
          if (split.user.id === id) {
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
    
    
    

    // Handle updating the expense
    const handleUpdateExpense = async () => {
        // Validation checks (similar to add expense)
        const totalAmount = parseFloat(amount);
        if (totalAmount <= 0) {
            return Alert.alert('Please enter a valid amount.');
        }
        if (splits.length === 0) {
            return Alert.alert('Please add at least one split.');
        }
        if (payers.length === 0) {
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

        console.log('Updating expense with ID:', expenseId);
        console.log('Payers:', payers);
        console.log('Splits:', splits);
        //return
        try {
            // Update expense
            const { error: expenseError } = await supabase
                .from('expenses')
                .update({
                    category: selectedExpenseType.name,
                    amount: totalAmount,
                    description
                })
                .eq('id', expenseId);

            if (expenseError) throw expenseError;

            // Delete existing payments and splits
            await supabase.from('expense_payments').delete().eq('expense_id', expenseId);
            await supabase.from('expense_splits').delete().eq('expense_id', expenseId);

            // Insert new payments
            const paymentsData = payers.map((payer) => ({
                expense_id: expenseId,
                user_id: payer.user.id,
                group_id: groupName.id,
                paid_amount: payer.amount,
            }));

            const { error: paymentError } = await supabase
                .from('expense_payments')
                .insert(paymentsData);

            if (paymentError) throw paymentError;

            // Insert new splits
            const splitsData = splits.map((split) => {
                const userOwed =
                    splitType === 'percentage'
                        ? (parseFloat(split.percentage) / 100) * totalAmount
                        : splitType === 'unequal'
                        ? parseFloat(split.amount)
                        : totalAmount / splits.length;

                return {
                    expense_id: expenseId,
                    user_id: split.user.id,
                    group_id: groupName.id,
                    split_type: splitType,
                    split_amount: split.amount,
                    owed_amount: userOwed,
                };
            });

            const { error: splitError } = await supabase
                .from('expense_splits')
                .insert(splitsData);

            if (splitError) throw splitError;

            Alert.alert('Expense updated successfully!');
            // Optionally navigate back or reset form
        } catch (error) {
            console.error('Error updating expense:', error);
            Alert.alert('Error updating expense');
        }
    };

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
            const filteredGroups = updatedGroups.filter((g) => g.id.toString() === groupID.toString());
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
    }, [groupID]);
  




    // Render methods and UI components remain mostly the same as in AddExpenseScreen
    // (Include renderMember, renderExpenseTypeItem, and other UI components from the original screen)
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
    
      useEffect(() => {
        if (splitType === 'equal') {
          const equalAmount = (parseFloat(amount) / groupMembers.length).toFixed(2);
          const equalPercentage = (100 / groupMembers.length).toFixed(2);
          setSplits(groupMembers.map(member => ({ ...member, amount: equalAmount, percentage: equalPercentage })));
        }
      }, [amount, splitType, groupMembers]);
    


    return (
        <>
           
           <ScrollView className="flex-1 bg-white px-4 pt-6 pb-20">
           <CustomStackScreen />
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
            <View key={payer.user?.id} className="flex-row gap-2 space-x-2 mb-4">
              <View className="flex-1 bg-primary-light rounded-lg px-4 py-3">
                <Text className="text-lg text-primary-dark">{payer.user?.full_name}</Text>
              </View>
              <View className="flex-1 bg-primary-light rounded-lg px-4 py-3">
                <TextInput
                  placeholder="0.00"
                  value={payer.amount}
                  onChangeText={(value) => handlePayerChange(payer.user.id, 'amount', value)}
                  keyboardType="numeric"
                  className="text-lg text-primary-dark"
                />
              </View>
              <TouchableOpacity className="items-center justify-center" onPress={() => setPayers(payers.filter((p) => p.user.id !== payer.user.id))}>
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
              <View key={split.user?.id} className="flex-row items-center justify-between">
                <Text className="text-lg text-primary-dark">{split.user?.full_name}</Text>
                <View className="flex-row items-center gap-2 space-x-2">
                  {splitType !== 'equal' && (
                    <TextInput
                      placeholder={splitType === 'percentage' ? '0%' : '0.00'}
                      value={splitType === 'percentage' ? split.percentage : split.amount}
                      onChangeText={(value) => handleSplitChange(split.user?.id, splitType === 'percentage' ? 'percentage' : 'amount', value)}
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
    
          <TouchableOpacity onPress={() => handleUpdateExpense()}
            className="bg-primary rounded-lg py-3 mt-6 mb-12 "        
          >
            <Text className="text-center text-lg font-semibold text-primary-light">Update Transaction</Text>
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