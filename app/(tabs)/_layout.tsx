import { Link, Redirect, Tabs } from 'expo-router';

import { HeaderButton } from '../../components/HeaderButton';
import { TabBarIcon } from '../../components/TabBarIcon';

export default function TabLayout() {

return <Redirect href={"/appinfo"}/>
  //   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: 'black',
//       }}>
//      <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Teams',
//           tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="timeline"
//         options={{
//           title: 'Timeline',
//           tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
//         }}
//       />

// <Tabs.Screen
//         name="tracking"
//         options={{
//           title: 'Track',
//           tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
//         }}
//       />

// <Tabs.Screen
//         name="theme"
//         options={{
//           title: 'Theme',
//           tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
}
