import React, { useState } from 'react';
import { View, Text, Switch, FlatList, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';


type Message = {
  id: string;
  text: string;
  timestamp: string;
};

type MessageReaderProps = {
  messages: Message[];
  onCreateTransaction: (message: Message) => void;
};

const MessageItem = ({ message, onCreateTransaction }: { message: Message; onCreateTransaction: () => void }) => (
  <View className="bg-white rounded-lg shadow-md p-4 mb-3">
    <Text className="text-gray-800 text-base mb-2">{message.text}</Text>
    <View className="flex-row justify-between items-center">
      <Text className="text-gray-500 text-sm">{new Date(message.timestamp).toLocaleString()}</Text>
      <View className="flex-row gap-2">
      <TouchableOpacity
        className="bg-green-500 rounded-full p-2"
        onPress={onCreateTransaction}
      >
        <Ionicons name="add" size={20} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-red-500 rounded-full p-2"
        onPress={onCreateTransaction}
      >
        <Ionicons name="close-outline" size={20} color="white" />
      </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function MessageReader({ messages, onCreateTransaction }: MessageReaderProps) {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-gray-800">Message Reader</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
      {isEnabled ? (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageItem
              message={item}
              onCreateTransaction={() => onCreateTransaction(item)}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">No messages to display</Text>
            </View>
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Toggle switch to read messages</Text>
        </View>
      )}
    </View>
  );
}