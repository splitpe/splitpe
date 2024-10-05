import React from "react";
import { SafeAreaView, View,Text, Image, TouchableOpacity } from "react-native";
import { ScreenContent } from "~/components/ScreenContent";
import Checkbox from 'expo-checkbox';
import { router,useNavigation,Stack } from "expo-router";
import { Pressable } from "react-native";


const FeatureItem = ({ text }) => (
    <View className='flex-row items-center gap-3 p-2'>
      <Checkbox value={true}></Checkbox>
      <Text className='text-lg' >{text}</Text>
    </View>
  );
  
export default function AppInfo() {
   
    
    const item= {
        image: require("../../assets/VectorImage.png"),
        location: "Chennai",
        status: 1,
        projectId: 1
    }
    return (
        <>
            {/* <ScreenContent path="app/(auth)/appinfo.tsx" title="App Info" /> */}
            <Stack.Screen options={{ title: 'App Info' }}></Stack.Screen>
            <SafeAreaView className='flex-1 p-6'>
        <Text className='text-3xl font-bold'>Splitpe</Text>
        <View className='items-center'>
         <Image className='w-96 h-96'
          source={item.image}
        />
      </View>
        <Text className='font-bold text-2xl'>
          Get paid back hassle-free using Splitpe
        </Text>
          
        <View className='mt-4'>
          <FeatureItem text="Add friends or family members to your team." />
          <FeatureItem text="Tracks & Calculates expenses." />
          <FeatureItem text="Effortlessly captures and processes expense messages." />
        </View>
      
       <TouchableOpacity  className='mt-4 flex-row item-right justify-end'>
       <Pressable onPress={() => router.push('/login')} >
        <Text className='text-lg text-white px-8 py-2 rounded-lg bg-blue-400 border-2 border-gray-300 rounded-lg p-2' >Login</Text>
        </Pressable>
      </TouchableOpacity> 

     
    </SafeAreaView>
        </>
    );
}