import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { View,Text } from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import CustomStackScreen from '~/components/CustomStackScreen';
import GroupScreen from '~/components/groupdetails';
import { supabase } from '~/utils/supabase';
import { router } from 'expo-router';
import { Colors } from '~/types/colors';


export default function GroupDetails() {
    const params = useLocalSearchParams();
    const groupId = params.id;
    const actions = [
      {
        text: "Group Creation",
        icon: <MaterialCommunityIcons name="account-group" size={24} color="white" />,
        name: "bt_group_creation",
        position: 3,
        color: '#2EC7AB',
        buttonSize:50,
        textStyle: {
          fontSize: 16,
        },
      },
      {
        text: "New Transaction",
        icon: <FontAwesome name="credit-card" size={24} color="white" />,
        name: "bt_accessibility",
        position: 2,
        color: '#EA638C',
        buttonSize:50,
        textStyle: {
          fontSize: 16,
        },
      },
      {
        text: "Scan Group QR Code",
        icon: <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />,
        name: "bt_qr_code",
        position: 1,
        color: '#257180',
        buttonSize:50,
        textStyle: {
          fontSize: 16,
        },
      },
    
    ];
  

  return (
    // Render the group details
    <View className='flex-1'>
    <CustomStackScreen />
    
     <GroupScreen id={groupId}></GroupScreen>
     <FloatingAction
    actions={actions}
    onPressItem={name => {
      console.log(`selected button: ${name}`);
      if(name == "bt_group_creation"){
        router.navigate('/(group)/newgroup')
      }
      else if(name == "bt_accessibility"){
        router.navigate('/(expense)/AddExpense?groupID='+groupId)
      }
      else if(name == "bt_qr_code"){
        router.navigate('/(group)/scanaddgroup')
      }
    }}
    color={Colors.primary.DEFAULT}
  />

    </View>
  );

}