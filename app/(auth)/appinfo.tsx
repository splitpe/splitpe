import React from "react";
import { SafeAreaView, View,Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContent } from "~/components/ScreenContent";
import Checkbox from 'expo-checkbox';
import { router,useNavigation,Stack } from "expo-router";
import { Pressable } from "react-native";
import { useFonts } from "expo-font";


const FeatureItem = ({ text }) => (
    <View className='flex-row items-center gap-3 p-2'>
      <Checkbox value={true}></Checkbox>
      <Text className='text-lg font-sans' >{text}</Text>
    </View>
  );
  
export default function AppInfo() {
   
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('~/assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('~/assets/fonts/Inter-Medium.otf'),
    'Inter-Bold': require('~/assets/fonts/Inter-Bold.otf'),
    'Ubuntu-Regular': require('~/assets/fonts/Ubuntu-Regular.ttf'),
  })
  


    const item= {
        image: require("../../assets/VectorImage.png"),
        location: "Chennai",
        status: 1,
        projectId: 1
    }

    if (!fontsLoaded) {
      return <ActivityIndicator size="large" className="flex-1" color="#A855F7" />
    }
  

    return (
        <>
            {/* <ScreenContent path="app/(auth)/appinfo.tsx" title="App Info" /> */}
            <Stack.Screen options={{ title: 'App Info' }}></Stack.Screen>
            <SafeAreaView className='flex-1 p-4'>
        <Text className='text-4xl font-narnoorBold text-primary-dark'>Splitpe</Text>
        <View className='items-center'>
         <Image className='w-96 h-96 xl:w-72 xl:h-72'
          source={item.image}
        />
      </View>
        <Text className="font-['Inter-Bold'] text-primary-dark text-2xl">
          Get paid back hassle-free using Splitpe
        </Text>
          
        <View className='mt-4'>
          <FeatureItem text="Add friends or family members to your team." />
          <FeatureItem text="Tracks & Calculates expenses." />
          <FeatureItem text="Effortlessly captures and processes expense messages." />
        </View>
      
       <TouchableOpacity  className='flex-row item-right justify-end'>
       <Pressable onPress={() => router.push('/login')} >
        <Text className='text-lg font-poppins text-white px-8 py-2 rounded-lg bg-emerald-600 border-2 border-gray-300 rounded-lg p-2' >Login</Text>
        </Pressable>
      </TouchableOpacity> 

     
    </SafeAreaView>
        </>
    );
}