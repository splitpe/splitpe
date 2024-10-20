import React, { useEffect, useState } from 'react';
import {  View,Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import QRCodeModal from '~/components/QRCodeModal';
import { generateSignedUrl } from '~/helper/functions';
import { Colors } from '~/types/colors';
import { supabase } from '~/utils/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';


export default function GroupScreen(props) {
  const [activeTab, setActiveTab] = useState('Expenses');
  const [modalVisible, setModalVisible] = useState(false);
  const [groupItem, setGroupItem] = useState(null);
 
  const logoFromFile = require('../assets/Logo.png');

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };

  useEffect(() => {
    setActiveTab('Expenses');
    async function getGroupDetails(groupId: string) {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, profile_picture_url, currency, new_id,created_at,created_by')
        .eq('id', groupId)
        .single();
    
      if (error) {
        console.error(error);
        setGroupItem(null);
      }
    
      
      const GroupSignedUrl = await generateSignedUrl('avatars', data.profile_picture_url, 3600);

      if (GroupSignedUrl) {
        data.profile_picture_url = GroupSignedUrl;
      }
      setGroupItem(data);
    }

// Use the groupId to fetch the group data
  getGroupDetails(props.id);
  }, []);
  
  return (
    groupItem ? (
    <View className="flex-1 bg-primary">
      <View>
        <TouchableOpacity onPress={() => router.navigate("/(group)/(members)/"+groupItem.id)} className="flex-row items-center px-2">
      <View className='m-4'>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
      <QRCode
      value={groupItem.new_id || 'Reload the App'} // Default QR code value if not passed
      logo={logoFromFile}
    />


    </TouchableOpacity>
    
    <QRCodeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        
        qrValue={groupItem.new_id || 'Reload the App'} // Replace with dynamic QR code data
      />


    </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-center gap-2 bg-primary-light rounded-full py-1 px-1 mb-2 z-10">
            <View className="w-16 h-16 rounded-full bg-white mr-2 z-0" >
              <Image
                source={{ uri: groupItem.profile_picture_url }}
                className="w-14 h-14 rounded-full"
              />
            </View>
            <Text className="flex-1 bg-primary-light rounded-r-full font-bold text-primary">{groupItem.name}</Text>
          </View>
          <View className='pb-4 px-8 '>
          <Text className="text-white mb-1">Created by You</Text>
          <Text className="text-white mb-1">{new Date(groupItem.created_at).toLocaleString()}</Text>
          <TouchableOpacity className='text-white flex-row items-center  gap-2' onPress={() => copyToClipboard(groupItem.new_id)}>
               <Text className='text-white'>Team ID:{groupItem.new_id}</Text>
               <Ionicons name="copy" size={20} color="white" />
          </TouchableOpacity>
          </View>
        </View>

        </TouchableOpacity>
      </View>

      <View className=" bg-white rounded-t-3xl">
  <View className='flex-row justify-center m-3  items-center rounded-full shadow-xl bg-gray-100 mt-3'>
    {['Expenses', 'Balances'].map((tab) => (
      <TouchableOpacity
        key={tab}
        className={`flex-1 py-3 rounded-full items-center ${activeTab === tab ? 'bg-primary-light text-white rounded-full' : ''}`}
        onPress={() => setActiveTab(tab)}
      >
        <Text className={`font-bold ${activeTab === tab ? 'text-primary' : 'text-gray-500'}`}>
          {tab}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

      <ScrollView className="flex-1 bg-white">
        {activeTab === 'Expenses' ? (
          <View className="bg-white rounded-xl m-4 p-4 shadow-lg">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 rounded-full border-2 border-gray-300 mr-3" />
              <Text className="flex-1 text-lg font-bold">Manali tour</Text>
              <Text className="text-lg font-bold">₹ 1800</Text>
            </View>
            <Text className="text-gray-500 mb-2">Paid by</Text>
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
              <Text className="flex-1">Sunny</Text>
              <Text className="font-bold">₹ 1440</Text>
            </View>
            <Text className="text-gray-500 mb-2">UnPaid bill</Text>
            {['Eric', 'Jhon', 'Luther', 'Raju'].map((name) => (
              <View key={name} className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                <Text className="flex-1">{name}</Text>
                <Text className="text-gray-500">₹ 360</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-xl m-4 p-4 shadow-md">
            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-lg">You get</Text>
                <Text className="text-lg font-bold text-green-500">₹ 1440</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-lg">You owed</Text>
                <Text className="text-lg font-bold text-red-500">-₹ 350</Text>
              </View>
            </View>
            <Text className="text-gray-500 mb-2">Balances</Text>
            {[
              { name: 'Eric', amount: 360, color: 'text-green-500' },
              { name: 'Jhon', amount: -360, color: 'text-red-500' },
              { name: 'Luther', amount: -360, color: 'text-red-500' },
              { name: 'Raju', amount: 360, color: 'text-green-500' },
            ].map(({ name, amount, color }) => (
              <View key={name} className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
                <Text className="flex-1">{name}</Text>
                <Text className={`font-bold ${color}`}>
                  {amount > 0 ? '₹ ' : '-₹ '}{Math.abs(amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity className="absolute right-4 bottom-4 w-14 h-14 rounded-full bg-blue-900 justify-center items-center">
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  ):(<View className='flex-1 justify-center items-center'>
    <ActivityIndicator color={Colors.primary.DEFAULT} size={'large'}></ActivityIndicator>
  </View>));
};

