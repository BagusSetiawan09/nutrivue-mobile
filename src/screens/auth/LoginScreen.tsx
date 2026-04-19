import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Brankas penyimpanan lokal

// Import API dan Komponen
import api from '../../config/api'; 
import CustomAlert from '../../components/CustomAlert';

/**
 * Komponen utama untuk autentikasi masuk pengguna.
 * Menggunakan arsitektur fungsional dengan hooks untuk manajemen state.
 */
export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State Manajemen untuk Custom Alert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    onConfirm: () => {},
  });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  /**
   * Fungsi inti untuk memproses Login ke Backend
   */
  const handleLogin = async () => {
    // 1. Validasi Input Kosong
    if (!email.trim() || !password.trim()) {
      setAlertConfig({
        visible: true,
        title: 'Validasi Gagal',
        message: 'Alamat Email dan Kata Sandi tidak boleh kosong.',
        type: 'warning',
        onConfirm: closeAlert,
      });
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss(); // Tutup keyboard saat loading

    try {
      // 2. Kirim data ke API Laravel
      const response = await api.post('/login', {
        email: email,
        password: password
      });

      // 3. Jika Laravel bilang sukses
      if (response.data.status === 'success') {
        await AsyncStorage.setItem('userToken', response.data.token);
        
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data));

        // Tampilkan Alert Sukses
        setAlertConfig({
          visible: true,
          title: 'Login Berhasil!',
          message: 'Selamat datang kembali di Nourish.',
          type: 'success',
          onConfirm: () => {
            closeAlert();
            navigation.replace('Home'); 
          },
        });
      }

    } catch (error: any) {
      // 4. Tangkap Error (Password salah, email tidak ada, dll)
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan jaringan saat mencoba masuk.';
      
      setAlertConfig({
        visible: true,
        title: 'Login Gagal',
        message: errorMessage,
        type: 'error',
        onConfirm: closeAlert,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* Menangani penutupan keyboard saat area luar input ditekan */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-center px-8"
        >
          
          {/* Bagian Identitas Visual */}
          <View className="mb-12">
            <Text className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Selamat Datang.
            </Text>
            <Text className="text-base text-gray-500 leading-relaxed">
              Silakan masuk dengan akun Nourish Anda untuk melihat jadwal distribusi hari ini.
            </Text>
          </View>

          {/* Bagian Input Kredensial */}
          <View className="space-y-4">
            
            {/* Input Identitas Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">
                Alamat Email
              </Text>
              <TextInput
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-base text-gray-900 shadow-sm"
                placeholder="contoh@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />
            </View>

            {/* Input Kata Sandi dengan proteksi visibilitas */}
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">
                Kata Sandi
              </Text>
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
                
                {/* Toggle visibilitas untuk kenyamanan pengguna */}
                <TouchableOpacity 
                  className="absolute right-4 p-1"
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Navigasi pemulihan akun */}
            <TouchableOpacity 
              className="mt-4 flex-row justify-end"
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={isLoading}
            >
              <Text className="text-primary font-medium text-sm">
                Lupa Kata Sandi?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bagian Aksi Utama dan Registrasi */}
          <View className="mt-10">
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={isLoading}
              className={`${isLoading ? 'bg-sky-400' : 'bg-primary active:bg-sky-700'} rounded-2xl py-4 shadow-sm items-center justify-center`}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Masuk
                </Text>
              )}
            </TouchableOpacity>

            {/* Redirect ke alur pendaftaran pengguna baru */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-500 text-base">
                Belum punya akun?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
                <Text className="text-primary font-bold text-base">
                  Daftar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Komponen Custom Alert - Ditempatkan di lapisan paling atas */}
      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
      />

    </SafeAreaView>
  );
}