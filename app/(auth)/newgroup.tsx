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

export default function CreateGroup() {
  const [fullname, setFullname] = useState('')
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('')
  const { user } = useAuth();





  const logoImage= {
    image: require("../../assets/Logo4.png"),
    location: "Chennai",
    status: 1,
    projectId: 1
}


  async function CreateNewGroup() {
    setLoading(true)

    const { data, error } = await supabase
    .from('groups')  // Name of your table
    .upsert({
      id: user.id,  // Assuming 'id' is the user identifier in the profiles table
      group_name: fullname,
      avatar_url: avatarUrl,
      currency: currency?.code,
     
    });

  if (error) {
    console.log("Error updating profile:", error.message);
  } else {
    console.log("Profile updated successfully", data);
  }
      setLoading(false)
  }




return (<View className="flex-1 justify-center bg-white px-6 py-4">
  <Stack.Screen options={{ title: 'New Group' }}></Stack.Screen>
    <View className="flex-row items-center mb-4">
      <Image
        source={logoImage.image} 
        className="w-36 h-28 mr-2"
        resizeMode='contain'
      />
      <Text className="text-4xl font-bold">Splitpe</Text>
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
      className="border-b border-blue-500 py-2 mb-4"
      editable={!loading}
      value={fullname}
      onChangeText={setFullname}
    />
    

    


    <CurrencyPicker selectedCurrency={currency} onSelectCurrency={setCurrency} />

    <View className="flex-row justify-between mb-4">
      <TouchableOpacity className="bg-gray-200 py-2 px-6 rounded">
        <Text className="text-xl">Back</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-blue-500 py-2 px-6 rounded">
        <Pressable onPress={() => CreateNewGroup()}>
        <Text className="text-white text-xl">Create New Group</Text>
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

