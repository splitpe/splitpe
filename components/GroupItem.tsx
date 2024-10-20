import { router } from "expo-router";
import { View,Text,Image, Pressable } from "react-native";



export default function GroupItem({group}) {

return (
  <Pressable onPress={() => {router.navigate("/(group)/"+group.id)}}>
    <View className="bg-white rounded-xl p-4 mb-4 shadow-md">
    <View className="flex-row items-center mb-2 bg-white">
    
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
      <View className="w-8/12 h-8 bg-primary-light rounded-full items-center justify-center" ><Text className="text-primary-dark  text-center align-middle">{group.name}</Text></View>
      <View className="w-4/12 h-8 bg-primary-light rounded-full" />

      </View>
      </View>
    </View>
    <View className="flex-1">
<View className="flex-row items-center">
<View className="flex w-16 h-full bg-primary justify-center gap-3 items-center rounded-br-lg rounded-bl-lg rounded-tr-lg">
  <View className="w-10 h-10 rounded-full bg-gray-200" />
  <Text className="text-white text-center">50</Text>
</View>


    <View className="flex-1 ml-4">
    {[1, 2, 3].map((_, index) => (
      <View key={index} className="flex-row items-center gap-3 mt-2">
        <View className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
        <View className="flex-1 h-4 bg-gray-100 rounded-full" />
        <View className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
        <View className="flex-1 h-4 bg-gray-100 rounded-full" />
        <View className="w-6 h-6 rounded-full bg-gray-200 mr-2" />
        <View className="flex-1 h-4 bg-gray-100 rounded-full" />
      </View>
    ))}
</View>

</View>
</View>
  </View>
  </Pressable>)
}