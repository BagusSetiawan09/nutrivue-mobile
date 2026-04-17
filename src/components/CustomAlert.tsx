import React from 'react';
import { Modal, View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
}

export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  type, 
  onClose, 
  onConfirm,
  confirmText = 'OK' 
}: CustomAlertProps) {
  
  // Menentukan warna dan ikon berdasarkan tipe Alert
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#10B981', bgColor: 'bg-emerald-100' };
      case 'error':
        return { icon: 'close-circle', color: '#EF4444', bgColor: 'bg-red-100' };
      case 'warning':
        return { icon: 'warning', color: '#F59E0B', bgColor: 'bg-amber-100' };
      default:
        return { icon: 'information-circle', color: '#3B82F6', bgColor: 'bg-blue-100' };
    }
  };

  const config = getAlertConfig();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        
        {/* Kotak Alert */}
        <View className="bg-white rounded-3xl w-full max-w-sm p-6 items-center shadow-2xl">
          
          {/* Lingkaran Ikon */}
          <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${config.bgColor}`}>
            <Ionicons name={config.icon as any} size={36} color={config.color} />
          </View>

          {/* Teks Judul & Pesan */}
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
            {message}
          </Text>

          {/* Tombol Aksi */}
          <View className="w-full flex-row justify-center space-x-3">
            <TouchableOpacity 
              onPress={() => {
                onClose();
                if (onConfirm) onConfirm();
              }}
              style={{ backgroundColor: config.color }}
              className="flex-1 py-3.5 rounded-2xl items-center shadow-sm"
            >
              <Text className="text-white font-bold text-base">{confirmText}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}