import { Stack } from 'expo-router';
import AccountSettings from '~/components/AccountSettings';

import { Container } from '~/components/Container';
import CustomStackScreen from '~/components/CustomStackScreen';
import HelpAndSupport from '~/components/HelpSupport';
import { ScreenContent } from '~/components/ScreenContent';
import UserItem from '~/components/UserItem';
import UserSearchList from '~/components/UserSearchList';

export default function Home() {
  const item = { id: 1, full_name: 'John Doe', avatar_url: 'https://i.pravatar.cc/300' };
  return (
    <>
<CustomStackScreen></CustomStackScreen>
    <AccountSettings />
    </>
 
);
}
