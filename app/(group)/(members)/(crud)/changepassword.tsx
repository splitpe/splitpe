import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import CustomStackScreen from '~/components/CustomStackScreen';
import { supabase } from '~/utils/supabase'; // Import your Supabase client

const PasswordReset = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill out both fields.');
      return;
    }
    
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password should be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: supabase.auth.user()?.email,
        password: currentPassword,
      });

      if (signInError) {
        Alert.alert('Error', 'Current password is incorrect.');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert('Error', 'Could not update password. Please try again.');
      } else {
        Alert.alert('Success', 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <CustomStackScreen screen="changepassword" />
    <View className='flex-1 justify-center px-4 bg-gray-100'>
      <Text className='text-2xl font-interBold text-center mb-6'>Reset Password</Text>
      
      <Text className='text-lg font-interBold mb-2'>Current Password</Text>
      <TextInput
        className='border p-4 rounded-md bg-white font-inter mb-4'
        secureTextEntry
        placeholder="Enter current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      
      <Text className='text-lg font-interBold mb-2'>New Password</Text>
      <TextInput
        className='border p-4 rounded-md font-inter bg-white mb-4'
        secureTextEntry
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity
      className={loading ? 'bg-primary p-4 rounded-md opacity-50' :'bg-primary p-4 rounded-md'}
          
        onPress={handlePasswordReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className='text-white text-lg font-semibold text-center'>Update Password</Text>
        )}
      </TouchableOpacity>
    </View>
    </>
  );
};

export default PasswordReset;
