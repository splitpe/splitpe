import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import CustomStackScreen from '~/components/CustomStackScreen';
import HelpAndSupport from '~/components/HelpSupport';

import { useAuth } from '~/contexts/AuthProvider';







export default function HAndS() {

    const { user } = useAuth();







  return (
    <>
    <CustomStackScreen />
    <HelpAndSupport />
    </>
  );
}