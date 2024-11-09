import { Link, Redirect, Tabs } from 'expo-router';

import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';
import { useAuth } from '~/contexts/AuthProvider';
import {Colors} from '~/types/colors.tsx'
import { FontAwesome5 } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';



export default function TabLayout() {

  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Redirect href={"/appinfo"}/>
  }
  
    return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.dark,
        tabBarInactiveTintColor: Colors.primary.light,
        
      }}
            >
     <Tabs.Screen
        name="index"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color }) => <FontAwesome5 name="people-carry" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color }) => <MaterialIcons name="timeline" size={24} color={color} />,
        }}
      />

<Tabs.Screen
        name="tracking"
        options={{
          title: 'Track',
          tabBarIcon: ({ color }) => <MaterialIcons name="textsms" size={24} color={color} />,
        }}
      />

<Tabs.Screen
        name="theme"
        options={{
          title: 'Theme',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
        }}
      />



    </Tabs>

  );
}
