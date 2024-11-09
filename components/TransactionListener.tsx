import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch, Animated } from 'react-native'
import { PlusCircle, XCircle, AlertCircle } from 'lucide-react-native'
import AntDesign from '@expo/vector-icons/AntDesign';

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

  // Simulate receiving new messages when enabled
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isEnabled) {
      interval = setInterval(() => {
        const newMessage: Message = {
          id: Math.random().toString(),
          text: `A/c *6268 ${Math.random() > 0.5 ? 'credited' : 'debited'} for Rs:${(Math.random() * 1000).toFixed(2)} on ${new Date().toLocaleString()} by mob Bk ref no ${Math.floor(Math.random() * 10000000000)}`,
          amount: parseFloat((Math.random() * 1000).toFixed(2)),
          timestamp: new Date().toLocaleString(),
          type: Math.random() > 0.5 ? 'credit' : 'debit'
        }
        setMessages(prev => [newMessage, ...prev])
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [isEnabled])

  const toggleSwitch = () => {
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
    setIsEnabled(prev => !prev)
  }

  function clearMessages() {
    setMessages([])
  }

  const handleAddTransaction = (message: Message) => {
    console.log('Adding transaction:', message)
    // Implement your transaction adding logic here
    setMessages(prev => prev.filter(m => m.id !== message.id))
  }

  const handleRemoveMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="p-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold text-gray-900">Transaction Listener</Text>
          <Text className="text-sm text-gray-500">{messages.length} messages</Text>
          <TouchableOpacity onPress={() => clearMessages()}><Text className="text-sm text-red-500">Clear Messages</Text></TouchableOpacity>
        </View>
        <View className="flex-row items-center space-x-2">
        
          <Text className="text-sm text-gray-600">{isEnabled ? 'Enabled' : 'Disabled'}</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled ? '#1d4ed8' : '#f4f3f4'}
            onValueChange={toggleSwitch}
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
                  <Text className="text-sm font-medium text-gray-900">
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
              <Text className="text-sm text-gray-600">{message.text}</Text>
              <Text className="text-xs text-gray-400 mt-2">{message.timestamp}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Empty State */}
      {messages.length === 0 && (
        <View className="flex-1 justify-center items-center p-4">
          <AlertCircle size={40} color="#9ca3af" />
          <Text className="text-gray-500 mt-2 text-center">
            {isEnabled ? 'Waiting for new messages...' : 'Enable the listener to start receiving messages'}
          </Text>
        </View>
      )}
    </View>
  )
}