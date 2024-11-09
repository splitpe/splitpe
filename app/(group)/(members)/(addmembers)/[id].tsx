import { Stack, useLocalSearchParams } from 'expo-router';

import { Container } from '~/components/Container';
import CustomStackScreen from '~/components/CustomStackScreen';
import { ScreenContent } from '~/components/ScreenContent';
import UserSearchList from '~/components/UserSearchList';
import {Text} from 'react-native'

export default function Home() {
    const params = useLocalSearchParams();
  const groupId = params.id;
  return (
    <>
      <CustomStackScreen />
      {/* <Container>
        <ScreenContent path="app/(drawer)/(tabs)/theme.tsx" title="Theme" />
      </Container> */}

      <UserSearchList groupId={groupId}></UserSearchList>
    </>
 
);
}
