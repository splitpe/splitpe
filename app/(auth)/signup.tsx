import React, { useRef, useState, useEffect } from 'react'
import { Pressable, StyleProp, TextStyle } from 'react-native'
import { Alert, Text, StyleSheet, View, AppState, TextInput, Button } from 'react-native'
import { supabase } from '~/utils/supabase'
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '~/contexts/AuthProvider';
import Avatar from '~/components/Avatar'
import PhoneInput, { isValidNumber } from "react-native-phone-number-input";
import { CountryCodeList } from '~/types/courtypicker';
import CurrencyPicker, { currencies } from '~/components/Currencypicker'

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [usernameExists, setUsernameExists] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState<string | null>('IN')
  const [countryCallingCode, setCallingCountryCode] = useState<string | null>('+91')
  const [currency, setCurrency] = useState(currencies[0])
  const [avatarUrl, setAvatarUrl] = useState('')
  const phoneInput = useRef<PhoneInput>(null)

  const logoImage = {
    image: require("../../assets/Logo4.png"),
    location: "Chennai",
    status: 1,
    projectId: 1
  }

  // Function to generate and upload UI Avatar
  const generateAndUploadAvatar = async (name: string) => {
    try {
      // Generate avatar URL with UI Avatars
      const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200&bold=true&format=png`;


      console.log(uiAvatarUrl);
      // Fetch the image
      const response = await fetch(uiAvatarUrl);
      const blob = await response.blob();

      // Generate a unique filename
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get the public URL
      // const { data: { publicUrl } } = supabase.storage
      //   .from('avatars')
      //   .getPublicUrl(fileName);

      return fileName;
    } catch (error) {
      console.error('Error generating/uploading avatar:', error);
      return null;
    }
  };

  async function signUpWithEmail() {
    setLoading(true);
    if (isValidNumber(phone, countryCode) === false) {
      Alert.alert("Error", "Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.session) {
        const userId = data.session.user.id;
        
        // If no avatar was uploaded, generate one
        if (!avatarUrl) {
          const generatedAvatarUrl = await generateAndUploadAvatar(fullname);
          if (generatedAvatarUrl) {
            setAvatarUrl(generatedAvatarUrl);
            await updateUserProfile(userId, fullname, generatedAvatarUrl);
          } else {
            await updateUserProfile(userId, fullname, avatarUrl);
          }
        } else {
          await updateUserProfile(userId, fullname, avatarUrl);
        }
      }
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const updateUserProfile = async (userId: string, fullname: string, avatarUrl: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullname,
        avatar_url: avatarUrl,
        phone_number: phone,
        country_code: countryCode,
        country_calling_code: countryCallingCode,
        currency: currency?.code,
        email: email
      });

    if (error) {
      console.log("Error updating profile:", error.message);
    } else {
      console.log("Profile updated successfully", data);
    }
  };

  return (
    <View className="flex-1  bg-white px-6">
      <Stack.Screen options={{ title: 'Sign Up' }}></Stack.Screen>
      <View className="flex-row justify-center items-center mb-4">
        <Image
          source={logoImage.image}
          className="w-36 h-28"
          resizeMode='contain'
        />
        <Text className="text-4xl font-narnoorBold text-primary-dark">Splitpe</Text>
      </View>

      <View>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url)
          }}
        />
      </View>

      <TextInput
        placeholder="Full Name"
        className="border-b border-primary py-2 mb-4"
        editable={!loading}
        value={fullname}
        onChangeText={setFullname}
      />

      <TextInput
        placeholder="Your email address"
        keyboardType="email-address"
        className="border-b border-gray-300 py-2 mb-4"
        editable={!loading}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Your password"
        secureTextEntry
        className="border-b border-gray-300 py-2 mb-4"
        editable={!loading}
        value={password}
        onChangeText={setPassword}
      />

      <View className="flex-row border-b border-gray-300 mb-4">
        <PhoneInput
          ref={phoneInput}
          defaultValue={phone}
          defaultCode={CountryCodeList.includes(countryCode) ? countryCode : undefined}
          onChangeText={(text) => {
            setPhone(text);
          }}
          textContainerStyle={{ backgroundColor: 'transparent' }}
          textInputStyle={{ backgroundColor: 'transparent', fontSize: 14 }}
          onChangeCountry={(text) => {
            setCountryCode(CountryCodeList.includes(text.cca2) ? text.cca2 : undefined);
            setCallingCountryCode(text.callingCode[0]);
          }}
        />
      </View>

      <CurrencyPicker selectedCurrency={currency} onSelectCurrency={setCurrency} />

      <View className="flex-row justify-between mb-4">
        <TouchableOpacity className="bg-cgray-one py-2 px-6 rounded">
          <Text className="text-xl font-poppins">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-primary py-2 px-4 rounded">
          <Pressable onPress={() => signUpWithEmail()}>
            <Text className="text-white text-xl font-poppins">Sign Up</Text>
          </Pressable>
        </TouchableOpacity>
      </View>

      <Text className="text-center text-gray-500 text-sm">
        By signing up, You accept the Splitpe Terms of Service.
      </Text>
    </View>
  )
}