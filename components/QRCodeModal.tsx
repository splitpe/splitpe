import React from 'react';
import { Modal, View, Text, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';  // For generating QR code
import { BlurView } from 'expo-blur';          // For background blur effect
import { Ionicons } from '@expo/vector-icons'; // For close button icon
import { Colors } from '~/types/colors';
import { logoFromBase64 } from '~/helper/logo';

const { width } = Dimensions.get('window');

const QRCodeModal = ({ visible, onClose, qrValue }) => {
    

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Background Blur */}
      <BlurView intensity={99}>
<View className="h-full w-full items-center justify-center">
        <View className="flex-row">  

          {/* QR Code Container */}
          <View className="bg-white p-5 shadow-lg rounded-lg items-center">
            <Text className="text-lg mb-4">Scan this QR Code</Text>
            <QRCode
              value={qrValue || 'https://your-app-link.com'} // Default QR code value if not passed
              size={width * 0.8}
              logo={logoFromBase64}
            />
            <TouchableOpacity className="" onPress={onClose}>
            <View className='flex-row items-center p-2 m-6 bg-primary-light rounded-full justify-center'>

                    <Text className='text-align-center px-4 font-bold text-primary-dark'>Close</Text>
            <Ionicons name="close" size={30} color={Colors.primary.dark} />
            </View>
          </TouchableOpacity>
          
          </View>
           {/* Close Button */}

        </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default QRCodeModal;
