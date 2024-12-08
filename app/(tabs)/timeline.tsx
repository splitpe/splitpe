
import CustomStackScreen from '~/components/CustomStackScreen';
import ActivityFeed from '~/components/ActivityFeed';
import { dummyActivities } from '~/components/dummydata3';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { activityInsertUtils } from '~/helper/insertactivity';
import { useAuth } from '~/contexts/AuthProvider';
import { supabase } from '~/utils/supabase';

export default function Home() {

  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activities,setActivities] = useState([]);



  const handleActivityPress = (activity: any) => {
    switch (activity.activity_type) {
      case 'group_created':
        // Redirect to group details screen
        router.push('/group/[id]', { id: activity.group_id });
        break;
      case 'user_invited':
        // Redirect to group members screen
        router.push('/(group)/[id]/(members)/', { id: activity.group_id });
        break;
      case 'expense_added':
        // Redirect to expense details screen
        router.push('/expense/[id]', { id: activity.details.expense_id });
        break;
      // Add more cases for other activity types
      case 'user_joined_group':
        console.log('User joined group', activity.group_id);
        router.replace('/(group)/'+activity.group_id);
        break;
      default:
        onPress();
    }


  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };



  // useEffect(() => {
  //   activityInsertUtils.insertDummyActivities(dummyActivities, 31, user.id);
  // }, []);


  async function fetchActivities() {


    const { data: userGroups, error: userGroupsError } = await supabase
      .from('user_groups')
      .select('group_id')
      .eq('user_id', user?.id);
    
    if (userGroupsError) {
      console.error(userGroupsError);
    } else {
      const groupIds = userGroups.map(group => group.group_id);
    
      // Fetch activities for the user's groups
      const { data: activity, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .in('group_id', groupIds);
    
      if (activitiesError) {
        console.error(activitiesError);
        return []
      } else {
        //console.log(activity);
        setActivities(activity);
      }
    }
    
     
    }
    


  useEffect(() => {
fetchActivities();

  }, []);

  return (

    <>
      <CustomStackScreen />
      {refreshing && (
  <ActivityIndicator size="small" color="#007bff" />
)}
      <View className='flex-1 bg-primary pt-10'>
      <ActivityFeed activities={activities} onActivityPress={handleActivityPress} onRefresh={handleRefresh} refreshing={refreshing} />
      </View>
    </>
  );

}
function onPress() {
  throw new Error('Function not implemented.');
}

