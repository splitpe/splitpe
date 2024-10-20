import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


// Sample currency data
export const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
    { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States' },
    { code: 'EUR', symbol: '€', name: 'Euro', country: 'Eurozone' },
    { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', country: 'Switzerland' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso', country: 'Mexico' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble', country: 'Russia' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey' },
    { code: 'ARS', symbol: '$', name: 'Argentine Peso', country: 'Argentina' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand' },
    { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates Dirham', country: 'United Arab Emirates' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone', country: 'Denmark' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', country: 'Poland' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', country: 'Indonesia' },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso', country: 'Philippines' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', country: 'Vietnam' },
    { code: 'EGP', symbol: '£', name: 'Egyptian Pound', country: 'Egypt' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong' },
    { code: 'CLP', symbol: '$', name: 'Chilean Peso', country: 'Chile' },
    { code: 'COP', symbol: '$', name: 'Colombian Peso', country: 'Colombia' },
  ];
  

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyPickerProps {
  selectedCurrency: Currency;
  onSelectCurrency: (currency: Currency) => void;
}

export default function CurrencyPicker({ selectedCurrency, onSelectCurrency }: CurrencyPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  
  const renderCurrencyItem = ({ item }: { item: Currency }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-200"
      onPress={() => {
        onSelectCurrency(item);
        setModalVisible(false);
      }}
      accessibilityLabel={`Select ${item.name}`}
    >
      <Text className="text-lg">
        {item.symbol} {item.code} - {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center justify-between mb-4"
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Open currency picker"
        accessibilityHint="Displays a list of currencies to choose from"
      >
       <Text className="mb-4">
      I use <Text className="text-primary">{selectedCurrency.code}</Text>  ({selectedCurrency.symbol}) as my currency. <Text className="text-primary">Change</Text>
    </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">Select Currency</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} accessibilityLabel="Close currency picker">
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={currencies}
            renderItem={renderCurrencyItem}
            keyExtractor={(item) => item.code}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}