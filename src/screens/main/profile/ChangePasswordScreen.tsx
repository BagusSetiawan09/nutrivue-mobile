import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../config/api';
import CustomAlert from '../../../components/CustomAlert';

export default function ChangePasswordScreen({ navigation }: any) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
  });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const isFormValid = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleChangePassword = async () => {
    setIsLoading(true);
    try {
      const payload = {
        current_password: currentPassword,
        new_password: newPassword
      };
      
      const response = await api.post('/change-password', payload);
      
      if (response.data.status === 'success') {
        setAlertConfig({
          visible: true,
          title: 'Pembaruan Berhasil',
          message: 'Kata sandi Anda telah berhasil diperbarui.',
          type: 'success'
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan jaringan';
      setAlertConfig({
        visible: true,
        title: 'Pembaruan Gagal',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-row items-center mb-4 mt-4 px-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Ubah Kata Sandi</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Perbarui kredensial akses akun Anda</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-2" contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Kata Sandi Saat Ini</Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-gray-50 border border-gray-100 rounded-2xl pl-5 pr-12 py-4 text-base text-gray-900"
                  placeholder="Masukkan sandi lama"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity className="absolute right-4 p-1" onPress={() => setShowCurrent(!showCurrent)}>
                  <Ionicons name={showCurrent ? "eye" : "eye-off"} size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Kata Sandi Baru</Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-gray-50 border border-gray-100 rounded-2xl pl-5 pr-12 py-4 text-base text-gray-900"
                  placeholder="Minimal delapan karakter"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity className="absolute right-4 p-1" onPress={() => setShowNew(!showNew)}>
                  <Ionicons name={showNew ? "eye" : "eye-off"} size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Konfirmasi Sandi Baru</Text>
              <View className="relative justify-center">
                <TextInput
                  className={`bg-gray-50 border ${isPasswordMismatch ? 'border-red-500' : 'border-gray-100'} rounded-2xl pl-5 pr-12 py-4 text-base text-gray-900`}
                  placeholder="Ulangi sandi baru"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity className="absolute right-4 p-1" onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons name={showConfirm ? "eye" : "eye-off"} size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {isPasswordMismatch && <Text className="text-red-500 text-xs mt-2 ml-2 font-medium">Sandi baru tidak cocok</Text>}
            </View>
          </View>

          <TouchableOpacity 
            disabled={!isFormValid || isLoading} 
            onPress={handleChangePassword} 
            className={`rounded-2xl py-4 shadow-sm items-center justify-center ${isFormValid && !isLoading ? 'bg-sky-500' : 'bg-gray-300'}`}
          >
            {isLoading ? <ActivityIndicator color="#ffffff" size="small" /> : <Text className="text-white font-bold text-lg">Simpan Kata Sandi</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={closeAlert} onConfirm={closeAlert} />
    </SafeAreaView>
  );
}