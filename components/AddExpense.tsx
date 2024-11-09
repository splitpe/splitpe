import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AntDesign, Feather, FontAwesome, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { expenseCategories } from '~/types/expensetype';



export default function AddExpenseScreen() {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0.00');
  const [paidBy, setPaidBy] = useState('You');
  const [date, setDate] = useState('Sep 7, 2024');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showExpenseTypeModal, setShowExpenseTypeModal] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);

  const groups = ['Family', 'Friends', 'Work', 'Travel', 'Family', 'Friends', 'Work', 'Travel', 'Family', 'Friends', 'Work', 'Travel', 'Family', 'Friends', 'Work', 'Travel', 'Family', 'Friends', 'Work', 'Travel', 'Family', 'Friends', 'Work', 'Travel'];

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
    <ScrollView className="flex-1 bg-white px-4 py-6">
      <Text className="text-3xl text-bg-dark font-bold mb-6">Add Expenses</Text>

      <View className="space-y-4 gap-3">
        <TouchableOpacity 
          className="bg-primary-light rounded-lg flex-row items-center justify-between px-4 py-3"
          onPress={() => setShowGroupDropdown(true)}
        >
          <Text className="text-lg text-primary-dark">
            {groupName || 'Group name'}
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
          <View className="bg-primary-light rounded-lg px-4 py-3">
            <Text className="text-lg text-primary-dark">INR</Text>
          </View>
        </View>
      </View>

      <View className="my-6 border-t border-gray-200" />

      <Text className="text-2xl font-semibold mb-4">Paid by</Text>

      <View className="flex-row gap-2 space-x-2 mb-4">
        <TouchableOpacity className="flex-1 bg-primary-light rounded-lg flex-row items-center justify-between px-4 py-3">
          <Text className="text-lg text-primary-dark">{paidBy}</Text>
          <Entypo name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-primary-light rounded-lg px-4 py-3">
          <Text className="text-lg text-primary-dark">{date}</Text>
        </TouchableOpacity>
      </View>

      <View className="space-y-4 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold">Split</Text>
          <TouchableOpacity className="bg-primary-light rounded-lg gap-3 px-3 py-2 flex-row items-center space-x-2">
          <FontAwesome5 name="users" size={18} color="#666" />
            <Text className="text-primary-dark">Split equally</Text>
          </TouchableOpacity>
        </View>
        {['Raju', 'Luther'].map((name, index) => (
          <View key={index} className="flex-row items-center justify-between">
            <Text className="text-lg text-primary-dark">{name}</Text>
            <View className="flex-row items-center gap-2 space-x-2">
              <Text className="text-lg text-primary-dark">0 x</Text>
              <View className="bg-primary-light rounded-lg px-3 py-2">
                <Text className="text-lg text-primary-dark">₹ 0.00</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

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
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={index}
                  className="py-3 border-b border-gray-200"
                  onPress={() => {
                    setGroupName(item);
                    setShowGroupDropdown(false);
                  }}
                >
                  <Text className="text-lg">{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
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
    </ScrollView>
  );
}