import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Animated, 
  Alert, 
  Platform, 
  PermissionsAndroid 
} from 'react-native'
import SmsListener from 'react-native-android-sms-listener'
import { PlusCircle, XCircle, AlertCircle } from 'lucide-react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import * as SMS from 'expo-sms'; 


interface Message {
  id: string
  text: string
  amount: number
  timestamp: string
  type: 'credit' | 'debit'
}

export default function TransactionListener() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const fadeAnim = useState(new Animated.Value(1))[0]

  // Request SMS reading permissions
  const requestSMSPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
        ]);

        const readSmsGranted = 
          granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED;
        const receiveSmsGranted = 
          granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED;

        return readSmsGranted && receiveSmsGranted;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return false;
  }



  // Toggle SMS listener
  const toggleSMSListener = async () => {
    // Animate switch
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start()

    // Handle toggling
    if (!isEnabled) {
      // Check and request permissions before enabling
      const hasPermission = await requestSMSPermissions()
      if (!hasPermission) {
        Alert.alert('Permission Required', 'SMS reading permission is needed to use this feature.')
        return
      }

      // Start listening for SMS
      try {
        const subscription = SmsListener.addListener(async (message) => {
          try {
            // Basic parsing logic - customize based on your bank's SMS format
            const amountMatch = message.message.match(/(?:Rs\.|₹)\s*([\d,]+\.?\d*)/i)
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0
            
            const typeMatch = message.message.toLowerCase().includes('credited') ? 'credit' : 'debit'

            const newMessage: Message = {
              id: Date.now().toString(),
              text: message.message,
              amount: amount,
              timestamp: new Date(message.timestamp).toLocaleString(),
              type: typeMatch
            }

            setMessages(prev => [newMessage, ...prev])
          } catch (parseError) {
            console.error('Error parsing SMS:', parseError)
          }
        });

        // Store the subscription to allow removal later
        this.smsSubscription = subscription;
        setIsEnabled(true)
      } catch (error) {
        console.error('Failed to start SMS listener:', error)
        Alert.alert('Error', 'Could not start SMS listener')
      }
    } else {
      // Stop listening for SMS
      if (this.smsSubscription) {
        this.smsSubscription.remove();
        this.smsSubscription = null;
      }
      setIsEnabled(false)
    }
  }

  // Clear all messages
  function clearMessages() {
    Alert.alert(
      'Confirm Deletion of Messages',
      'Are you sure you want to delete all the messages?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMessages([]);
          },
        },
      ]
    );
  }

  // Handle adding a transaction (potentially to a database or another system)
  const handleAddTransaction = (message: Message) => {
    console.log('Adding transaction:', message)
    // Implement your transaction adding logic here
    // For now, we'll just remove the message from the list
    setMessages(prev => prev.filter(m => m.id !== message.id))
  }

  // Remove a specific message
  const handleRemoveMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (this.smsSubscription) {
        this.smsSubscription.remove();
      }
    }
  }, [])

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="p-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-interBold text-gray-900">SMS Transaction Listener</Text>
          <Text className="text-sm text-gray-500 font-inter">{messages.length} messages</Text>
          <TouchableOpacity onPress={clearMessages}>
            <Text className="text-sm font-inter text-red-500">Clear All Messages</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center space-x-2">
          <Text className="text-sm font-interBold text-gray-600">{isEnabled ? 'Enabled' : 'Disabled'}</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled ? '#1d4ed8' : '#f4f3f4'}
            onValueChange={toggleSMSListener}
            value={isEnabled}
          />
        </View>
      </View>

      {/* Message List */}
      <ScrollView className="flex-1">
        <Animated.View style={{ opacity: fadeAnim }}>
          {messages.map((message) => (
            <View
              key={message.id}
              className="mx-4 my-2 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center space-x-2 gap-2">
                  <View className={`w-4 h-4 rounded-full ${message.type === 'credit' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <Text className="text-sm font-interBold text-gray-900">
                    Rs. {message.amount.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => handleAddTransaction(message)}
                    className="p-2"
                  >
                    <AntDesign name="pluscircleo" size={24} color="green" /> 
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveMessage(message.id)}
                    className="p-2"
                  >
                    <AntDesign name="closecircleo" size={24} color="red" />    
                  </TouchableOpacity>
                </View>
              </View>
              <Text className="text-sm font-inter text-gray-600">{message.text}</Text>
              <Text className="text-xs font-inter text-gray-400 mt-2">{message.timestamp}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Empty State */}
      {messages.length === 0 && (
        <View className="flex-1 justify-center items-center p-4">
          <AlertCircle size={40} color="#9ca3af" />
          <Text className="text-gray-500 mt-2 text-center">
            {isEnabled ? 'Waiting for new SMS messages...' : 'Enable the listener to start receiving SMS'}
          </Text>
        </View>
      )}
    </View>
  )
}