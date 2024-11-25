import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Camera, 
  QrCode, 
  Diamond, 
  Mail, 
  Bell, 
  Lock,
  Star,
  MessageCircleQuestion,
  LogOut,
  Pencil,
  UserRoundPen,
  ChevronRight 
} from 'lucide-react-native';
import { Colors } from '~/types/colors';
import { router } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/contexts/AuthProvider';
import { generateSignedUrl } from '~/helper/functions';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export default function AccountSettings() {
    const [profile, setProfile] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useAuth();




    async function getProfile() {

      console.log("Account Settings: ",user)
 const {data,error} = await supabase
 .from('profiles')
 .select('*')
 .eq('id', user.id)
 .single()  

 if (error) {
    console.error(error);
 }
 else{
 if(data.avatar_url) {
    const updateSignedUrl = await generateSignedUrl('avatars', data.avatar_url, 3600);
    const updatedprofile = {...data,avatar_url:updateSignedUrl}
    console.log("Account Settings: ",updatedprofile);
    setProfile(updatedprofile);
 }
 else{
  setProfile(data);
 }

 }
 

}



    const handleRefresh = async () => {
      setRefreshing(true);
      try {
        await getProfile();
      } catch (error) {
        console.error(error);
      } finally {
        setRefreshing(false);
      }
    };


    useEffect(() => {
getProfile()
},[]);

  return (
    <ScrollView
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <LinearGradient
        colors={[Colors.primary.DEFAULT, '#8b5cf6']}
        className="px-6 pt-12 pb-8 rounded-b-3xl"
      >
        <View className="items-center">
          <View className="relative">
            <Image
              source={{ uri: profile?.avatar_url }}
              className="w-24 h-24 rounded-full border-4 border-white"
            />
            <TouchableOpacity 
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm"
            >
              <Camera size={20} color="#6366f1" />
            </TouchableOpacity>
          </View>
          <View className="mt-4 items-center">
            <Text className="text-white font-interBold text-xl font-bold">{profile?.full_name}</Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-100 font-inter text-sm">{profile?.email}</Text>
              <TouchableOpacity className="ml-2">
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View className="flex-row justify-around -mt-6 mx-4 bg-white rounded-2xl p-4 shadow-sm">
        <TouchableOpacity className="items-center" onPress={() => {router.push('/(group)/scanaddgroup')}}>
          <View className="bg-blue-100 p-3 rounded-full mb-2">
            <QrCode size={24} color="#2563eb" />
          </View>
          <Text className="text-xs font-medium text-gray-600">Scan Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center opacity-20">
          <View className="bg-purple-100 p-3 rounded-full mb-2">
            <Diamond size={24} color="#7c3aed" />
          </View>
          <Text className="text-xs font-medium text-gray-600">Premium</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Sections */}
      <View className="px-4 mt-6">
        <Text className="text-lg font-poppinsBold text-gray-900 mb-4 px-2">Settings</Text>
        
        <View className="bg-white rounded-2xl shadow-sm">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100" onPress={() => {router.push('/(group)/(members)/(crud)/profile')}}>
            <View className="bg-blue-100 p-2 rounded-lg">
              <UserRoundPen size={20} color="#2563eb" />
            </View>
            <Text className="flex-1 ml-3 text-gray-700 font-poppinsSemiBold">Profile Settings</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100" onPress={() => {router.push('/(group)/invitations')}}>
            <View className="bg-orange-100 p-2 rounded-lg">
              <Bell size={20} color="#ea580c" />
            </View>
            <Text className="flex-1 ml-3 text-gray-700 font-poppinsSemiBold">Invitations</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center p-4" onPress={() => {router.push('/(group)/(members)/(crud)/changepassword')}}>
            <View className="bg-green-100 p-2 rounded-lg">
              <Lock size={20} color="#16a34a" />
            </View>
            <Text className="flex-1 ml-3 text-gray-700 font-poppinsSemiBold">Password Reset</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-gray-900 font-poppinsBold mt-8 mb-4 px-2">Feedback</Text>
        
        <View className="bg-white rounded-2xl shadow-sm">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="bg-yellow-100 p-2 rounded-lg">
              <Star size={20} color="#ca8a04" />
            </View>
            <Text className="flex-1 ml-3 text-gray-700 font-poppinsSemiBold">Rate App</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center p-4" onPress={() => router.navigate('(group)/helpandsupport')}>
            <View className="bg-purple-100 p-2 rounded-lg">
              <MessageCircleQuestion size={20} color="#7c3aed" />
            </View>
            <Text className="flex-1 ml-3 text-gray-700 font-poppinsSemiBold">Help & Support</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity className="mt-8 mb-8 mx-2" onPress={() => supabase.auth.signOut()}>
          <View className="flex-row items-center justify-center bg-red-50 p-4 rounded-xl">
            <LogOut size={20} color="#ef4444" />
            <Text className="ml-2 text-red-600 font-poppinsSemiBold">Log Out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}