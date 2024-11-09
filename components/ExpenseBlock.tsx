import { useEffect, useState } from "react";
import { View,Text,TouchableOpacity } from "react-native";
import { supabase } from "~/utils/supabase";
import { expenseCategories } from "~/types/expensetype";
import { Colors } from "~/types/colors";
import { Foundation } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";



export default function ExpenseBlock({ id }) {

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



    return (
<View className="bg-white rounded-xl m-4 p-4 shadow-lg">

  <View className="flex-row items-center mb-2">
    
  <View
      className="flex-row items-center py-1"
    >
        {expenseCategory?(<View className="w-16 h-16 bg-primary-light rounded-full items-center justify-center mr-3">
        <expenseCategory.iconSet name={expenseCategory.icon} size={24} color={Colors.primary.DEFAULT} />
      </View>
      ):(<View className="w-10 h-10 bg-primary-light rounded-full items-center justify-center mr-3"/>)}
    </View>

    <Text className="flex-1 text-lg font-bold">{expense.description}</Text>
    <Text className="text-lg font-bold">₹ {expense.amount}</Text>
  </View>
  <Text className="text-gray-500 mb-2">Paid by</Text>
  {payers.map((payer) => (
  <View key={payer.profiles.id} className="flex-row items-center mb-4">
    <View className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
    <Text className="flex-1">{payer.profiles?.full_name}</Text>
    <Text className="font-bold">₹ {payer.paid_amount}</Text>
  </View>
  ))}
  <Text className="text-gray-500 mb-2">UnPaid bill</Text>
  {splits.map((split) => (
    <View key={split.profiles.id} className="flex-row items-center mb-2">
      <View className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
      <Text className="flex-1">{split.profiles?.full_name}</Text>
      <Text className="text-gray-500">₹ {split.split_amount}</Text>
    </View>
  ))}
    <TouchableOpacity onPress={() => router.navigate(`/(expense)/EditExpense?expenseID=${id}`)} className="flex-row mt-4 bg-primary mr-auto justify-center px-4 py-2 rounded-full items-center gap-3">
<Text className="text-primary-light">Edit</Text>
<Foundation name="page-edit" size={14} color={Colors.primary.light} />
</TouchableOpacity>
</View>
    );
}