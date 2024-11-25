import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupport() {
  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-purple-100 to-blue-100">
      <View className="p-6">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-3xl font-interBold  text-primary">Help & Support</Text>
          <Ionicons name="help-circle-outline" size={40} color="#16a34a" />
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <Text className="text-xl font-amaranthBold text-primary mb-4">Suja Technologies</Text>
          <Text className="text-gray-600 font-amaranthRegular mb-2">Innovating for a brighter future</Text>
          <Text className="text-gray-600 font-amaranthRegular">123 Tech Avenue, Silicon Valley, CA 94000</Text>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <Text className="text-xl font-amaranthBold text-primary mb-4">Contact Us</Text>
          <View className="flex-row items-center mb-4">
            <Ionicons name="mail-outline" size={24} color="#6B46C1" />
            <Text className="text-gray-600 font-amaranthRegular ml-4">splitpe2024@gmail.com</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={24} color="#6B46C1" />
            <Text className="text-gray-600 font-amaranthRegular ml-4">+91 91234567890</Text>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-lg">
          <View className="flex-row items-center mb-4">
            <Ionicons name="help-buoy-outline" size={24} color="#6B46C1" />
            <Text className="text-xl font-semibold text-primary ml-2">FAQ</Text>
          </View>
          <View className="space-y-4 gap-5">
            <View>
              <Text className="text-primary font-amaranthRegular mb-1">How do I reset my password?</Text>
              <Text className="text-gray-600 font-amaranthItalic">Drop a mail to splitpe2024@gmail.com</Text>
            </View>
            <View>
              <Text className="text-primary font-amaranthRegular mb-1">What are your business hours?</Text>
              <Text className="text-gray-600 font-amaranthItalic">We're available 24/7 for online support. Office hours: 9 AM - 5 PM PST.</Text>
            </View>
            <View>
              <Text className="text-primary font-amaranthRegular mb-1">How can I request a feature?</Text>
              <Text className="text-gray-600 font-amaranthItalic">Email your suggestions to splitpe2024@gmail.com.</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}