import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import CustomStackScreen from '~/components/CustomStackScreen';
import GroupScreen from '~/components/groupdetails';
import ProfileUpdate from '~/components/ProfileUpdate';
import { ScreenContent } from '~/components/ScreenContent';
import ActivityFeed from '~/components/ActivityFeed';
import { dummyActivities } from '~/components/dummydata';
import { StatusBar, View } from 'react-native';
import { router } from 'expo-router';

export default function Home() {

  const handleActivityPress = (activity: any) => {
    switch (activity.activity_type) {
      case 'group_created':
        // Redirect to group details screen
        router.push('/group/[id]', { id: activity.details.group_id });
        break;
      case 'user_invited':
        // Redirect to group members screen
        router.push('/group/[id]/members', { id: activity.details.group_id });
        break;
      case 'expense_added':
        // Redirect to expense details screen
        router.push('/expense/[id]', { id: activity.details.expense_id });
        break;
      // Add more cases for other activity types
      default:
        onPress();
    }


  };

  return (
    <>
      <CustomStackScreen />
      <View className='flex-1 bg-primary pt-10'>
      <ActivityFeed activities={dummyActivities} onActivityPress={handleActivityPress} />
      </View>
    </>
  );

}
function onPress() {
  throw new Error('Function not implemented.');
}

