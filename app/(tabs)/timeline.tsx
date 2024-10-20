import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import CustomStackScreen from '~/components/CustomStackScreen';
import GroupScreen from '~/components/groupdetails';
import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <>
      <CustomStackScreen />
      <GroupScreen></GroupScreen>
      {/* <Container>
        <ScreenContent path="app/(drawer)/(tabs)/timeline.tsx" title="Timeline" />
      </Container> */}
    </>
  );

}
