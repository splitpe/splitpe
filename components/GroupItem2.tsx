import { useFonts } from "expo-font"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { View, Text, Image, Pressable, ActivityIndicator } from "react-native"
import { useAuth } from "~/contexts/AuthProvider"
import AmountDisplay from "~/helper/FormattedText"
import { generateSignedUrl } from "~/helper/functions"
import { supabase } from "~/utils/supabase"
import { LinearGradient } from "expo-linear-gradient"

interface Balance {
  user_id: string
  name: string
  avatarUrl: string
  amount: number
}

interface GroupItemProps {
  group: {
    id: string
    name: string
    profile_picture_url?: string
  }
}

export default function GroupItem({ group }: GroupItemProps) {
  const [balances, setBalances] = useState<Balance[]>([])
  const [userBalance, setUserBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalExpense, setTotalExpense] = useState(0)
  const { user } = useAuth()
  const groupId = group.id

  const [fontsLoaded] = useFonts({
    'Ubuntu-Regular': require('~/assets/fonts/Ubuntu-Regular.ttf'),
    'Ubuntu-Medium': require('~/assets/fonts/Ubuntu-Medium.ttf'),
    'Ubuntu-Bold': require('~/assets/fonts/Ubuntu-Bold.ttf'),
  })

  useEffect(() => {
    const fetchTotalExpense = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('expenses')
          .select('amount')
          .eq('group_id', groupId)
        
        if (error) throw error

        const total = data.reduce((acc, expense) => acc + parseFloat(expense.amount), 0)
        setTotalExpense(total)
      } catch (error) {
        console.error('Error fetching total expense:', error)
        setTotalExpense(0)
      } finally {
        setLoading(false)
      }
    }
    fetchTotalExpense()
  }, [groupId])

  const fetchBalances = async () => {
    try {
      const { data: allBalances, error } = await supabase
        .from('balances')
        .select(`
          amount,
          balance_with_user_id,
          user_id,
          profiles!balances_balance_with_user_id_new_fkey(
            full_name,
            avatar_url
          ),
          users:profiles!balances_user_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)

      if (error) throw error

      const balancesByUser = allBalances.reduce((acc, balance) => {
        const userId = balance.user_id
        if (acc[userId]) {
          acc[userId].amount += balance.amount
        } else {
          acc[userId] = {
            user_id: userId,
            name: balance.users.full_name,
            avatarUrl: balance.users.avatar_url,
            amount: balance.amount,
          }
        }
        return acc
      }, {} as Record<string, Balance>)

      const formattedBalances = Object.values(balancesByUser)

      const updatedBalances = await Promise.all(
        formattedBalances.map(async (balance) => {
          if (!balance.avatarUrl) return balance
          const signedUrl = await generateSignedUrl("avatars", balance.avatarUrl, 3600)
          return { ...balance, avatarUrl: signedUrl }
        })
      )

      const userBalance = updatedBalances.find(bal => bal.user_id === user.id)
      const otherBalances = updatedBalances.filter(bal => bal.user_id !== user.id)
      
      setUserBalance(userBalance || null)
      setBalances(otherBalances)
    } catch (error) {
      console.error('Error fetching balances:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalances()
  }, [])

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" className="flex-1" color="#A855F7" />
  }

  if (loading) {
    return (
      <View className="min-h-56 rounded-xl bg-white shadow-md p-4 mb-4 items-center justify-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    )
  }

  return (
    <Pressable 
      onPress={() => router.navigate("/(group)/" + group.id)}
      className="active:opacity-90"
    >
      <View className="bg-white min-h-56 rounded-xl p-4 mb-4 shadow-lg">
        <LinearGradient
          colors={['#A855F7', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-xl p-4 mb-2"
        >
          <View className="flex-row items-center">
            <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center">
              {group.profile_picture_url ? (
                <Image 
                  source={{ uri: group.profile_picture_url }}
                  className="w-16 h-16 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-white/30" />
              )}
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-white text-xl font-['Ubuntu-Bold']">
                {group.name}
              </Text>
              {totalExpense > 0 && (
                <AmountDisplay 
                  amount={totalExpense} 
                  className="text-white/90 text-lg font-['Ubuntu-Medium'] mt-1" 
                />
              )}
            </View>
          </View>
        </LinearGradient>

        <View className="mt-4">
          <View className="flex-row">
            <View className="w-24 bg-purple-100 rounded-xl p-3 items-center">
              {userBalance ? (
                <>
                  {userBalance.avatarUrl ? (
                    <Image 
                      source={{ uri: userBalance.avatarUrl }} 
                      className="w-12 h-12 rounded-full mb-2"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-purple-200 mb-2" />
                  )}
                  <AmountDisplay 
                    amount={userBalance.amount} 
                    className="text-purple-700 font-['Ubuntu-Bold']" 
                  />
                </>
              ) : (
                <View className="w-12 h-12 rounded-full bg-purple-200" />
              )}
            </View>

            <View className="flex-1 ml-4">
              <View className="flex-row flex-wrap gap-2">
                {balances.length > 0 ? (
                  balances.map((balance, index) => (
                    <View 
                      key={index} 
                      className="basis-[calc(50%-0.5rem)] p-3 border border-purple-100 rounded-xl bg-white"
                    >
                      <View className="flex-row items-center">
                        {balance.avatarUrl ? (
                          <Image 
                            source={{ uri: balance.avatarUrl }} 
                            className="w-8 h-8 rounded-full mr-2"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-8 h-8 rounded-full bg-purple-100 mr-2" />
                        )}
                        <AmountDisplay 
                          amount={balance.amount} 
                          className="flex-1 text-purple-700 font-['Ubuntu-Medium']" 
                        />
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="flex-1 p-6 border border-purple-100 rounded-xl bg-white/50">
                    <Text className="text-center text-purple-500 font-['Ubuntu-Medium']">
                      No balances yet
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  )
}