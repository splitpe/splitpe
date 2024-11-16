import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View,Text,Image, Pressable, ActivityIndicator } from "react-native";
import { useAuth } from "~/contexts/AuthProvider";
import AmountDisplay from "~/helper/FormattedText";
import { generateSignedUrl } from "~/helper/functions";
import { supabase } from "~/utils/supabase";
import { useFonts } from "expo-font"



export default function GroupItem({group}) {

  const [balances, setBalances] = useState([]);
  const [userbalance, setUserBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();
  const [totalExpense, setTotalExpense] = useState(0);
  const groupId = group.id




  const [fontsLoaded] = useFonts({
    'Ubuntu-Regular': require('~/assets/fonts/Ubuntu-Regular.ttf'),
    'Ubuntu-Medium': require('~/assets/fonts/Ubuntu-Medium.ttf'),
    'Ubuntu-Bold': require('~/assets/fonts/Ubuntu-Bold.ttf'),
  })
    
  useEffect(() => {
const fetchTotalExpense = async () =>
{
      setLoading(true);
      const { data, error } = await supabase
      .from('expenses')
      .select('amount', { count: 'exact'})
      .eq('group_id', groupId);
      if (error) {
        console.error('Error fetching total expense:', error);
        setTotalExpense(0);
            } 
      else
      {
        const total = data.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
        setTotalExpense(total);
      }
      setLoading(false);
    };
    fetchTotalExpense();
  }, [groupId]);


  const fetchBalances = async () => {
    try {
      // Fetch all balances where the current user is involved
      const { data: allBalances, error: balancesError } = await supabase
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

      if (balancesError) throw balancesError;


      const balancesByUser = allBalances.reduce((acc, balance) => {
        const userId = balance.user_id;
        const existingBalance = acc[userId];
      
        if (existingBalance) {
          existingBalance.amount += balance.amount;
        } else {
          acc[userId] = {
            user_id: userId,
            name: balance.users.full_name,
            avatarUrl: balance.users.avatar_url,
            amount: balance.amount,
          };
        }
      
        return acc;
      }, {});
      
      const formattedBalances = Object.values(balancesByUser);
      


      console.log("formatted Balances", formattedBalances)


      const updatedFormattedBalances = await Promise.all(formattedBalances.map(async (balance) => {


        const avatarUrl = balance.avatarUrl;
        if (!avatarUrl) {
          return balance;
        }
        else{
         
        const signedUrl = await generateSignedUrl("avatars",avatarUrl,3600);
        return {
          ...balance,
          avatarUrl: signedUrl,
        };
      }
      }));  

      const userbalance = updatedFormattedBalances.filter((bal)=>bal.user_id===user.id)[0];
      const updatedFormattedBalancesWithoutUser = updatedFormattedBalances.filter((bal)=>bal.user_id!==user.id);
      console.log("User Balance",userbalance)
      console.log("updatedFormattedBalancesWithoutUser Balance",updatedFormattedBalancesWithoutUser)
      setUserBalance(userbalance);
      setBalances(updatedFormattedBalancesWithoutUser);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" className="flex-1" color="#A855F7" />
  }
  


return (
  <Pressable onPress={() => {router.navigate("/(group)/"+group.id)}}>
    <View className="bg-white min-h-56 rounded-xl p-4 mb-4 shadow-md">
    <View className="flex-row items-center mb-2">
    
      <View className="w-20 h-20 rounded-full bg-primary items-center justify-center relative z-10" >
       {group.profile_picture_url?(
        <View className="w-16 h-16 items-center justify-center rounded-full bg-primary-light relative z-10" >
       <Image 
       source={{ uri: group.profile_picture_url }}
         //src={{ uri: item.avatar_url.publicUrl }} 
         className="w-14 h-14 rounded-full"
       />
       </View>)
      :<View className="w-16 h-16 rounded-full bg-primary-light relative z-10" />}
        </View>
    <View className="flex-1 bg-primary pl-2 pr-1  rounded-tr-xl rounded-br-xl items-center relative -left-2 z-0">
      <View className="flex-row p-2 gap-2 items-center justify-between">
      <View className="w-8/12 h-8 bg-primary-light rounded-full items-center justify-center" ><Text className="text-primary font-['Ubuntu-Bold']  text-center align-middle font-semibold">{group.name}</Text></View>
      <View className="w-4/12 h-8 bg-primary-light rounded-full items-center justify-center" >{totalExpense?(<AmountDisplay amount={totalExpense} className="text-primary font-['Ubuntu-Bold'] text-center align-middle justify-center" />):<Text></Text>}</View>

      </View>
      </View>
    </View>
 
    <View className="flex-1 mt-1">
<View className="flex-row justify-center">
<View className="h-24 w-16 h-full bg-primary justify-center gap-3 items-center rounded-br-lg rounded-bl-lg rounded-tr-lg">
  { async function name(params:type) {
    userbalance
  }.length > 0 ? 
  (  <>
  {userbalance?.avatarUrl? 
  (<Image source={{ uri: userbalance?.avatarUrl }} className="w-10 h-10 rounded-full"></Image>
  )
  :(<View className="w-10 h-10 rounded-full bg-gray-200" />
    )}
  {userbalance?.amount && (<AmountDisplay amount={userbalance?.amount} className="text-white text-xs font-semibold" />)}
  
  </>)
  : (<View className="w-10 h-10 rounded-full bg-gray-200" />)}

  
</View>

<View className="flex-1 ml-2">
              <View className="flex-row flex-wrap gap-2">
                {balances.length > 0 ?
                (
                  
                  balances.map((balance, index) => (
                    <View key={index} className="w-[30%] flex-grow-0 flex-shrink-0 p-2 border border-gray-200 bg-white rounded-full">
                      <View className="flex-row items-center">
                        {balance?.avatarUrl ? (
                          <Image source={{ uri: balance?.avatarUrl }} className="w-6 h-6 rounded-full" />
                        ) : (
                          <View className="w-6 h-6 rounded-full bg-gray-200" />
                        )}
                        <View className="flex-1 h-6  rounded-full items-center justify-center">
                          <AmountDisplay amount={balance?.amount} className="" />
                        </View>
                      </View>
                    </View>
                  )

                  

                
                
                
                )
                  
                  
                ):(
                  <View className="flex-1 min-h-24 border items-center justify-center border-gray-200 bg-white rounded-xl">
                    
                    <Text className="text-center font-['Ubuntu-Bold']">
                      No balances
                    </Text>
                                      </View>
                )
                }
                


                
              </View>
            </View>

</View>
</View>


  </View>
  </Pressable>)
}