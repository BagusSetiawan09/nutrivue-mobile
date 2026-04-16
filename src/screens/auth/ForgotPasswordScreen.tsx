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
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 

/**
 * Komponen pemulihan kata sandi pengguna.
 * Menggunakan alur Multi-Step Wizard dalam satu tampilan (Email > OTP > Sandi Baru).
 */
export default function ForgotPasswordScreen({ navigation }: any) {
  // Manajemen alur tampilan: 1 = Email, 2 = OTP, 3 = Sandi Baru
  const [step, setStep] = useState(1);

  // State Identitas dan Validasi
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // State Verifikasi Keamanan
  const [otp, setOtp] = useState('');

  // State Kredensial Baru
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Menangani validasi email dan deteksi kesalahan pengetikan domain.
   */
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.trim() === '') {
      setEmailError('');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('Format email belum lengkap');
      return;
    }
    const domain = text.split('@')[1]?.toLowerCase();
    const commonTypos = ['gamail.com', 'gmil.com', 'gmai.com', 'yaho.com'];
    if (commonTypos.includes(domain)) {
      setEmailError(`Sepertinya typo. Apakah maksud Anda @${domain.startsWith('y') ? 'yahoo' : 'gmail'}.com?`);
      return;
    }
    setEmailError('');
  };

  // Logika validasi tombol berdasarkan kriteria keamanan
  const isEmailValid = email.length > 0 && emailError === '';
  const isPasswordMatch = password === confirmPassword && password.length >= 8;

  /**
   * Bagian 1: Permintaan pengiriman kode pemulihan melalui email.
   */
  const renderStep1 = () => (
    <View className="flex-1 mt-6">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Lupa Sandi.</Text>
        <Text className="text-base text-gray-500 leading-relaxed">
          Jangan khawatir! Masukkan email yang terdaftar, kami akan mengirimkan kode pemulihan.
        </Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Alamat Email</Text>
          <TextInput 
            className={`bg-white border ${emailError ? 'border-red-500' : 'border-gray-100'} rounded-2xl px-5 py-4 text-base text-gray-900 shadow-sm`} 
            placeholder="contoh@email.com" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            value={email} 
            onChangeText={handleEmailChange} 
          />
          {emailError ? <Text className="text-red-500 text-xs mt-2 ml-2 font-medium">{emailError}</Text> : null}
        </View>
      </View>

      <View className="mt-10">
        <TouchableOpacity 
          disabled={!isEmailValid}
          onPress={() => setStep(2)}
          className={`${isEmailValid ? 'bg-primary' : 'bg-gray-300'} rounded-2xl py-4 shadow-sm items-center justify-center`}
        >
          <Text className="text-white font-bold text-lg">Kirim Kode OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Bagian 2: Verifikasi kepemilikan akun melalui kode 4 digit.
   */
  const renderStep2 = () => (
    <View className="flex-1 mt-6">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Cek Email.</Text>
        <Text className="text-base text-gray-500 leading-relaxed">
          Kami telah mengirimkan 4 digit kode ke <Text className="font-bold text-gray-800">{email}</Text>.
        </Text>
      </View>

      <View className="items-center mt-4">
        <TextInput 
          className="bg-white border border-gray-200 rounded-3xl w-full py-6 text-center text-4xl font-bold text-gray-900 tracking-[15px] shadow-sm"
          placeholder="0000"
          placeholderTextColor="#D1D5DB"
          keyboardType="numeric"
          maxLength={4}
          value={otp}
          onChangeText={setOtp}
        />
        <TouchableOpacity className="mt-6">
          <Text className="text-primary font-medium text-base">Kirim Ulang Kode (00:30)</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-10">
        <TouchableOpacity 
          disabled={otp.length < 4}
          onPress={() => setStep(3)}
          className={`${otp.length === 4 ? 'bg-primary' : 'bg-gray-300'} rounded-2xl py-4 shadow-sm items-center justify-center`}
        >
          <Text className="text-white font-bold text-lg">Verifikasi Kode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Bagian 3: Pembaruan kredensial dengan kata sandi baru.
   */
  const renderStep3 = () => (
    <View className="flex-1 mt-6">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Sandi Baru.</Text>
        <Text className="text-base text-gray-500 leading-relaxed">
          Sandi Anda telah diverifikasi. Silakan buat kata sandi baru yang kuat.
        </Text>
      </View>

      <View className="space-y-5">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Kata Sandi Baru</Text>
          <View className="relative justify-center">
            <TextInput className="bg-white border border-gray-100 rounded-2xl pl-5 pr-12 py-4 text-base text-gray-900 shadow-sm" placeholder="Minimal 8 karakter" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
            <TouchableOpacity className="absolute right-4 p-1" onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Konfirmasi Sandi Baru</Text>
          <View className="relative justify-center">
            <TextInput className={`bg-white border ${confirmPassword.length > 0 && !isPasswordMatch ? 'border-red-500' : 'border-gray-100'} rounded-2xl pl-5 pr-12 py-4 text-base text-gray-900 shadow-sm`} placeholder="Ulangi kata sandi" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
            <TouchableOpacity className="absolute right-4 p-1" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && !isPasswordMatch && (
            <Text className="text-red-500 text-xs mt-2 ml-2 font-medium">Sandi tidak cocok atau kurang dari 8 karakter!</Text>
          )}
        </View>
      </View>

      <View className="mt-10">
        <TouchableOpacity 
          disabled={!isPasswordMatch}
          onPress={() => navigation.navigate('Login')}
          className={`${isPasswordMatch ? 'bg-primary' : 'bg-gray-300'} rounded-2xl py-4 shadow-sm items-center justify-center`}
        >
          <Text className="text-white font-bold text-lg">Simpan & Masuk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="flex-1 px-8 py-10">
              
              {/* Navigasi kembali dinamis berdasarkan langkah saat ini */}
              <TouchableOpacity 
                onPress={() => {
                  if (step === 1) navigation.goBack();
                  if (step === 2) setStep(1);
                  if (step === 3) setStep(2);
                }} 
                className="mb-4"
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </TouchableOpacity>

              {/* Tampilan Konten Dinamis */}
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}