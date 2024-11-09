import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


type Activity = {
  id: string;
  activity_type: string;
  timestamp: string;
  details: any;
};

type ActivityFeedProps = {
  activities: Activity[];
  onActivityPress: (activity: Activity) => void;
};

const ActivityIcon = ({ type }: { type: string }) => {
  let iconName = 'information-circle';
  switch (type) {
    case 'group_created':
      iconName = 'people';
      break;
    case 'user_invited':
    case 'user_joined_group':
      iconName = 'person-add';
      break;
    case 'expense_added':
    case 'expense_updated':
    case 'expense_deleted':
      iconName = 'cash';
      break;
    case 'payment_made':
      iconName = 'card';
      break;
    case 'user_left_group':
      iconName = 'person-remove';
      break;
  }
  return <Ionicons name={iconName as any} size={24} className="text-blue-500" />;
};

const ActivityItem = ({ activity, onPress }: { activity: Activity; onPress: () => void }) => {
  const getActivityDescription = () => {
    switch (activity.activity_type) {
      case 'group_created':
        return `Group "${activity.details.group_name}" created`;
      case 'user_invited':
        return `${activity.details.user_name} was invited to the group`;
      case 'user_joined_group':
        return `${activity.details.user_name} joined the group`;
      case 'expense_added':
        return `New expense: ${activity.details.expense_description} (₹${activity.details.amount})`;
      case 'expense_updated':
        return `Expense updated: ${activity.details.changes.description || 'No description'} (₹${activity.details.new_amount})`;
      case 'expense_deleted':
        return `Expense deleted: ${activity.details.expense_description} (₹${activity.details.amount})`;
      case 'payment_made':
        return `Payment made: ₹${activity.details.amount}`;
      case 'user_left_group':
        return `${activity.details.user_name} left the group`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-200"
      onPress={onPress}
    >
      <View className="mr-4">
        <ActivityIcon type={activity.activity_type} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">
          {getActivityDescription()}
        </Text>
        <Text className="text-sm text-gray-500">
          {new Date(activity.timestamp).toLocaleString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} className="text-gray-400" />
    </TouchableOpacity>
  );
};

export default function ActivityFeed({ activities, onActivityPress }: ActivityFeedProps) {
  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityItem activity={item} onPress={() => onActivityPress(item)} />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-lg text-gray-500">No activities yet</Text>
          </View>
        }
      />
    </View>
  );
}