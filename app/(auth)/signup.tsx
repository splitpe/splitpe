import React, { useRef, useState } from 'react'
import { Pressable,StyleProp, TextStyle  } from 'react-native'
import { Alert,Text, StyleSheet, View, AppState,TextInput,Button } from 'react-native'
import { supabase } from '~/utils/supabase'
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '~/contexts/AuthProvider';
import Avatar from '~/components/Avatar'
import PhoneInput, { isValidNumber } from "react-native-phone-number-input";
import {CountryCodeList} from '~/types/courtypicker';
import CurrencyPicker, { currencies } from '~/components/Currencypicker'



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

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [usernameExists, setUsernameExists] = useState(false);
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState<string | null>('IN');
  const [countryCallingCode, setCallingCountryCode] = useState<string | null>('+91');
  const [currency, setCurrency] = useState(currencies[0]);
  const [avatarUrl, setAvatarUrl] = useState('')
  const phoneInput = useRef<PhoneInput>(null);




  const logoImage= {
    image: require("../../assets/Logo4.png"),
    location: "Chennai",
    status: 1,
    projectId: 1
}


  async function signUpWithEmail() {
    setLoading(true)
    if (isValidNumber(phone, countryCode) === false) {
      Alert.alert("Error", "Please enter a valid phone number");
      setLoading(false);
      return;
    }

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

 

    if (error) Alert.alert(error.message)    
    // console.log(data)
    if (data.session) 
    {
      // console.log(data)
      console.log(data.session.user.id)
      // console.log(user.id)
       // Proceed to update additional fields after successful signup
        const userId = data.session?.user.id

        await updateUserProfile(userId, fullname);
    }
      setLoading(false)
  }


  const updateUserProfile = async (userId, fullname) => {

    
    const { data, error } = await supabase
      .from('profiles')  // Name of your table
      .upsert({
        id: userId,  // Assuming 'id' is the user identifier in the profiles table
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
  


return (<View className="flex-1 justify-center bg-white px-6 py-4">
  <Stack.Screen options={{ title: 'Sign Up' }}></Stack.Screen>
    <View className="flex-row items-center mb-4">
      <Image
        source={logoImage.image} 
        className="w-36 h-28 mr-2"
        resizeMode='contain'
      />
      <Text className="text-4xl font-bold">Splitpe</Text>
    </View>

    {/* <View className="w-36 h-36 rounded-full bg-gray-200 self-center mb-4" /> */}

        <View
    >
    {/* <CameraButton status="Ready" /> */}

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
      className="border-b border-blue-500 py-2 mb-4"
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

    <View className="flex-row mb-4 border-b border-gray-300 py-2">
    <PhoneInput
            ref={phoneInput}
            defaultValue={phone}
            defaultCode={CountryCodeList.includes(countryCode)? countryCode : undefined}
            onChangeText={(text) => {
              console.log(text);
              setPhone(text);
            }}
            textContainerStyle={{ backgroundColor: 'transparent' }}
            textInputStyle={{ backgroundColor: 'transparent',fontSize: 14 }}
            onChangeCountry={(text) => {
              console.log(text);
              setCountryCode(CountryCodeList.includes(text.cca2)? text.cca2 : undefined);
              setCallingCountryCode(text.callingCode[0]);
            }}
          />
    </View>

    <CurrencyPicker selectedCurrency={currency} onSelectCurrency={setCurrency} />

    <View className="flex-row justify-between mb-4">
      <TouchableOpacity className="bg-gray-200 py-2 px-6 rounded">
        <Text className="text-xl">Back</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-blue-500 py-2 px-6 rounded">
        <Pressable onPress={() => signUpWithEmail()}>
        <Text className="text-white text-xl">Sign Up</Text>
        </Pressable>
      </TouchableOpacity>
    </View>


    
    <Text className="text-center text-gray-500 text-sm">
      By signing up, You accept the Splitpe Terms of Service.
    </Text>
  </View>
  )







//   return (
//     <View >
//       <View>
//       <TextInput
//           onChangeText={(text) => setEmail(text)}
//           value={username}
//           placeholder="username"
//           autoCapitalize={'none'}
//         />
//         <TextInput
//           onChangeText={(text) => setEmail(text)}
//           value={email}
//           placeholder="email@address.com"
//           autoCapitalize={'none'}
//         />
//       </View>
//       <View >
//         <TextInput
//           onChangeText={(text) => setPassword(text)}
//           value={password}
//           secureTextEntry={true}
//           placeholder="Password"
//           autoCapitalize={'none'}
//         />
//       </View>
//       <Pressable  onPress={() => signInWithEmail()}>
//         <Text disabled={loading} >Sign in</Text>
//       </Pressable>
//       <Pressable className='bg-primary' onPress={() => signUpWithEmail() }>
//         <Text disabled={loading} >Sign Up</Text>
//       </Pressable>
//     </View>
//   )
}

