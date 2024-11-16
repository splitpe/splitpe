import { router, Stack } from "expo-router";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
  } from 'react-native-popup-menu';

import { StatusBar } from 'expo-status-bar';


import { supabase } from '~/utils/supabase';
import { Colors } from '~/types/colors';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';  
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


import { View,Text } from "react-native";
import { useFonts } from "expo-font";

export default function CustomStackScreen() {
  const [narnoorFontLoaded] = useFonts({
    Narnoor: require('~/assets/fonts/Narnoor-Regular.ttf'),
    Poppins: require('~/assets/fonts/Poppins-Regular.ttf'),
  });
  
  if (!narnoorFontLoaded) {
    return null; // or a loading indicator
  }
  
    return (
        <>
           <StatusBar
  backgroundColor={Colors.primary.DEFAULT} // Set the background color
  style="light" // Set the font color to light
/>
 
            <Stack.Screen options={{
       headerTitle:'Splitpe', 
         headerRight: () => (
          <Menu>
          <MenuTrigger style={{paddingRight: 10}}>
          <Entypo name="dots-three-vertical" size={18} color="white" />
            </MenuTrigger>
          <MenuOptions>
          <MenuOption onSelect={() => supabase.auth.signOut()} >
            <View className='flex-row items-center justify-between'>
          <Text className='text-lg font-poppins p-2 text-center'>Sign Out  
          </Text>
          <AntDesign name="login" size={18} color="black" />
          </View>
          </MenuOption>
          <MenuOption onSelect={() => router.push('/(group)/invitations')} >
            <View className='flex-row items-center justify-between'>
          <Text className='text-lg p-2 font-poppins text-center'>Invitations  
          </Text>
          <MaterialIcons name="mobile-friendly" size={24} color="black" />
          </View>
          </MenuOption>
          <MenuOption onSelect={() => router.push('/(group)/scanaddgroup')} >
            <View className='flex-row items-center justify-between'>
          <Text className='text-lg p-2 font-poppins text-center'>Scan Group  
    </Text>
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="black" />
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
        headerTitleStyle: {  fontWeight: 'bold',fontFamily: 'Narnoor', },
        headerShadowVisible: false,
        }} />



        </>
    );
}