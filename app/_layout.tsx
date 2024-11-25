import '../global.css';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import  AuthProvider from 'contexts/AuthProvider';
export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

import { MenuProvider } from 'react-native-popup-menu';

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    Poppins: require('~/assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('~/assets/fonts/Poppins-Bold.ttf'),
    PoppinsMedium: require('~/assets/fonts/Poppins-Medium.ttf'),
    PoppinsSemiBold: require('~/assets/fonts/Poppins-SemiBold.ttf'),
    InterBlack: require('~/assets/fonts/Inter-Black.otf'),
    Inter: require('~/assets/fonts/Inter-Regular.otf'),
    InterBold: require('~/assets/fonts/Inter-Bold.otf'),
    Narnoor: require('~/assets/fonts/Narnoor-Regular.ttf'),
    NarnoorBold: require('~/assets/fonts/Narnoor-Bold.ttf'),
    AmaranthRegular:require('~/assets/fonts/Amaranth-Regular.otf'),
    AmaranthBold:require('~/assets/fonts/Amaranth-Bold.otf'),
    AmaranthItalic:require('~/assets/fonts/Amaranth-Italic.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }
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
