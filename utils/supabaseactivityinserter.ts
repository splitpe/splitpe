'use client'

import { supabase } from '~/utils/supabase';

export default function SupabaseActivityInserter() {
  const supabase = createClientComponentClient()

  const insertActivity = async (activityType: string, groupId: string, createdBy: string, details: any) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          activity_type: activityType,
          timestamp: new Date().toISOString(),
          group_id: groupId,
          created_by: createdBy,
          details: details
        })

      if (error) throw error
      console.log(`${activityType} activity inserted successfully`)
      return data
    } catch (error) {
      console.error('Error inserting activity:', error)
      throw error
    }
  }

  const insertGroupCreated = async (groupId: string, createdBy: string, groupName: string, description: string) => {
    return insertActivity('group_created', groupId, createdBy, { group_name: groupName, description })
  }

  const insertUserInvited = async (groupId: string, invitedBy: string, userName: string) => {
    return insertActivity('user_invited', groupId, invitedBy, { user_name: userName })
  }

  const insertUserJoinedGroup = async (groupId: string, userId: string, userName: string) => {
    return insertActivity('user_joined_group', groupId, userId, { user_name: userName })
  }

  const insertExpenseAdded = async (groupId: string, addedBy: string, description: string, amount: number, currency: string) => {
    return insertActivity('expense_added', groupId, addedBy, { expense_description: description, amount, currency })
  }

  const insertExpenseUpdated = async (groupId: string, updatedBy: string, changes: any, newAmount: number) => {
    return insertActivity('expense_updated', groupId, updatedBy, { changes, new_amount: newAmount })
  }

  const insertExpenseDeleted = async (groupId: string, deletedBy: string, description: string, amount: number) => {
    return insertActivity('expense_deleted', groupId, deletedBy, { expense_description: description, amount })
  }

  const insertPaymentMade = async (groupId: string, payerId: string, payeeId: string, amount: number, currency: string) => {
    return insertActivity('payment_made', groupId, payerId, { amount, currency, payer_id: payerId, payee_id: payeeId })
  }

  const insertUserLeftGroup = async (groupId: string, userId: string, userName: string) => {
    return insertActivity('user_left_group', groupId, userId, { user_name: userName })
  }

  const insertDummyData = async () => {
    const groupId = 'group-001'
    const user1Id = 'user-001'
    const user2Id = 'user-002'
    const user3Id = 'user-003'

    try {
      await insertGroupCreated(groupId, user1Id, 'Goa Trip 2024', 'Expenses for our annual Goa vacation')
      await insertUserInvited(groupId, user1Id, 'Priya')
      await insertUserJoinedGroup(groupId, user2Id, 'Priya')
      await insertExpenseAdded(groupId, user1Id, 'Flight Tickets', 15000, 'INR')
      await insertExpenseUpdated(groupId, user1Id, { description: 'Flight Tickets (including taxes)' }, 16500)
      await insertPaymentMade(groupId, user2Id, user1Id, 5500, 'INR')
      await insertExpenseAdded(groupId, user2Id, 'Hotel Booking', 30000, 'INR')
      await insertUserInvited(groupId, user1Id, 'Amit')
      await insertUserJoinedGroup(groupId, user3Id, 'Amit')
      await insertExpenseDeleted(groupId, user1Id, 'Cancelled Activity', 2000)
      await insertUserLeftGroup(groupId, user3Id, 'Amit')

      console.log('All dummy data inserted successfully')
    } catch (error) {
      console.error('Error inserting dummy data:', error)
    }
  }

  return {
    insertGroupCreated,
    insertUserInvited,
    insertUserJoinedGroup,
    insertExpenseAdded,
    insertExpenseUpdated,
    insertExpenseDeleted,
    insertPaymentMade,
    insertUserLeftGroup,
    insertDummyData
  }
}