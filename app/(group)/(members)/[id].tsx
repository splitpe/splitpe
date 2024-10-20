import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable,SafeAreaView,ScrollView,StyleProp, TextStyle  } from 'react-native'
import { Alert,Text, StyleSheet, View, AppState,TextInput,Button } from 'react-native'
import { supabase } from '~/utils/supabase'
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity, Image } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useAuth } from '~/contexts/AuthProvider';
import Avatar from '~/components/Avatar'
import PhoneInput, { isValidNumber } from "react-native-phone-number-input";
import {CountryCodeList} from '~/types/courtypicker';
import CurrencyPicker, { currencies } from '~/components/Currencypicker'
import CustomStackScreen from '~/components/CustomStackScreen';
import { Colors } from '~/types/colors';
import { generateSignedUrl } from '~/helper/functions';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';





// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function CreateMember() {
  const [Membername, setGoupName] = useState('')
  const [Group, setGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState(currencies[0]);
  const [avatarUrl, setAvatarUrl] = useState('')
  const { user } = useAuth();


  const params = useLocalSearchParams();
  const groupId = params.id;

 useEffect(() => {
  setLoading(true);
    const fetchGroup = async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, profile_picture_url, currency, new_id,created_at,created_by')
        .eq('id', groupId)
        .single();

        if (error) {
          console.error(error);
        } else {
          const GroupSignedUrl = await generateSignedUrl('avatars', data.profile_picture_url, 3600);

      if (GroupSignedUrl) {
        data.profile_picture_url = GroupSignedUrl;
      }
      console.log("Date in fetch Group",data);
      setGroup(data);
        }
    }

    fetchGroup();
    
    setLoading(false);
  }, []);




  const [groupMembers, setGroupMembers] = useState<Member[]>([])

  const [invitedMembers, setInvitedMembers] = useState<Member[]>([])

  useEffect(() => {
    const fetchGroupMembers = async () => {
      const { data, error } = await supabase
      .from('invitations')
      .select('user_id, group_id,inviter_id,user:profiles!invitations_user_id_fkey(full_name,avatar_url)')
      .eq('group_id', groupId)
      .eq('status', 'pending')
      if (error) {
        console.error(error);
      }
      else {

        const updatedInvitedMembers = await Promise.all(data.map(async (item) => {
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


        console.log('Invited Member in fetchGroupMembers',data);
        setInvitedMembers(updatedInvitedMembers);
      }
    }
    fetchGroupMembers();
  }, [])

  const renderMember = ({ item }: { item: Member }) => (
    <View className="flex-row items-center mb-2 p-2 border border-gray-200 bg-white rounded-lg">
      {item.user.avatar_url ? (
        <Image className='w-10 h-10 rounded-full mr-4'
          source={{ uri: item.user.avatar_url }}></Image>
      ): (
        <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-4">
      </View>
      )}
      <Text className="text-lg">{item.user?.full_name}</Text>
      <MaterialIcons className='ml-auto' name="delete-forever" size={24} color={Colors.primary.DEFAULT} />
    </View>
  )





return (<View className="flex-1 justify-center bg-white py-4">
  <CustomStackScreen />
  
  {loading? <ActivityIndicator size="large" color={Colors.primary.DEFAULT}/>
  : (<>
   
    <SafeAreaView className="flex-1 bg-white">
      
      <ScrollView className="flex-1">
        <View className="items-center mb-6 gap-3">
          <Image
      source={{ uri: Group.profile_picture_url }}
      className="w-36 h-36 rounded-full" />

          <Text className="text-xl font-semibold">{Group.name}</Text>
        </View>
        
        <View className="px-4">
          <TouchableOpacity className="flex-row justify-between items-center bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg">Currency</Text>
            <View className="flex-row items-center">
              <Text className="text-lg text-gray-500 mr-2">{Group.currency}</Text>
              <Text className="text-lg text-gray-500">{currencies.find((c) => c.code === Group.currency)?.symbol}</Text>
            </View>
          </TouchableOpacity>
        
          
          <View className="p-2">
  <Text className="text-2xl font-bold mb-4">Group Members</Text>
  <TouchableOpacity
    onPress={() => router.navigate('/(group)/(members)/(addmembers)/'+groupId)}
    className="flex-row items-center mb-1 p-2 bg-green-500 rounded-lg"
  >
    <View className='flex-row items-center gap-2 p-2'>
    <AntDesign name="pluscircle" size={36} color="white" />
    <Text className="text-white text-lg">Add Member</Text></View>
  </TouchableOpacity>
  {groupMembers.length > 0 ? (
  groupMembers.map((member, index) => (
    <View key={member.id} className="gap-1">
      {renderMember({ item: member })}
    </View>
  ))
  ): (
    <Text className="text-gray-500 bg-gray-100 rounded-lg my-2 text-center p-10">No members</Text>
  )}
  <Text className="text-2xl font-bold mt-6 mb-4">Invited Members</Text>
  {invitedMembers.length > 0 ? (
  invitedMembers.map((member, index) => (
    <View key={member.user_id} className="gap-1">
      {renderMember({ item: member })}
    </View>
  ))): (
    <Text className="text-gray-500 bg-gray-100 rounded-lg my-2 text-center p-10">No invited members</Text>
  )}
</View>
          
          
          <TouchableOpacity className="flex-row mb-2 p-2 justify-center gap-5 items-center bg-red-500 rounded-lg">
            <Text className="text-white text-lg">Leave list</Text>
            <MaterialIcons name="exit-to-app" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    
    </>
)
}
    
  </View>
  )







}

