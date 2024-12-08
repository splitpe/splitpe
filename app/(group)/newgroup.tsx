import React, { useState } from 'react'
import { ActivityIndicator, Pressable } from 'react-native'
import { Alert,Text, View, AppState,TextInput } from 'react-native'
import { supabase } from '~/utils/supabase'
import { TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth } from '~/contexts/AuthProvider';
import Avatar from '~/components/Avatar'
import CurrencyPicker, { currencies } from '~/components/Currencypicker'
import CustomStackScreen from '~/components/CustomStackScreen';
import { Colors } from '~/types/colors';
import { activityInsertUtils } from '~/helper/insertactivity';



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
  const [groupname, setGoupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState(currencies[0]);
  const [avatarUrl, setAvatarUrl] = useState('')
  const { user } = useAuth();




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


      console.log(`Generated avatar URL: ${uiAvatarUrl}`);
      // Fetch the image
      const response = await fetch(uiAvatarUrl);
      console.log("The response is: ",response);
      // const blob = await response.blob();
      // console.log("The blob is: ",blob);
      // Generate a unique filename
      const fileName = `${Date.now()}.jpeg`;

      console.log("FileName is: ",fileName);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
  

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, uint8Array, {
          contentType: 'image/png'});

        console.log("The image data is: ",data);

      if (error) throw error;

//      Get the public URL
      // const { data: { publicUrl } } = supabase.storage
      //   .from('avatars')
      //   .getPublicUrl(fileName);

      return fileName;
    } catch (error) {
      console.error('Error generating/uploading avatar:', error);
      return null;
    }
  };

  


  async function CreateNewGroup() {
    setLoading(true)
    const { data: existingGroup, error: existingError } = await supabase
    .from('groups')
    .select('id')
    .eq('name', groupname).eq('created_by', user.id);

    console.log(existingError)
    console.log(existingGroup)

    

 if (existingError) {
    console.error(existingError);
    Alert.alert("Error checking group name:", existingError.message);
  } else if (existingGroup.length > 0) {
    console.log('Group already exists:', existingGroup);
    Alert.alert("Error creating the group:", 'Group name already exists');
  } else {

    var g_avatar_url = avatarUrl;
    if(!avatarUrl)
    {
      const generatedAvatar = await generateAndUploadAvatar(groupname);
      if (generatedAvatar) {
        g_avatar_url = generatedAvatar;
        setAvatarUrl(generatedAvatar);
      }
    }
    const { data, error } = await supabase
      .from('groups')
      .insert([
        {
          name: groupname,
          profile_picture_url: g_avatar_url,
          currency: currency?.code,
          created_by: user.id
        }
      ])
      .select().single();

    if (error) {
      console.error(error);
      Alert.alert("Error creating the group:", error.message);
    } else {
      console.log('Data:', data);
      const { data2, error } = await supabase
      .from('user_groups')
      .insert([{
        user_id: user.id,
        group_id: data.id,
        role: 'admin'
      }])
      .select()
      if(error)
      {
          console.log('Error is ',error)
      }
      else
      {
  
        const { data3, error } = await supabase
        .from('invitations')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', data.id)
        .single();
      
      if (data3 && data3.id) {
        // update existing record
        const { data: updateData, error: updateError } = await supabase
          .from('invitations')
          .update({
            status: 'accepted',
          })
          .eq('id', data3.id);
      } else {
        // insert new record
        const { data: insertData, error: insertError } = await supabase
          .from('invitations')
          .insert({
            user_id: user.id,
            group_id: data.id,
            status: 'accepted',
          });
        }

        const {data: userdata,error: usererror} = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();



      await activityInsertUtils.insertUserJoinedGroup({user_name:userdata?.full_name,group_name:groupname}, user.id,data.id );
      await activityInsertUtils.insertGroupCreated({ group_name: groupname, description: '' }, user.id, data.id);  
      Alert.alert("New Group Created", `Group ${groupname} created successfully!`);
      //router.navigate(`/(group)/${data.id}`);
      router.replace(`/(group)/${data.id}`);
      }
    }
  }

  setLoading(false)
}



return (<View className="flex-1 justify-center bg-white px-6 py-4">
  <CustomStackScreen />
  
  {loading? <ActivityIndicator size="large" color={Colors.primary.DEFAULT}></ActivityIndicator>:<><View>

    <Avatar
      size={200}
      url={avatarUrl}
      onUpload={(url: string) => {
        setAvatarUrl(url);
      } } />
  </View><TextInput
      placeholder="Group Name"
      className="border-b border-blue-500 py-2 mb-4"
      editable={!loading}
      value={groupname}
      onChangeText={setGoupName} /><CurrencyPicker selectedCurrency={currency} onSelectCurrency={setCurrency} /><View className="flex-row justify-between mb-4">
      <TouchableOpacity className="bg-gray-200 py-2 px-6 rounded">
        <Text className="text-xl">Back</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-blue-500 py-2 px-6 rounded">
        <Pressable onPress={() => CreateNewGroup()}>
          <Text className="text-white text-xl">Create New Group</Text>
        </Pressable>
      </TouchableOpacity>
    </View></>

}
    
  </View>
  )







}

