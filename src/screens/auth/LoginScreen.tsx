import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 

/**
 * Komponen utama untuk autentikasi masuk pengguna.
 * Menggunakan arsitektur fungsional dengan hooks untuk manajemen state.
 */
export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
                />
                
                {/* Toggle visibilitas untuk kenyamanan pengguna */}
                <TouchableOpacity 
                  className="absolute right-4 p-1"
                  onPress={() => setShowPassword(!showPassword)}
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
            >
              <Text className="text-primary font-medium text-sm">
                Lupa Kata Sandi?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bagian Aksi Utama dan Registrasi */}
          <View className="mt-10">
            <TouchableOpacity 
              className="bg-primary rounded-2xl py-4 shadow-sm items-center justify-center active:bg-sky-700"
            >
              <Text className="text-white font-bold text-lg">
                Masuk
              </Text>
            </TouchableOpacity>

            {/* Redirect ke alur pendaftaran pengguna baru */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-500 text-base">
                Belum punya akun?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary font-bold text-base">
                  Daftar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}