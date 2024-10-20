import { useLocalSearchParams } from 'expo-router';
import { View,Text } from 'react-native';
import CustomStackScreen from '~/components/CustomStackScreen';
import GroupScreen from '~/components/groupdetails';
import { supabase } from '~/utils/supabase';

export default function GroupDetails() {
    const params = useLocalSearchParams();
    const groupId = params.id;


  return (
    // Render the group details
    <View className='flex-1'>
    <CustomStackScreen />
    
     <GroupScreen id={groupId}></GroupScreen>
    </View>
  );

}