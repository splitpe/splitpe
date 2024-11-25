import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {Text,TouchableOpacity,Image,View} from 'react-native'
import { useAuth } from '~/contexts/AuthProvider';
import { Colors } from '~/types/colors';
import { supabase } from '~/utils/supabase';

export default function UserItem({ item, groupId }) {

    const [inviteStatus, setInviteStatus] = useState(false);
    const { user } = useAuth();

useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('status')
        .eq('user_id', item.id)
        .eq('group_id', groupId);
    console.log(data, error);
      if (error) {
        setInviteStatus(false);
      } else {
        setInviteStatus(data[0]?.status === 'pending'|| data[0]?.status === 'accepted');
      }  

    }
    fetchUsers();
}, []);

async function SendInvite(userId, groupId) {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        inviter_id: user.id,
        user_id: userId,
        group_id: groupId,
      })
      .select();
      console.log(data,error);
  
    if (error) {
      console.log(error.message);
    } else {
        setInviteStatus(true);
      console.log(data);}


}

return < 
View className="border-b border-gray-200"
>
 <View className="flex-row p-4 items-center gap-3">
{item.avatar_url ? (
  <Image 
  source={{ uri: item.avatar_url }}
    //src={{ uri: item.avatar_url.publicUrl }} 
    className="w-12 h-12 rounded-full"
  />
 // <Text>{item.avatarUrl}</Text>
) : (
  <View className=" bg-cgray-one w-12 h-12 rounded-full flex justify-center items-center"></View>
)}
<View className='flex-1'>
  <View className='flex-row justify-between items-center'>
<Text className="text-md font-inter text-gray-800">{item.full_name}</Text>

{inviteStatus?
    <View className='flex-row items-center text-center'>
<Text className='text-gray-800 text-sm font-inter'>Invite Sent</Text>
<MaterialIcons name="mobile-friendly" size={32} color='#f87171'/></View>
:
<TouchableOpacity onPress={() => SendInvite(item.id, groupId)}>
<View className='flex-row items-center text-center'>
<Text className='text-gray-800 text-sm font-inter'>Invite</Text>
<MaterialIcons name="send-to-mobile" size={32} color='#10b981'/></View></TouchableOpacity>


}
</View>
</View>
</View>
</View>
};
