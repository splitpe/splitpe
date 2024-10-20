import { Stack, useNavigation,router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView,Image, Text,ScrollView, StyleSheet, TouchableOpacity, View, Pressable, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import GroupItem from "~/components/GroupItem";
import Checkbox from 'expo-checkbox';
import { supabase } from '~/utils/supabase';
import { Colors } from '~/types/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '~/contexts/AuthProvider';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { FloatingAction } from 'react-native-floating-action';
import { color } from '@rneui/themed/dist/config';
import { generateSignedUrl } from '~/helper/functions';

const FeatureItem = ({ text }) => (
  <View className='flex-row items-center gap-3 p-2'>
    <Checkbox value={true}></Checkbox>
    <Text className='text-lg' >{text}</Text>
  </View>
);

export default function Home() {

   navigatconstion = useNavigation();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);

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
    position: 2,
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
    position: 1,
    color: '#EA638C',
    buttonSize:50,
    textStyle: {
      fontSize: 16,
    },
  },
];

  const [selectedOption, setSelectedOption] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

 useEffect(() => {
    async function getGroupDetails(userId: string) {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, profile_picture_url, currency')
        .eq('created_by', userId)
    
      if (error) {
        console.error(error);
      }
      else {

        const updatedGroups = await Promise.all(data.map(async (group) => {
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
    console.log(groups);
  }, []);

  return (
    <>
       <Stack.Screen options={{ title: 'Teams' ,
       headerTitle:'Splitpe', 
         headerRight: () => (
          <Menu>
          <MenuTrigger style={{paddingRight: 10}}>
          <Entypo name="dots-three-vertical" size={18} color="white" />
            </MenuTrigger>
          <MenuOptions>
          <MenuOption onSelect={() => supabase.auth.signOut()} >
            <View className='flex-row items-center justify-between'>
          <Text className='text-lg p-2 text-center'>Sign Out  
    
          </Text>
          <AntDesign name="login" size={18} color="black" />
          </View>
          </MenuOption>
            {/* <MenuOption onSelect={() => alert(`Save`)} text='Save' />
            <MenuOption onSelect={() => alert(`Delete`)} >
              <Text style={{color: 'red'}}>Delete</Text>
            </MenuOption>
            <MenuOption onSelect={() => alert(`Not called`)} disabled={true} text='Disabled' /> */}
          </MenuOptions>
        </Menu>
        ),
        headerStyle: { backgroundColor: Colors.primary.DEFAULT,
         }, 
        headerTintColor: '#fff',   
        headerTitleStyle: {  fontWeight: 'bold',},
        headerShadowVisible: false,
        }} />
      
       <SafeAreaView className="flex-1 bg-primary ">
      <View className="flex-1 ">
        
        
        <FlatList className="flex-1 bg-gray-100 mt-20 rounded-t-3xl px-4 pt-4"
        data={groups}
        keyExtractor={(item) => item.id.toString()} // Adjust depending on the table's unique key
        renderItem={({ item }) => (
          <GroupItem group={item} index={item.id}></GroupItem>
        )}
      />
      
        
     
      </View>

      

      <FloatingAction
    actions={actions}
    onPressItem={name => {
      console.log(`selected button: ${name}`);
      if(name == "bt_group_creation"){
        router.navigate('/(group)/newgroup')
      }
    }}
    color={Colors.primary.DEFAULT}
  />

    </SafeAreaView>




       
     

    </>
  );


  
}




