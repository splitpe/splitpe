import { Stack } from 'expo-router';

import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Timeline' }} />
      <Container>
        <ScreenContent path="app/(drawer)/(tabs)/timeline.tsx" title="Timeline" />
      </Container>
    </>
  );

}
