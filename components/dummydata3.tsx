export const dummyActivities = [
    {
      id: '1',
      activity_type: 'group_created',
      timestamp: '2024-10-16T10:00:00Z',
      details: {
        group_name: 'Goa Trip 2024',
        description: 'Expenses for our annual Goa vacation'
      }
    },
    {
      id: '2',
      activity_type: 'user_invited',
      timestamp: '2024-10-16T10:05:00Z',
      details: {
        user_name: 'Priya'
      }
    },
    {
      id: '3',
      activity_type: 'user_joined_group',
      timestamp: '2024-10-16T10:30:00Z',
      details: {
        user_name: 'Priya',
        group_name: 'Goa Trip 2024'
      }
    },
    {
      id: '4',
      activity_type: 'expense_added',
      timestamp: '2024-10-17T09:00:00Z',
      details: {
        expense_description: 'Flight Tickets',
        amount: 15000,
        currency: 'INR'
      }
    },
    {
      id: '5',
      activity_type: 'expense_updated',
      timestamp: '2024-10-17T09:30:00Z',
      details: {
        changes: {
          description: 'Flight Tickets (including taxes)'
        },
        new_amount: 16500
      }
    },
    {
      id: '6',
      activity_type: 'payment_made',
      timestamp: '2024-10-17T14:00:00Z',
      details: {
        amount: 5500,
        currency: 'INR',
        payer: 'Rahul',
        payee: 'Priya'
      }
    },
    {
      id: '7',
      activity_type: 'expense_added',
      timestamp: '2024-10-18T11:00:00Z',
      details: {
        expense_description: 'Hotel Booking',
        amount: 30000,
        currency: 'INR'
      }
    },
    {
      id: '8',
      activity_type: 'user_invited',
      timestamp: '2024-10-18T16:00:00Z',
      details: {
        user_name: 'Amit'
      }
    },
    {
      id: '9',
      activity_type: 'user_joined_group',
      timestamp: '2024-10-18T16:30:00Z',
      details: {
        user_name: 'Amit',
        group_name: 'Goa Trip 2024'
      }
    },
    {
      id: '10',
      activity_type: 'expense_deleted',
      timestamp: '2024-10-19T10:00:00Z',
      details: {
        expense_description: 'Cancelled Activity',
        amount: 2000,
        currency: 'INR'
      }
    },
    {
      id: '11',
      activity_type: 'expense_added',
      timestamp: '2024-10-20T12:00:00Z',
      details: {
        expense_description: 'Lunch at Beach Shack',
        amount: 1800,
        currency: 'INR'
      }
    },
    {
      id: '12',
      activity_type: 'payment_made',
      timestamp: '2024-10-20T18:00:00Z',
      details: {
        amount: 600,
        currency: 'INR',
        payer: 'Priya',
        payee: 'Amit'
      }
    },
    {
      id: '13',
      activity_type: 'expense_updated',
      timestamp: '2024-10-21T09:00:00Z',
      details: {
        changes: {
          description: 'Lunch at Beach Shack (including tips)'
        },
        new_amount: 2000
      }
    },
    {
      id: '14',
      activity_type: 'user_invited',
      timestamp: '2024-10-21T14:00:00Z',
      details: {
        user_name: 'Neha'
      }
    },
    {
      id: '15',
      activity_type: 'user_joined_group',
      timestamp: '2024-10-21T15:30:00Z',
      details: {
        user_name: 'Neha',
        group_name: 'Goa Trip 2024'
      }
    },
    {
      id: '16',
      activity_type: 'expense_added',
      timestamp: '2024-10-22T11:00:00Z',
      details: {
        expense_description: 'Scuba Diving Session',
        amount: 12000,
        currency: 'INR'
      }
    },
    {
      id: '17',
      activity_type: 'payment_made',
      timestamp: '2024-10-22T20:00:00Z',
      details: {
        amount: 3000,
        currency: 'INR',
        payer: 'Neha',
        payee: 'Rahul'
      }
    },
    {
      id: '18',
      activity_type: 'expense_deleted',
      timestamp: '2024-10-23T08:00:00Z',
      details: {
        expense_description: 'Cancelled Parasailing',
        amount: 1500,
        currency: 'INR'
      }
    },
    {
      id: '19',
      activity_type: 'user_left_group',
      timestamp: '2024-10-23T16:00:00Z',
      details: {
        user_name: 'Amit'
      }
    },
    {
      id: '20',
      activity_type: 'expense_added',
      timestamp: '2024-10-24T13:00:00Z',
      details: {
        expense_description: 'Group Dinner at Beachside Restaurant',
        amount: 5000,
        currency: 'INR'
      }
    }
  ];
  
  export const dummyMessages = [
    {
      id: '1',
      text: 'Paid ₹500 for dinner at Beachside Cafe',
      timestamp: '2024-10-20T20:30:00Z'
    },
    {
      id: '2',
      text: 'Received ₹1500 from Priya for hotel booking',
      timestamp: '2024-10-21T09:15:00Z'
    },
    {
      id: '3',
      text: 'Spent ₹2000 on water sports activities',
      timestamp: '2024-10-21T16:45:00Z'
    },
    {
      id: '4',
      text: 'Rahul paid ₹800 for group taxi ride',
      timestamp: '2024-10-22T11:30:00Z'
    },
    {
      id: '5',
      text: 'Split bill of ₹3000 for seafood dinner',
      timestamp: '2024-10-22T21:00:00Z'
    }
  ];