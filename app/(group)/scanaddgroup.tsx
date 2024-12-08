import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity,StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Camera, CameraType, CameraView } from 'expo-camera';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/contexts/AuthProvider';
import { router } from 'expo-router';
import { Colors } from '~/types/colors';
import { activityInsertUtils } from '~/helper/insertactivity';

export default function QRCodeScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [isHandlingBarCode, setIsHandlingBarCode] = useState(false);


  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);


  async function handleAccept({user_id, group_id}) {
    console.log("Handle Accept is called",user_id, group_id)
    if(isLoading)
    {
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
    .from('user_groups')
    .select()
    .eq('user_id', user_id)
    .eq('group_id', group_id);

    if(error)
    {
        console.log('Error is ',error)
    }
    else
    {
        if(data.length > 0)
        {
         Alert.alert('You are already a member of this group!'); 
        }
        else
        {

          const { data, error } = await supabase
          .from('user_groups')
          .insert([{
            user_id: user_id,
            group_id: group_id,
            role: 'member'
          }])
          .select()
          if(error)
          {
              console.log('Error is ',error)
          }
          else
          {
      
              const { data, error } = await supabase
              .from('invitations')
              .select('id')
              .eq('user_id', user_id)
              .eq('group_id', group_id)
              .single();
            
            if (data && data.id) {
              // update existing record
              const { data: updateData, error: updateError } = await supabase
                .from('invitations')
                .update({
                  status: 'accepted',
                })
                .eq('id', data.id);
            } else {
              // insert new record
              const { data: insertData, error: insertError } = await supabase
                .from('invitations')
                .insert({
                  user_id: user_id,
                  group_id: group_id,
                  status: 'accepted',
                });

                const {data: userdata,error: usererror} = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user_id)
                .single();

                const {data: groupdata,error: grouperror} = await supabase
                .from('groups')
                .select('name')
                .eq('id', group_id)
                .single();
              await activityInsertUtils.insertUserInvited({user_name: userdata?.full_name,group_name:groupdata?.name}, user.id, group_id);
              await activityInsertUtils.insertUserJoinedGroup({user_name:userdata?.full_name,group_name:groupdata?.name},user.id, group_id);
              router.navigate('/');
              }
          // Implement accept logic here
        };
      
          
        }

}
setIsLoading(false);
  }




async function handleBarCodeScanned({ type, data }) {
  if (isHandlingBarCode) return;

  setIsHandlingBarCode(true);
  console.log('HandleBarCodeScanned ',data)
    const returnedData = await supabase
    .from('groups')
    .select('*')
    .eq('new_id', data)
    .single();
    if(returnedData.error)
    {
        console.log('Error is ',returnedData.error)
        Alert.alert('Data Invalid or Group not found!');
    }
    else
    {
        if(returnedData.data)
        {
             handleAccept({group_id: returnedData.data.id, user_id: user.id});

            console.log('Data is ',returnedData.data)
                
        }
        else
        {
          console.log('Data is invalid ',returnedData.data)
            Alert.alert('Group not found!');
        }
    }
    setScanned(true);
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    setIsHandlingBarCode(false);
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Requesting camera permission</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-red-500">No access to camera</Text>
      </View>
    );
  }

  return (
    <View className='flex-1'>{isLoading ?  
(<View className="flex-1 justify-center items-center">
<ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
</View>) : 
    <View className="flex-1">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View className="flex-1 bg-transparent">
          {scanned && (
            <View className="absolute bottom-10 left-0 right-0 items-center">
              <TouchableOpacity
                onPress={() => setScanned(false)}
                className="bg-blue-500 px-6 py-3 rounded-full"
              >
                <Text className="text-white font-bold text-lg">
                   Tap to Scan Again
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CameraView>
    </View>
    }</View>);
}