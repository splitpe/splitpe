import { Stack, useNavigation,router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView,Image,RefreshControl, Text,ScrollView, StyleSheet, TouchableOpacity, View, Pressable, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import GroupItem from "~/components/GroupItem";
import Checkbox from 'expo-checkbox';
import { supabase } from '~/utils/supabase';
import { Colors } from '~/types/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '~/contexts/AuthProvider';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { FloatingAction } from 'react-native-floating-action';
import { generateSignedUrl } from '~/helper/functions';
import CustomStackScreen from '~/components/CustomStackScreen';

const FeatureItem = ({ text }) => (
  <View className='flex-row items-center gap-3 p-2'>
    <Checkbox value={true}></Checkbox>
    <Text className='text-lg' >{text}</Text>
  </View>
);

export default function Home() {

  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    console.log("refresh");

    setRefreshing(true);
    async function getGroupDetails(userId: string) {
      const { data, error } = await supabase
        .from('user_groups')
        .select('groups(*)')
        .eq('user_id', userId)
    
      if (error) {
        console.error(error);
      }
      else {
        console.log(data);
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


        setGroups(updatedGroups);

      }
    }

    getGroupDetails(user.id);

    setRefreshing(false);

  }, [refreshing]);


  async function getGroupDetails(userId: string) {
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, profile_picture_url, currency')
      .eq('created_by', userId)
  
    if (error) {
      console.error(error);
      return null;
    }
  
    return data;
  }



const actions = [
  {
    text: "Group Creation",
    icon: <MaterialCommunityIcons name="account-group" size={24} color="white" />,
    name: "bt_group_creation",
    position: 3,
    color: '#2EC7AB',
    buttonSize:50,
    textStyle: {
      fontSize: 16,
    },
  },
  {
    text: "New Transaction",
    icon: <FontAwesome name="credit-card" size={24} color="white" />,
    name: "bt_accessibility",
    position: 2,
    color: '#EA638C',
    buttonSize:50,
    textStyle: {
      fontSize: 16,
    },
  },
  {
    text: "Scan Group QR Code",
    icon: <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />,
    name: "bt_qr_code",
    position: 1,
    color: '#257180',
    buttonSize:50,
    textStyle: {
      fontSize: 16,
    },
  },

];

  

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
        console.log(data);
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


        setGroups(updatedGroups);

      }
    }

    getGroupDetails(user.id);
  }, []);

  return (
    <>
       <CustomStackScreen />
      
       <SafeAreaView className="flex-1 bg-primary ">
      <View className="flex-1 ">
        
        
        <FlatList className="flex-1 bg-gray-100  mt-10 rounded-t-3xl px-4 pt-4"
        data={groups}
        keyExtractor={(item) => item.id.toString()} // Adjust depending on the table's unique key
        renderItem={({ item }) => (
          <GroupItem group={item} index={item.id}></GroupItem>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center mt-auto bg-primary-light p-5 m-6 rounded-xl mb-auto">
            <Text className="text-primary-dark text-lg font-bold">NO TEAMS FOUND!</Text>
          </View>
        }
      />
      
        
     
      </View>

      

      <FloatingAction
    actions={actions}
    onPressItem={name => {
      console.log(`selected button: ${name}`);
      if(name == "bt_group_creation"){
        router.navigate('/(group)/newgroup')
      }
      else if(name == "bt_accessibility"){
        router.navigate('/(expense)/AddExpense')
      }
      else if(name == "bt_qr_code"){
        router.navigate('/(group)/scanaddgroup')
      }
    }}
    color={Colors.primary.DEFAULT}
  />

    </SafeAreaView>




       
     

    </>
  );


  
}




