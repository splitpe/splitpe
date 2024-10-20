import React, { useState, useEffect } from 'react';
import { View, Text,Image, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { supabase } from '~/utils/supabase';
import { Colors } from '~/types/colors';
import UserItem from '~/components/UserItem';
// Sample user data
const initialUsers = [
];

export default function UserSearchList(props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [fullusers, setFullusers] = useState(initialUsers);
  var group_id = props.group_id;
  if (!group_id) {
    group_id = 23;
  }
  

  const generateSignedUrl = async (bucketName, fileName, expiresIn) => {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(fileName,expiresIn); // expiresIn is in seconds
  
    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    //console.log(data.signedUrl);
    return data.signedUrl;
  };
  

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');
  
      if (error) {
        console.log('Error fetching users:', error.message);
      } else {
        const updatedUsers = await Promise.all(data.map(async (user) => {
          if (user.avatar_url) {
            const avatarSignedUrl = await generateSignedUrl('avatars', user.avatar_url, 3600);
            return {
              ...user,
              avatar_url: avatarSignedUrl,
              
            };
          }
          return user;
        }));
  
        setFullusers(updatedUsers);
        setUsers(updatedUsers);
      }
    };
  
    fetchUsers();
  }, []);

  useEffect(() => {
    const filteredUsers = fullusers.filter(user =>
        user && user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setUsers(filteredUsers);
  }, [searchQuery]);

  const renderUserItem = ({ item }) => {


    const isInvited = item?.status === 'pending' || item?.status === 'accepted';


    return(
    <TouchableOpacity 
      className="p-4 border-b border-gray-200"
      onPress={() => console.log('User selected:', item.full_name)}
    >
       <View className="flex-row items-center gap-3">
      {item.avatar_url ? (
        <Image 
        source={{ uri: item.avatar_url }}
          //src={{ uri: item.avatar_url.publicUrl }} 
          className="w-16 h-16 rounded-full"
        />
       // <Text>{item.avatarUrl}</Text>
      ) : (
        <View className=" bg-gray-300 w-12 h-12 rounded-full flex justify-center items-center"></View>
      )}
      <View className='flex-1'>
        <View className='flex-row justify-between items-center'>
      <Text className="text-lg text-gray-800">{item.full_name}</Text>
      <View className='flex-row items-center text-center'>
      <Text>Invite</Text>
      <MaterialIcons name="send-to-mobile" size={32} color={Colors.primary.DEFAULT}/></View>
      </View>
      </View>
      </View>
    </TouchableOpacity>)
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 bg-gray-100">
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-4 py-2"
          placeholder="Search users...🔎"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search users by full name"
        />
      </View>
      {/* <FlatList
        data={users}
        renderItem={UserItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View className="p-4">
            <Text className="text-center text-gray-500">No users found</Text>
          </View>
        }
      /> */}

      {users.length > 0 ? (
        <ScrollView>
{users.map((user) => (
  
  <UserItem
    key={user.id}
    item={user}
    groupId={group_id}
  />
))}</ScrollView>
      ): (
                  <View className="p-4">
                  <Text className="text-center text-gray-500">No users found</Text>
                </View>
      
     )} 
    </View>
  );
}