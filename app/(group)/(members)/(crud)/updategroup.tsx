import React, { useState, useEffect } from 'react'
import { ActivityIndicator, Pressable } from 'react-native'
import { Alert, Text, View, AppState, TextInput } from 'react-native'
import { supabase } from '~/utils/supabase'
import { TouchableOpacity } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useAuth } from '~/contexts/AuthProvider'
import Avatar from '~/components/Avatar'
import CurrencyPicker, { currencies } from '~/components/Currencypicker'
import CustomStackScreen from '~/components/CustomStackScreen'
import { Colors } from '~/types/colors'

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function UpdateGroup() {
  const [groupname, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currency, setCurrency] = useState(currencies[0])
  const [avatarUrl, setAvatarUrl] = useState('')
  const { user } = useAuth()
  const params = useLocalSearchParams()
  const  groupId  =params.groupId

  // Fetch existing group data
  useEffect(() => {
    async function fetchGroupData() {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single()
        if (error) {
          console.log(groupId)
          throw error
        }

        if (data) {
          console.log(data)
          setGroupName(data.name)
          setAvatarUrl(data.profile_picture_url || '')
          const foundCurrency = currencies.find(c => c.code === data.currency) || currencies[0]
          setCurrency(foundCurrency)
        }
      } catch (error) {
        Alert.alert('Error fetching group data:', error.message)
      } finally {
        setInitialLoading(false)
      }
    }

    if (groupId) {
      fetchGroupData()
    }
  }, [groupId])

  async function updateGroup() {
    if (!groupId) {
      Alert.alert('Error', 'Group ID is missing')
      return
    }

    setLoading(true)
    try {
      // Check if the new group name already exists (excluding current group)
      const { data: existingGroup, error: existingError } = await supabase
        .from('groups')
        .select('id')
        .eq('name', groupname)
        .neq('id', groupId)
        .eq('created_by', user.id)

      if (existingError) {
        throw existingError
      }

      if (existingGroup && existingGroup.length > 0) {
        Alert.alert('Error', 'Group name already exists')
        return
      }

      // Update the group
      const { data, error } = await supabase
        .from('groups')
        .update({
          name: groupname,
          profile_picture_url: avatarUrl,
          currency: currency?.code,
          updated_at: new Date()
        })
        .eq('id', groupId)
        .select()
        .single()

      if (error) {
        throw error
      }

      Alert.alert('Success', `Group ${groupname} updated successfully!`)
      router.navigate(`/(group)/${groupId}`)
    } catch (error) {
      Alert.alert('Error updating group:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    )
  }

  return (
    <View className="flex-1 justify-center bg-white px-6 py-4">
      <CustomStackScreen />
      
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      ) : (
        <>
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
            placeholder="Group Name"
            className="border-b border-blue-500 py-2 mb-4"
            editable={!loading}
            value={groupname}
            onChangeText={setGroupName}
          />

          <CurrencyPicker 
            selectedCurrency={currency} 
            onSelectCurrency={setCurrency} 
          />

          <View className="flex-row justify-between mb-4">
            <TouchableOpacity 
              className="bg-gray-200 py-2 px-6 rounded"
              onPress={() => router.back()}
            >
              <Text className="text-xl">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-blue-500 py-2 px-6 rounded">
              <Pressable onPress={updateGroup}>
                <Text className="text-white text-xl">Update Group</Text>
              </Pressable>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  )
}