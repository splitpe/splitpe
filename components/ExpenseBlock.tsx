import { useEffect, useState } from "react";
import { View,Text,TouchableOpacity, Alert } from "react-native";
import { supabase } from "~/utils/supabase";
import { expenseCategories } from "~/types/expensetype";
import { Colors } from "~/types/colors";
import { Foundation } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";

import AntDesign from '@expo/vector-icons/AntDesign';

export default function ExpenseBlock({ id, groupID }) {

    const [expense, setExpense] = useState(null);
    const [payers, setPayers] = useState([]);
    const [splits, setSplits] = useState([]);
    const [expenseCategory, setExpenseCategory] = useState(null);
    const router = useRouter();
    function ExpenseCategroriesFilter(item) {
        return expenseCategories.filter((i) => i.name === item)[0];
    }
    useEffect(() => {
        const loadExpense = async () => {
          const { data, error } = await supabase
            .from("expenses")
            .select(`
              *,
              payers: expense_payments (
                id,
                paid_amount,
                profiles: user_id (
                  id,
                  full_name
                )
              ),
              splits: expense_splits (
                id,
                split_amount,
                profiles: user_id (
                  id,
                  full_name
                )
              )
            `)
            .eq("id", id);
    
          if (error) {
            console.error(error);
          } else {
            setExpense(data[0]);
            setPayers(data[0].payers);
            setSplits(data[0].splits);
            console.log(data[0].category)
            console.log(ExpenseCategroriesFilter(data[0].category));
            setExpenseCategory(ExpenseCategroriesFilter(data[0].category));
          }
        };
    
        loadExpense();
      }, [id]);
      
    if (!expense) {
      return <Text>Loading...</Text>;
    }


    const handleDeleteTransaction = async (expenseId, groupId) => {



      Alert.alert(
        'Delete Transaction',
        'Are you sure you want to delete this transaction?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              try {
                // Step 1: Get all the expense details, including payments and splits
                const { data: expenseDetails, error: expenseError } = await supabase
                  .from('expenses')
                  .select('*')
                  .eq('id', expenseId)
                  .single();
            
                if (expenseError) throw expenseError;
            
                const { data: payments, error: paymentsError } = await supabase
                  .from('expense_payments')
                  .select('*')
                  .eq('expense_id', expenseId);
            
                if (paymentsError) throw paymentsError;
            
                const { data: splits, error: splitsError } = await supabase
                  .from('expense_splits')
                  .select('*')
                  .eq('expense_id', expenseId);
            
                if (splitsError) throw splitsError;
            
                // Step 2: Calculate and reverse balances
                const totalAmount = expenseDetails.amount;
            
                // Create a set of all users involved
                const allUsers = new Set([
                  ...payments.map(p => p.user_id),
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
            
                // Calculate what each person paid (to be reversed)
                const paidAmounts = {};
                payments.forEach(payment => {
                  paidAmounts[payment.user_id] = parseFloat(payment.paid_amount);
                });
            
                // Calculate what each person owed (to be reversed)
                const owedAmounts = {};
                splits.forEach(split => {
                  owedAmounts[split.user_id] = parseFloat(split.owed_amount);
                });
            
                // Calculate reverse balances (negative of original balances)
                for (const payerId of allUsers) {
                  for (const owerId of allUsers) {
                    if (payerId !== owerId) {
                      const paidAmount = paidAmounts[payerId] || 0;
                      const owedAmount = owedAmounts[owerId] || 0;
                      
                      // Calculate the share this owner owed to this payer (negative to reverse)
                      const shareOfPayment = -((paidAmount / totalAmount) * owedAmount);
                      if (shareOfPayment !== 0) {
                        balanceMatrix[payerId][owerId] += shareOfPayment;
                        balanceMatrix[owerId][payerId] -= shareOfPayment;
                      }
                    }
                  }
                }
            
                // Update balances in database with reversed amounts
                for (const userId of allUsers) {
                  for (const otherId of Object.keys(balanceMatrix[userId])) {
                    const balanceAmount = balanceMatrix[userId][otherId];
                    if (balanceAmount !== 0) {
                      // Get existing balance
                      const { data: existingBalance, error: balanceError } = await supabase
                        .from('balances')
                        .select()
                        .eq('user_id', userId)
                        .eq('balance_with_user_id', otherId)
                        .eq('group_id', groupId)
                        .single();
            
                      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;
            
                      if (existingBalance) {
                        // Update existing balance with reversed amount
                        await supabase
                          .from('balances')
                          .update({
                            amount: existingBalance.amount + balanceAmount,
                            last_updated: new Date().toISOString()
                          })
                          .eq('id', existingBalance.id);
                      }
                    }
                  }
                }
            
                // Step 3: Delete the expense and related records
                // Delete expense_splits
                const { error: deleteSplitsError } = await supabase
                  .from('expense_splits')
                  .delete()
                  .eq('expense_id', expenseId);
            
                if (deleteSplitsError) throw deleteSplitsError;
            
                // Delete expense_payments
                const { error: deletePaymentsError } = await supabase
                  .from('expense_payments')
                  .delete()
                  .eq('expense_id', expenseId);
            
                if (deletePaymentsError) throw deletePaymentsError;
            
                // Delete the expense
                const { error: deleteExpenseError } = await supabase
                  .from('expenses')
                  .delete()
                  .eq('id', expenseId);
            
                if (deleteExpenseError) throw deleteExpenseError;
            
                Alert.alert('Success', 'Transaction deleted successfully');
                return true;
              } catch (error) {
                console.error('Error deleting transaction:', error);
                Alert.alert('Error', 'Failed to delete transaction');
                return false;
              }
        
              



            },
          },
        ],
        { cancelable: false }
      )
    };
  



    return (
<View className="bg-white rounded-xl m-4 p-4 shadow-lg">

  <View className="flex-row items-center mb-3 border-b border-gray-200">
    
  <View
      className="flex-row items-center py-2"
    >
        {expenseCategory?(<View className="w-16 h-16 bg-primary-light rounded-full items-center justify-center mr-3">
        <expenseCategory.iconSet name={expenseCategory.icon} size={24} color={Colors.primary.DEFAULT} />
      </View>
      ):(<View className="w-10 h-10 bg-primary-light rounded-full items-center justify-center mr-3"/>)}
    </View>

    <Text className="flex-1 text-lg font-poppinsBold">{expense.description}</Text>
    <Text className="text-lg font-poppinsBold">₹ {expense.amount}</Text>
  </View>
  <Text className="text-primary-dark text-md font-poppinsSemiBold mb-4">Paid by</Text>
  {payers.map((payer) => (
  <View key={payer.profiles.id} className="flex-row items-center mb-4">
    <View className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
    <Text className="flex-1 text-gray-500 font-sans">{payer.profiles?.full_name}</Text>
    <Text className="font-poppinsSemiBold">₹ {payer.paid_amount}</Text>
  </View>
  ))}
  <Text className="text-primary-dark text-md font-poppinsSemiBold mb-4">UnPaid bill</Text>
  {splits.map((split) => (
    <View key={split.profiles.id} className="flex-row items-center mb-2">
      <View className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
      <Text className="flex-1 text-gray-500 font-sans">{split.profiles?.full_name}</Text>
      <Text className="text-gray-500 font-sans">₹ {split.split_amount}</Text>
    </View>
  ))}
  <View className="flex-row gap-4">
    <TouchableOpacity onPress={() => router.navigate(`/(expense)/EditExpense?expenseID=${id}`)} className="flex-row mt-4 bg-primary justify-center px-4 py-2 rounded-full items-center gap-3">
<Text className="text-primary-light">Edit</Text>
<Foundation name="page-edit" size={14} color={Colors.primary.light} />
</TouchableOpacity>
<TouchableOpacity onPress={() => handleDeleteTransaction(id,groupID)} className="flex-row mt-4 bg-red-400 justify-center px-4 py-2 rounded-full items-center gap-3">
<Text className="text-primary-light">Delete</Text>
<AntDesign name="delete" size={14} color={Colors.primary.light} /></TouchableOpacity>
</View>
</View>
    );
}