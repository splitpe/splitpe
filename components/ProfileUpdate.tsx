import React, { useEffect, useRef, useState } from 'react'
import { Pressable, Alert, Text, View, TextInput, AppState, RefreshControl } from 'react-native'
import { supabase } from '~/utils/supabase'
import { TouchableOpacity, Image } from 'react-native'
import { router, Stack } from 'expo-router'
import Avatar from '~/components/Avatar'
import PhoneInput, { isValidNumber } from "react-native-phone-number-input"
import { CountryCodeList } from '~/types/courtypicker'
import CurrencyPicker, { currencies } from '~/components/Currencypicker'
import CustomStackScreen from './CustomStackScreen'

export default function ProfileUpdate() {
  const [refreshing, setRefreshing] = useState(false);
  const [email, setEmail] = useState('')
  const [fullname, setFullname] = useState('')
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState<string | null>('IN')
  const [countryCallingCode, setCallingCountryCode] = useState<string | null>('+91')
  const [currency, setCurrency] = useState(currencies[0])
  const [avatarUrl, setAvatarUrl] = useState('')
  const phoneInput = useRef<PhoneInput>(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const logoImage = {
    image: require("../assets/Logo4.png"),
    location: "Chennai",
    status: 1,
    projectId: 1
  }

  // Fetch current user data on component mount
  useEffect(() => {
    fetchUserProfile().then(() => {
      setIsDataLoaded(true)
    })
  }, [])


  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        Alert.alert('Error', 'No user found')
        return
      }

      // Fetch profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }
      if (data) {
        setEmail(data.email || '')
        setFullname(data.full_name || '')
        setPhone(data.phone_number || '')
        setCountryCode(data.country_code || 'IN')
        setCallingCountryCode(data.country_calling_code || '+91')
        setAvatarUrl(data.avatar_url || '')
        // Find and set the currency object that matches the stored currency code
        const savedCurrency = currencies.find(c => c.code === data.currency)
        if (savedCurrency) {
          setCurrency(savedCurrency)
        }
        setIsDataLoaded(true)
      }
    } catch (error) {
      Alert.alert('Error', 'Error fetching profile')
      console.error('Error fetching profile:', error)
    }
  }


  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserProfile().then(() => {
      setRefreshing(false);
    });
  };


  const updateProfile = async () => {
    setLoading(true)
    try {
      if (isValidNumber(phone, countryCode) === false) {
        Alert.alert("Error", "Please enter a valid phone number")
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        Alert.alert('Error', 'No user found')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullname,
          avatar_url: avatarUrl,
          phone_number: phone,
          country_code: countryCode,
          country_calling_code: countryCallingCode,
          currency: currency?.code,
          email: email,
          updated_at: new Date()
        })

      if (error) throw error

      Alert.alert('Success', 'Profile updated successfully')
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Error updating profile')
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (<><CustomStackScreen />
<View className="flex-1 justify-center bg-white px-6 py-4">
<RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
      > 
      
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

      <TextInput
        placeholder="Your email address"
        keyboardType="email-address"
        className="border-b border-gray-300 py-2 mb-4"
        editable={!loading}
        value={email}
        onChangeText={setEmail}
      />

      <View className="flex-row mb-4 border-b border-gray-300 py-2">
      {isDataLoaded && (
        <PhoneInput
          ref={phoneInput}
          defaultValue={phone}
//          value={phone}
          defaultCode={CountryCodeList.includes(countryCode) ? countryCode : undefined}
          onChangeText={(text) => {
            setPhone(text)
          }}
          textContainerStyle={{ backgroundColor: 'transparent' }}
          textInputStyle={{ backgroundColor: 'transparent', fontSize: 14 }}
          onChangeCountry={(text) => {
            setCountryCode(CountryCodeList.includes(text.cca2) ? text.cca2 : undefined)
            setCallingCountryCode(text.callingCode[0])
          }}
        />)
}
      </View>

      <CurrencyPicker selectedCurrency={currency} onSelectCurrency={setCurrency} />

      <View className="flex-row justify-between mb-4">
        <TouchableOpacity onPress={() => router.back()} className="bg-gray-200 py-2 px-6 rounded">
          <Text className="text-xl">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-blue-500 py-2 px-6 rounded"
          disabled={loading}
        >
          <Pressable onPress={updateProfile}>
            <Text className="text-white text-xl">
              {loading ? 'Updating...' : 'Update Profile'}
            </Text>
          </Pressable>
        </TouchableOpacity>
      </View>
      </RefreshControl>
    </View>
    </>)
}