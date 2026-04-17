import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Modal,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 

// Import konfigurasi API yang sudah terhubung dengan file .env
import api from '../../config/api'; 
// Import Komponen Custom Alert
import CustomAlert from '../../components/CustomAlert';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Komponen pendaftaran pengguna baru.
 * Menangani data identitas, kategori pengguna, validasi keamanan, dan integrasi API.
 */
export default function RegisterScreen({ navigation }: any) {
  // Manajemen State Input Identitas
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [kategori, setKategori] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [alamat, setAlamat] = useState('');

  // Manajemen State Email dan Validasi Cerdas
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // State untuk proses loading API
  const [isLoading, setIsLoading] = useState(false);

  // State Manajemen untuk Custom Alert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    onConfirm: () => {},
  });

  // Fungsi utilitas untuk menutup Custom Alert
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  /**
   * Menangani perubahan email dengan deteksi kesalahan pengetikan umum.
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
    const commonTypos = ['gamail.com', 'gmil.com', 'gmai.com', 'yaho.com', 'yahho.com'];
    
    if (commonTypos.includes(domain)) {
      setEmailError(`Sepertinya typo. Apakah maksud Anda @${domain.startsWith('y') ? 'yahoo' : 'gmail'}.com?`);
      return;
    }

    setEmailError('');
  };

  // Konfigurasi Animasi Picker Tanggal Lahir
  const [visible, setVisible] = useState(false); 
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current; 
  const opacity = useRef(new Animated.Value(0)).current; 
  const [isAnimationFinished, setIsAnimationFinished] = useState(false); 

  const [selectedDay, setSelectedDay] = useState('1');
  const [selectedMonth, setSelectedMonth] = useState('Januari');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [tanggalLahirLabel, setTanggalLahirLabel] = useState('');

  const days = useRef(Array.from({length: 31}, (_, i) => (i + 1).toString())).current;
  const months = useRef(['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']).current;
  const years = useRef(Array.from({length: 100}, (_, i) => (currentYear - i).toString())).current;

  const kategoriOptions = [
    { label: 'Siswa', value: 'siswa', icon: 'school-outline' },
    { label: 'Ibu Hamil', value: 'ibu_hamil', icon: 'woman-outline' },
    { label: 'Ibu Balita', value: 'ibu_balita', icon: 'happy-outline' },
  ];

  /**
   * Mengontrol alur animasi kemunculan Picker dari bawah layar.
   */
  const togglePicker = (show: boolean) => {
    if (show) {
      setVisible(true); 
      setIsAnimationFinished(false); 
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1), useNativeDriver: true })
      ]).start(() => setIsAnimationFinished(true));
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1), useNativeDriver: true })
      ]).start(() => setVisible(false));
    }
  };

  const handleSaveDate = () => {
    setTanggalLahirLabel(`${selectedDay} ${selectedMonth} ${selectedYear}`);
    togglePicker(false); 
  };

  // Validasi Logika Tombol Submit
  const isPasswordMatch = password === confirmPassword && password.length >= 8;
  const isFormValid = isPasswordMatch && email.length > 0 && emailError === '' && kategori !== '' && tanggalLahirLabel !== '';

  /**
   * Fungsi untuk mengirim data pendaftaran ke API Laravel melalui Axios (api.ts)
   */
  const handleRegister = async () => {
    setIsLoading(true); 
    
    try {
      const payload = {
        name: name,
        email: email,
        password: password,
        kategori: kategori,
        tempat_lahir: tempatLahir,
        tanggal_lahir: tanggalLahirLabel,
        alamat: alamat,
        phone: phone,
      };

      // Tembak API POST ke /register secara bersih lewat Axios
      const response = await api.post('/register', payload);

      if (response.data.status === 'success') {
        // Tampilkan Custom Alert Sukses
        setAlertConfig({
          visible: true,
          title: 'Pendaftaran Berhasil!',
          message: 'Akun Anda telah sukses dibuat! Silakan masuk untuk melanjutkan.',
          type: 'success',
          onConfirm: () => {
            closeAlert();
            navigation.navigate('Login');
          },
        });
      }

    } catch (error: any) {
      // Tangkap dan bongkar error jaringan jika terjadi
      console.log('=== ERROR JARINGAN ASLI ===');
      console.log(error.toJSON ? error.toJSON() : error);
      
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan jaringan. Pastikan IP Laptop dan WiFi sudah benar.';
      
      // Tampilkan Custom Alert Gagal
      setAlertConfig({
        visible: true,
        title: 'Pendaftaran Gagal',
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-8 py-10">
            
            {/* Navigasi dan Judul Layar */}
            <View className="mb-8">
              <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </TouchableOpacity>
              <Text className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Daftar Akun.</Text>
              <Text className="text-base text-gray-500 leading-relaxed">Lengkapi data diri Anda di bawah ini dengan benar.</Text>
            </View>

            <View className="space-y-6">
              
              {/* Seleksi Kategori Pengguna */}
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-3 ml-1">Pilih Kategori</Text>
                <View className="flex-row justify-between">
                  {kategoriOptions.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => setKategori(item.value)}
                      className={`flex-1 mx-1 p-3 rounded-2xl items-center border ${kategori === item.value ? 'bg-primary border-primary' : 'bg-white border-gray-100'} shadow-sm`}
                    >
                      <Ionicons name={item.icon as any} size={20} color={kategori === item.value ? '#FFFFFF' : '#9CA3AF'} />
                      <Text className={`text-[10px] mt-1 font-bold ${kategori === item.value ? 'text-white' : 'text-gray-500'}`}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Input Informasi Personal */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Nama Lengkap</Text>
                <TextInput className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-base text-gray-900 shadow-sm" placeholder="Sesuai identitas resmi" value={name} onChangeText={setName} />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Tempat Lahir</Text>
                <TextInput className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-base text-gray-900 shadow-sm" placeholder="Nama Kota / Kabupaten" value={tempatLahir} onChangeText={setTempatLahir} />
              </View>
              
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Tanggal Lahir</Text>
                <TouchableOpacity onPress={() => togglePicker(true)} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm flex-row items-center justify-between">
                  <Text className={tanggalLahirLabel ? "text-gray-900 text-base" : "text-gray-400 text-base"} numberOfLines={1}>
                    {tanggalLahirLabel || 'Pilih tanggal lahir Anda'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Alamat Domisili Lengkap</Text>
                <TextInput className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-base text-gray-900 shadow-sm h-24" placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Kelurahan" multiline textAlignVertical="top" value={alamat} onChangeText={setAlamat} />
              </View>

              {/* Input Kontak dan Keamanan */}
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

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Nomor WhatsApp</Text>
                <TextInput className="bg-white border border-gray-100 rounded-2xl px-5 py-4 text-base text-gray-900 shadow-sm" placeholder="Contoh: 08123456789" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Kata Sandi</Text>
                <View className="relative justify-center">
                  <TextInput className="bg-white border border-gray-100 rounded-2xl pl-5 pr-12 py-4 text-base text-gray-900 shadow-sm" placeholder="Minimal 8 karakter" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                  <TouchableOpacity className="absolute right-4 p-1" onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">Konfirmasi Kata Sandi</Text>
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

            {/* Aksi Final Pendaftaran */}
            <View className="mt-10 mb-10">
              <TouchableOpacity 
                disabled={!isFormValid || isLoading} 
                onPress={handleRegister} 
                className={`${isFormValid && !isLoading ? 'bg-primary' : 'bg-gray-300'} rounded-2xl py-4 shadow-sm items-center justify-center`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-lg">Buat Akun Sekarang</Text>
                )}
              </TouchableOpacity>
              
              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-500 text-base">Sudah punya akun? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text className="text-primary font-bold text-base">Masuk</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Bottom Sheet: Custom Date Picker */}
      <Modal visible={visible} transparent animationType="none">
        <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
          <Animated.View style={{ opacity }} className="flex-1 bg-black/50">
            <TouchableOpacity className="flex-1" activeOpacity={1} onPress={() => togglePicker(false)} />
          </Animated.View>
          
          <Animated.View style={{ transform: [{ translateY }] }} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pt-6 pb-12 px-6 shadow-2xl h-[410px]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900 flex-1 text-center ml-10">Pilih Tanggal Lahir</Text>
              <TouchableOpacity onPress={handleSaveDate}>
                <Text className="text-primary font-bold text-lg">Simpan</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between flex-1 border-t border-b border-gray-100 py-2">
              {!isAnimationFinished ? (
                <View className="flex-1 items-center justify-center"><Text className="text-gray-400">Memuat...</Text></View>
              ) : (
                <>
                  <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    {days.map((day) => (
                      <TouchableOpacity key={day} onPress={() => setSelectedDay(day)} className={`py-3.5 items-center rounded-xl mx-0.5 my-0.5 ${selectedDay === day ? 'bg-primary' : ''}`}>
                        <Text className={`text-lg font-medium ${selectedDay === day ? 'text-white' : 'text-gray-700'}`}>{day}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-1.5">
                    {months.map((month) => (
                      <TouchableOpacity key={month} onPress={() => setSelectedMonth(month)} className={`py-3.5 items-center rounded-xl mx-0.5 my-0.5 ${selectedMonth === month ? 'bg-primary' : ''}`}>
                        <Text className={`text-[15px] font-medium ${selectedMonth === month ? 'text-white' : 'text-gray-700'}`}>{month}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    {years.map((year) => (
                      <TouchableOpacity key={year} onPress={() => setSelectedYear(year)} className={`py-3.5 items-center rounded-xl mx-0.5 my-0.5 ${selectedYear === year ? 'bg-primary' : ''}`}>
                        <Text className={`text-lg font-medium ${selectedYear === year ? 'text-white' : 'text-gray-700'}`}>{year}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          </Animated.View>
        </SafeAreaView>
      </Modal>

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