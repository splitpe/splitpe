import { Text } from 'react-native';

export default function AmountDisplay({ amount,className }) {
    const formatAmount = (amount) => {
        if (amount >= 1000000000) {
          return (amount / 1000000000).toFixed(2) + 'B';
        } else if (amount >= 1000000) {
          return (amount / 1000000).toFixed(2) + 'M';
        } else if (amount >= 1000) {
          return (amount / 1000).toFixed(2) + 'K';
        } else {
          return amount.toFixed(2);
        }
      };
  
  
  const formattedAmount = formatAmount(amount);
  if (className) {
    return <Text className={className}>{formattedAmount}</Text>;
  }

  const colorClass = amount < 0 ? 'text-red-500 text-xs' : 'text-green-500 text-xs';

  return (
    <Text className={`${colorClass} font-bold`}>{formattedAmount}</Text>
  );
};

