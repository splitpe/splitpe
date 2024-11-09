import '../global.css';

import { Stack } from 'expo-router';
import  AuthProvider from 'contexts/AuthProvider';
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

import { MenuProvider } from 'react-native-popup-menu';

export default function RootLayout() {
  return (
    <AuthProvider>
       <MenuProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
       <Stack.Screen name="(auth)" options={{ headerShown: false }} /> 
       <Stack.Screen name="(group)" options={{ headerShown: false }} /> 
       <Stack.Screen name="(expense)" options={{ headerShown: false }} /> 
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
    </MenuProvider>
    </AuthProvider>
  );
}
