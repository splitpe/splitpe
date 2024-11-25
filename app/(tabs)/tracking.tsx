import { Stack } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, View,Text } from 'react-native';
import AddExpenseScreen from '~/components/AddExpense3';
import CustomStackScreen from '~/components/CustomStackScreen';
import { dummyMessages } from '~/components/dummydata';
import MessageReader from '~/components/MessageReader';
import TransactionListener from '~/components/TransactionListener';


export default function Home() {
  const [messages, setMessages] = useState(dummyMessages);

  const handleCreateTransaction = (message: any) => {
    // Parse the message to extract expense details
    const expenseRegex = / ₹(\d+) for (.+)/;
    const incomeRegex = /Received ₹(\d+) from (.+) for (.+)/;
    let newActivity;

    const expenseMatch = message.text.match(expenseRegex);
    const incomeMatch = message.text.match(incomeRegex);

    if (expenseMatch) {
      console.log("Expense Match",expenseMatch); 
    } else {
      console.log('Unable to parse message:', message.text);
      return;
    }

    setMessages(messages.filter(m => m.id !== message.id));
    console.log('Transaction created from message:', message);
  };


  
  return (
    <>
<CustomStackScreen />
      <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-primary items-center justify-center p-4">
        <Text className="text-2xl font-interBold text-white">Expense Tracker</Text>
      </View>
      <TransactionListener ></TransactionListener>
    </SafeAreaView>

     </>
  );
}
