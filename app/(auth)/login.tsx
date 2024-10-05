import React, { useState } from 'react'
import { Pressable } from 'react-native'
import { Alert,Text, StyleSheet, View, AppState,TextInput,Button } from 'react-native'
import { supabase } from '~/utils/supabase'
import { Picker } from '@react-native-picker/picker';
import { TouchableOpacity, Image } from 'react-native';
import { router ,Stack} from 'expo-router';




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

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('')

  const logoImage= {
    image: require("../../assets/Logo.png"),
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
    else Alert.alert('Logged In!')
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
    if (!session) Alert.alert('Your user is created successfully!')
    setLoading(false)
  }



  return (

    <View className='flex-1 justify-center items-center gap-4'>
        <Stack.Screen options={{ title: 'Sign Up' }}></Stack.Screen>
        <Image source={logoImage.image} className='w-60 h-60'></Image>
      <View className='w-4/5'>
     
        <TextInput className='bg-primary-light p-4  text-black rounded-lg'
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View  className='w-4/5'>
        <TextInput
        className='bg-primary-light p-4  text-black rounded-lg'
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
        
      </View>
      
      <View className='w-4/5 gap-4 flex-row justify-between'>
      <Pressable className= 'bg-white px-10 p-4 rounded-lg' onPress={() => router.navigate('/(auth)/signup')    }>
        <Text disabled={loading} >Sign Up</Text>
      </Pressable>
      <Pressable className='bg-primary px-10 rounded-lg'  onPress={() => signInWithEmail()}>
        <Text className=' p-4  text-primary-dark' disabled={loading} >Sign in</Text>
      </Pressable>
     

      </View>
      <Pressable className='bg-primary px-10 rounded-lg'  onPress={() => signUpWithEmail()}>
        <Text className=' p-4  text-primary-dark' disabled={loading} >Sign Up T</Text>
      </Pressable>
    </View>
  )
}

