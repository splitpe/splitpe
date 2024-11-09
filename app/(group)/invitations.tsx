import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomStackScreen from '~/components/CustomStackScreen';

import { useAuth } from '~/contexts/AuthProvider';
import { generateSignedUrl } from '~/helper/functions';
import { supabase } from '~/utils/supabase';

// Sample invitation data
const invitations = [
  {
    id: '1',
    inviterName: 'John Doe',
    inviterProfilePic: 'https://i.pravatar.cc/150?img=1',
    groupName: 'Weekend Getaway',
    groupProfilePic: 'https://picsum.photos/200?random=1',
  },
  {
    id: '2',
    inviterName: 'Jane Smith',
    inviterProfilePic: 'https://i.pravatar.cc/150?img=2',
    groupName: 'Book Club',
    groupProfilePic: 'https://picsum.photos/200?random=2',
  },
  {
    id: '3',
    inviterName: 'Mike Johnson',
    inviterProfilePic: 'https://i.pravatar.cc/150?img=3',
    groupName: 'Fitness Challenge',
    groupProfilePic: 'https://picsum.photos/200?random=3',
  },
];






const InvitationItem = ({ invitation, onAccept, onReject }) => (
  <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
    <View className="flex-row items-center flex-1 gap-3">
    {invitation.inviter.avatar_url?
      <Image
      source={{ uri: invitation.inviter.avatar_url }}
      className="w-12 h-12 rounded-full mr-4"
    />
  
    :
    <View className='bg-gray-200 w-12 h-12 rounded-full'></View>
    }
      <View className="flex-1">
        <Text className="font-semibold text-gray-800">
          {invitation.inviter.full_name}
        </Text>
        <Text className="text-sm text-gray-600">
          invites you to join
        </Text>
        <View className="flex-row items-center mt-1">
            {invitation.groups.profile_picture_url?
            <Image
            source={{ uri: invitation.groups.profile_picture_url }}
            className="w-6 h-6 rounded-full mr-2"
          />
            :
            <View className='w-6 h-6 rounded-full bg-gray-200'></View>
            }
          
          <Text className="font-medium text-gray-800">
            {invitation.groups.name}
          </Text>
        </View>
      </View>
    </View>
    <View className="flex-row">
      <TouchableOpacity
        onPress={() => onAccept(invitation)}
        className="bg-green-500 rounded-full p-2 mr-2"
        accessibilityLabel={`Accept invitation from ${invitation.inviterName}`}
      >
        <Icon name="check" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onReject(invitation.id)}
        className="bg-red-500 rounded-full p-2"
        accessibilityLabel={`Reject invitation from ${invitation.inviterName}`}
      >
        <Icon name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function InvitationList() {

const [invitations,setInvitations]=useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchGroupMembers = async () => {
          const { data, error } = await supabase
          .from('invitations')
          .select('id,user_id, group_id,inviter_id,groups:groups!invitations_group_id_fkey(name,profile_picture_url),inviter:profiles!invitations_inviter_id_fkey(full_name,avatar_url)')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          if (error) {
            console.error(error);
          }
          else {
    
            const updatedInvitedMembers = await Promise.all(data.map(async (item) => {
              if (item.inviter.avatar_url) {
                const inviterSignedUrl = await generateSignedUrl('avatars', item.user.avatar_url, 3600);
                return {
                  ...item,
                  inviter:{
                    ...item.inviter,
                    avatar_url: inviterSignedUrl,
                  }                  
                };
              }

              if (item.groups.profile_picture_url) {
                const GroupSignedUrl = await generateSignedUrl('avatars', item.groups.profile_picture_url, 3600);
                return {
                  ...item,
                  groups:{
                    ...item.groups,
                    profile_picture_url: GroupSignedUrl,
                  },
                  
                };
              }
              return item;
            }));
    
    
            console.log('Invited Member in Invites',updatedInvitedMembers);
            setInvitations(updatedInvitedMembers);
          }
        }
        fetchGroupMembers();
      }, [])
    





  async function handleAccept(item) {
    const { data, error } = await supabase
    .from('user_groups')
    .insert([{
      user_id: item.user_id,
      group_id: item.group_id,
      role: 'member'
    }])
    .select()
    if(error)
    {
        console.log('Error is ',error)
    }
    else
    {

    const {data,error} = await supabase
    .from('invitations')
    .update({
        status: 'accepted',
    })
    .eq('id',item.id)
    if(error)
    {
        console.log('Error is ',error)
    }
    else{
        setInvitations(invitations.filter((inv) => inv.id !== item.id));        
    }
    }
    // Implement accept logic here
  };

async function handleReject(id) {
    const {data,error} = await supabase
    .from('invitations')
    .delete()
    .eq('id',id)
    if(error)
    {
        console.log('Error is ',error)
    }
    else{
    setInvitations(invitations.filter((item) => item.id !== id));
    }
};

  return (
    <>
    <CustomStackScreen />
    <View className="flex-1 bg-gray-100">
      <Text className="text-2xl font-bold p-4 bg-white">
        Invitations
      </Text>
      <FlatList
        data={invitations}
        renderItem={({ item }) => (
          <InvitationItem
            invitation={item}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View className="p-4">
            <Text className="text-center text-gray-500">
              No invitations at the moment
            </Text>
          </View>
        }
      />
    </View>
    </>
  );
}