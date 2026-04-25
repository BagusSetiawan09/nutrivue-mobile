import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Komponen layar pelindung aplikasi
 * Meminta pengguna memasukkan kode identitas rahasia sebelum mengakses sistem utama
 */
export default function PinUnlockScreen({ navigation }: any) {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPin = async () => {
      const storedPin = await AsyncStorage.getItem('appPin');
      if (storedPin) {
        setSavedPin(storedPin);
      }
    };
    fetchPin();
  }, []);

  const handlePinChange = (text: string) => {
    setPin(text);
    setError(false);
    
    if (text.length === 6) {
      if (text === savedPin) {
        navigation.replace('Home');
      } else {
        setError(true);
        setPin('');
      }
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center px-8">
      <View className="items-center mb-10">
        <View className="w-16 h-16 bg-amber-50 rounded-full items-center justify-center mb-6">
          <Ionicons name="lock-closed" size={32} color="#F59E0B" />
        </View>
        <Text className="text-3xl font-bold text-gray-900 mb-2">Aplikasi Terkunci</Text>
        <Text className="text-gray-500 text-center leading-relaxed">
          Masukkan enam digit kode keamanan Anda untuk melanjutkan
        </Text>
      </View>

      <View className="items-center">
        <TextInput
          className={`bg-white border ${error ? 'border-red-500' : 'border-gray-200'} rounded-2xl w-full py-5 text-center text-3xl font-bold text-gray-900 tracking-[15px] shadow-sm`}
          placeholder="••••••"
          placeholderTextColor="#D1D5DB"
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
          value={pin}
          onChangeText={handlePinChange}
          autoFocus
        />
        {error && <Text className="text-red-500 mt-4 font-medium">Kode keamanan tidak valid</Text>}
      </View>

      <TouchableOpacity onPress={handleLogout} className="mt-12 items-center active:opacity-70">
        <Text className="text-gray-400 font-medium mb-1">Lupa kode keamanan</Text>
        <Text className="text-red-500 font-bold text-base">Keluar dari Akun</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}