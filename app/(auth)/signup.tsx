import React, { useState } from 'react'
import { Pressable } from 'react-native'
import { Alert,Text, StyleSheet, View, AppState,TextInput,Button } from 'react-native'
import { supabase } from '~/utils/supabase'
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';




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
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('')

  const logoImage= {
    image: require("../../assets/Logo3.png"),
    location: "Chennai",
    status: 1,
    projectId: 1
}


  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }


return (<View className="flex-1 bg-white px-6 py-4">
  <Stack.Screen options={{ title: 'Sign Up' }}></Stack.Screen>
    <View className="flex-row items-center mb-4">
      <Image
        source={logoImage.image} 
        className="w-36 h-28 mr-2"
        resizeMode='contain'
      />
      <Text className="text-4xl font-bold">Splitpe</Text>
    </View>

    <View className="w-36 h-36 rounded-full bg-gray-200 self-center mb-4" />

    <TextInput
      placeholder="User name"
      className="border-b border-blue-500 py-2 mb-4"
    />

    <TextInput
      placeholder="Your email address"
      keyboardType="email-address"
      className="border-b border-gray-300 py-2 mb-4"
    />

    <TextInput
      placeholder="Your password"
      secureTextEntry
      className="border-b border-gray-300 py-2 mb-4"
    />

    <View className="flex-row mb-4">
      <View className="w-16 h-10 bg-gray-200 mr-2 justify-center items-center">
      <Picker
            selectedValue={countryCode}
            onValueChange={(itemValue) => setCountryCode(itemValue)}
            className="h-10"
          >
            <Picker.Item label="🇮🇳 +91" value="+91" />
            <Picker.Item label="🇺🇸 +1" value="+1" />
            <Picker.Item label="🇬🇧 +44" value="+44" />
            {/* Add more country codes as needed */}
          </Picker>
      </View>
      <TextInput
        placeholder="Phone # (optional)"
        keyboardType="phone-pad"
        className="flex-1 border-b border-gray-300 py-2"
      />
    </View>

    <Text className="mb-4">
      I use INR (₹) as my currency. <Text className="text-blue-500">Change</Text>
    </Text>

    <View className="flex-row justify-between mb-4">
      <TouchableOpacity className="bg-gray-200 py-2 px-6 rounded">
        <Text className="text-xl">Back</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-blue-500 py-2 px-6 rounded">
        <Text className="text-white text-xl">Done</Text>
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

