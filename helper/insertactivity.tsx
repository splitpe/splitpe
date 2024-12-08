import { supabase } from '../utils/supabase';
// Define the shape of an activity based on your schema
interface Activity {
  id?: string;
  activity_type: 'group_created' | 'user_invited' | 'user_joined_group' | 
                 'expense_added' | 'expense_updated' | 'expense_deleted' | 
                 'payment_made' | 'user_left_group';
  // timestamp: string;
  group_id: number;
  created_by: string;
  details: Record<string, any>;
}

// Utility function to insert a single activity
async function insertActivity(activity: Omit<Activity, 'id'>) {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select();

  if (error) {
    console.error('Error inserting activity:', error);
    throw error;
  }

  return data;
}

// Specific insertion functions for each activity type
export const activityInsertUtils = {
  // Group Created Activity
  async insertGroupCreated(details: {
    group_name: string, 
    description: string
  }, createdBy: string, groupId: number) {
    return insertActivity({
      activity_type: 'group_created',
      // timestamp: new Date().toISOString(),
      group_id: groupId,
      created_by: createdBy,
      details: details
    });
  },

  // User Invited Activity
  async insertUserInvited(details: {
    user_name: string,
    group_name: string
  }, invitedBy: string, groupId: number) {
    return insertActivity({
      activity_type: 'user_invited',
      // timestamp: new Date().toISOString(),
      group_id: groupId,
      created_by: invitedBy,
      details: details
    });
  },

  // User Joined Group Activity
  async insertUserJoinedGroup(details: {
    user_name: string,
    group_name: string
  }, joinedBy: string, groupId: number) {
    return insertActivity({
      activity_type: 'user_joined_group',
      // timestamp: new Date().toISOString(),
      group_id: groupId,
      created_by: joinedBy,
      details: details
    });
  },

  // Expense Added Activity
  async insertExpenseAdded(details: {
    expense_description: string,
    amount: number,
    currency: string
  }, addedBy: string, groupId: number) {
    return insertActivity({
      activity_type: 'expense_added',
      // timestamp: new Date().toISOString(),
      group_id: groupId,
      created_by: addedBy,
      details: details
    });
  },

  // Expense Updated Activity
  async insertExpenseUpdated(details: {
    changes: Record<string, any>,
    new_amount: number
  }, updatedBy: string, groupId: number) {
    return insertActivity({
      activity_type: 'expense_updated',
      // timestamp: new Date().toISOString(),
      group_id: groupId,
      created_by: updatedBy,
      details: details
    });
  },

  // Expense Deleted Activity
  async insertExpenseDeleted(details: {
    expense_description: string,
    amount: number,
    currency: string
  }, deletedBy: string, groupId: number) {
    return insertActivity({
      activity_type: 'expense_deleted',
      // timestamp: new Date().toISOString(),
      group_id: groupId,
      created_by: deletedBy,
      details: details
    });
  },

  // Payment Made Activity
  async insertPaymentMade(details: {
    amount: number,
    currency: string,
    payer: string,
    payee: string
  }, createdBy: string, groupId: number) {
    return insertActivity({
      activity_type: 'payment_made',
      // timestamp: new Date().toISOString(),
      group_id: groupId,
      created_by: createdBy,
      details: details
    });
  },

  // User Left Group Activity
  async insertUserLeftGroup(details: {
    user_name: string,
    group_name: string
  }, leftBy: string, groupId: number) {
    return insertActivity({
      activity_type: 'user_left_group',
      // timestamp: new Date().toISOString(),
      group_id: groupId,
      created_by: leftBy,
      details: details
    });
  },

  // Bulk insert function for the dummy data
  async  insertDummyActivities(dummyActivities: any[], groupId: number, defaultCreatedBy: string) {
    const formattedActivities: Activity[] = dummyActivities.map(activity => ({
      activity_type: activity.activity_type,
      // timestamp: activity.timestamp,
      group_id: groupId,
      created_by: defaultCreatedBy, // You might want to map this dynamically based on your requirements
      details: activity.details
    }));
    console.log(formattedActivities);
    const { data, error } = await supabase
      .from('activities')
      .insert(formattedActivities)
      .select();

    if (error) {
      console.error('Error inserting dummy activities:', error);
      throw error;
    }

    return data;
  }
};

// Example usage
// const groupId = 1;
// const createdBy = 'user-uuid-here';
// await activityInsertUtils.insertDummyActivities(dummyActivities, groupId, createdBy);