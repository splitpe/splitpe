import { Stack } from "expo-router";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
  } from 'react-native-popup-menu';

import { supabase } from '~/utils/supabase';
import { Colors } from '~/types/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';  
import { View,Text } from "react-native";

export default function CustomStackScreen() {
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



        </>
    );
}