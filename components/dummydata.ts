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
        user_name: 'Priya'
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
        currency: 'INR'
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
        user_name: 'Rahul'
      }
    },
    {
      id: '9',
      activity_type: 'user_joined_group',
      timestamp: '2024-10-18T16:30:00Z',
      details: {
        user_name: 'Rahul'
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


  const dummyMessages2 = [
    {
      id: '1',
      text: 'Salary Credit',
      amount: 50000,
      timestamp: '2023-11-09T10:30:00Z',
      type: 'credit'
    },
    {
      id: '2',
      text: 'Rent Payment',
      amount: 10000,
      timestamp: '2023-11-08T15:15:00Z',
      type: 'debit'
    },
    {
      id: '3',
      text: 'Grocery Shopping',
      amount: 2500,
      timestamp: '2023-11-07T18:45:00Z',
      type: 'debit'
    },
    {
      id: '4',
      text: 'Utility Bill Payment',
      amount: 1500,
      timestamp: '2023-11-06T12:30:00Z',
      type: 'debit'
    },
    {
      id: '5',
      text: 'Friend Repayment',
      amount: 500,
      timestamp: '2023-11-05T09:15:00Z',
      type: 'credit'
    }
  ];