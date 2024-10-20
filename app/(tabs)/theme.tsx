import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import UserItem from '~/components/UserItem';
import UserSearchList from '~/components/UserSearchList';

export default function Home() {
  const item = { id: 1, full_name: 'John Doe', avatar_url: 'https://i.pravatar.cc/300' };
  return (
    <>
      <Stack.Screen options={{ title: 'Theme' }} />
      {/* <Container>
        <ScreenContent path="app/(drawer)/(tabs)/theme.tsx" title="Theme" />
      </Container> */}
<UserSearchList></UserSearchList>
    </>
 
);
}
