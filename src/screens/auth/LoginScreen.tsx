import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView, 
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import api from '../../config/api'; 
import CustomAlert from '../../components/CustomAlert';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    onConfirm: () => {},
  });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAlertConfig({
        visible: true, title: 'Validasi Gagal', message: 'Alamat Email dan Kata Sandi tidak boleh kosong.', type: 'warning', onConfirm: closeAlert,
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.status === 'success') {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
        setAlertConfig({
          visible: true, title: 'Login Berhasil!', message: 'Selamat datang kembali di Nourish.', type: 'success',
          onConfirm: () => { closeAlert(); navigation.replace('Home'); },
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan jaringan saat mencoba masuk.';
      setAlertConfig({ visible: true, title: 'Login Gagal', message: errorMessage, type: 'error', onConfirm: closeAlert });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* ⚡ JURUS PAMUNGKAS: Behavior 'undefined' untuk Android agar tidak konflik dengan sistem bawaan */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView 
          /* ⚡ JURUS PAMUNGKAS: paddingBottom 150 memastikan ruang ekstra agar tombol tidak tertelan keyboard */
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 150, justifyContent: 'center' }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" 
          bounces={false}
        >
          <View className="px-8 py-10">
            
            <View className="mb-12">
              <Text className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Selamat Datang.</Text>
              <Text className="text-base text-gray-500 leading-relaxed">
                Silakan masuk dengan akun Nourish Anda untuk melihat jadwal distribusi hari ini.
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Alamat Email</Text>
                <TextInput
                  className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-base text-gray-900 shadow-sm"
                  placeholder="Masukkan alamat email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>

              <View className="mt-4">
                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Kata Sandi</Text>
                <View className="relative justify-center">
                  <TextInput
                    className="bg-white border border-gray-100 rounded-2xl pl-5 pr-12 py-4 text-base text-gray-900 shadow-sm"
                    placeholder="Masukkan kata sandi"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    className="absolute right-4 p-1"
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity className="mt-4 flex-row justify-end" onPress={() => navigation.navigate('ForgotPassword')} disabled={isLoading}>
                <Text className="text-primary font-medium text-sm">Lupa Kata Sandi?</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-10">
              <TouchableOpacity onPress={handleLogin} disabled={isLoading} className={`${isLoading ? 'bg-sky-400' : 'bg-primary active:bg-sky-700'} rounded-2xl py-4 shadow-sm items-center justify-center`}>
                {isLoading ? <ActivityIndicator color="#ffffff" size="small" /> : <Text className="text-white font-bold text-lg">Masuk</Text>}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-8">
                <Text className="text-gray-500 text-base">Belum punya akun? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
                  <Text className="text-primary font-bold text-base">Daftar</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={closeAlert} onConfirm={alertConfig.onConfirm} />
    </SafeAreaView>
  );
}