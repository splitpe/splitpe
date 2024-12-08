import React, { useEffect, useState } from 'react';
import { Text, View, FlatList } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';

const BankMessageReader = () => {
  const [bankMessages, setBankMessages] = useState([]);

  useEffect(() => {
    const subscription = SmsListener.addListener(message => {
      // Regex to capture account info, amount, and transaction type (credit or debit)
      const bankMessageRegex = /\b(A\/c\s\*\d+)\s(\d+(\.\d{1,2})?)\s(credited|debited)\sfor\sRs:\s?(\d+(\.\d{1,2})?)\b/;
      const match = message.body.match(bankMessageRegex);

      if (match) {
        const [ , account, amountStr, , type, amountFormatted ] = match;
        
        const formattedMessage = {
          id: message.id,
          text: message.body,
          account,
          amount: parseFloat(amountFormatted || amountStr),
          timestamp: new Date().toLocaleString(),
          type: type.toLowerCase(),  // "credited" or "debited"
        };

        setBankMessages(prevMessages => [...prevMessages, formattedMessage]);
      }
    });

    return () => subscription.remove();
  }, []);

  const renderMessage = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1 }}>
      <Text>Text: {item.text}</Text>
      <Text>Amount: {item.amount}</Text>
      <Text>Timestamp: {item.timestamp}</Text>
      <Text>Type: {item.type}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Bank Transactions</Text>
      <FlatList
        data={bankMessages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default BankMessageReader;
