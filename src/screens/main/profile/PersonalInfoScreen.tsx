import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import CustomAlert from '../../../components/CustomAlert';
import api from '../../../config/api';

const InputField = ({ label, value, onChangeText, icon, keyboardType = 'default', isLast = false, editable = true }: any) => (
  <View className={`py-3 ${!isLast ? 'border-b border-gray-50' : ''}`}>
    <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</Text>
    <View className={`flex-row items-center rounded-xl px-4 py-3 border ${editable ? 'bg-gray-50/50 border-gray-100' : 'bg-gray-100/50 border-gray-50'}`}>
      <Ionicons name={icon} size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={editable}
        className={`flex-1 text-sm font-medium ${editable ? 'text-gray-900' : 'text-gray-400'}`}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  </View>
);

export default function PersonalInfoScreen({ navigation }: any) {
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [instansi, setInstansi] = useState('');
  
  // 📸 STATE BARU UNTUK FOTO PROFIL
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null); // Menyimpan objek file untuk dikirim

  const [kodeVerify, setKodeVerify] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', message: '' });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || ''); 
        setAddress(user.alamat || ''); 
        setBirthDate(user.tempat_lahir || ''); 
        setInstansi(user.instansi || '');
        // Set foto profil awal jika ada
        setProfileImage(user.avatar || null);
      }
    } catch (error) {
      console.log('Gagal menarik data profil lokal', error);
    } finally {
      setIsScreenLoading(false);
    }
  };

  // 📸 FUNGSI MEMBUKA GALERI HP
  const pickImage = async () => {
    // Meminta izin akses galeri
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      setAlertConfig({ type: 'error', title: 'Izin Ditolak', message: 'Aplikasi membutuhkan akses ke galeri untuk mengubah foto profil.' });
      setAlertVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Izinkan pengguna melakukan crop
      aspect: [1, 1], // Wajib rasio kotak 1:1 untuk profil
      quality: 0.5, // Kompresi ukuran gambar (0-1) agar API tidak berat
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setProfileImage(selectedImage.uri); // Untuk tampilan preview di layar
      setImageFile(selectedImage); // Simpan objek untuk dikirim via FormData
    }
  };

  const handleVerifyInstitution = async () => {
    if (!kodeVerify) return;
    setIsVerifying(true);
    try {
      const response = await api.post('/profile/verify-institution', { kode_rahasia: kodeVerify });
      
      if (response.data.status === 'success') {
        const updatedUser = response.data.data;
        
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          let user = JSON.parse(userDataString);
          user.instansi = updatedUser.instansi;
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }

        setInstansi(updatedUser.instansi); 
        setKodeVerify('');
        
        setAlertConfig({
          type: 'success',
          title: 'Verifikasi Sukses',
          message: `Akun Anda sekarang resmi terhubung dengan ${updatedUser.instansi}.`
        });
        setAlertVisible(true);
      }
    } catch (error: any) {
      setAlertConfig({
        type: 'error',
        title: 'Verifikasi Gagal',
        message: error.response?.data?.message || 'Kode rahasia tidak valid.'
      });
      setAlertVisible(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!name || !email) {
      setAlertConfig({ type: 'error', title: 'Validasi Gagal', message: 'Nama dan Email tidak boleh kosong!' });
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      // 🚀 MENGUBAH PAYLOAD MENJADI FORMDATA KARENA ADA FILE GAMBAR
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('alamat', address);
      formData.append('tempat_lahir', birthDate);

      // Jika pengguna memilih gambar baru, masukkan ke form
      if (imageFile) {
        // Mendapatkan ekstensi file secara dinamis
        let uriParts = imageFile.uri.split('.');
        let fileType = uriParts[uriParts.length - 1];

        formData.append('avatar', {
          uri: imageFile.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }
      
      // Kirim via axios dengan header multipart
      const response = await api.post('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update data di penyimpanan lokal
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        let user = JSON.parse(userDataString);
        // Menggabungkan data lama dengan data baru (termasuk avatar URL dari server jika ada)
        user = { ...user, name, email, phone, alamat: address, tempat_lahir: birthDate };
        if (response.data.data?.avatar) {
             user.avatar = response.data.data.avatar;
        }
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      setAlertConfig({ 
        type: 'success', 
        title: 'Pembaruan Berhasil', 
        message: 'Informasi pribadi dan foto profil telah berhasil diperbarui.' 
      });
      setAlertVisible(true);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan profil.';
      setAlertConfig({ type: 'error', title: 'Gagal Menyimpan', message: errorMessage });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isScreenLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  // Tentukan gambar default atau gambar yang dipilih/ada di database
  const defaultImage = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=500&auto=format&fit=crop';
  // Jika profileImage berbentuk URL server (http/https) atau URI lokal (file://), tampilkan.
  const imageSource = profileImage 
    ? { uri: profileImage.startsWith('http') ? profileImage : profileImage } 
    : { uri: defaultImage };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center mb-2 mt-4 px-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="mr-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Informasi Pribadi</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Kelola identitas dan detail kontak Anda</Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          bounces={false}
        >
          
          <View className="items-center mb-8">
            <View className="relative shadow-sm">
              <Image 
                source={imageSource} 
                className="w-28 h-28 rounded-full border-4 border-white"
              />
              {/* 📸 TOMBOL KLIK UNTUK BUKA GALERI */}
              <TouchableOpacity 
                onPress={pickImage}
                className="absolute bottom-0 right-0 bg-primary w-9 h-9 rounded-full items-center justify-center border-4 border-gray-50 active:bg-sky-600"
              >
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {(!instansi || instansi.toUpperCase().includes('FASKES')) && (
            <View className="bg-sky-50 p-5 rounded-2xl border border-sky-100 mb-8 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Ionicons name="shield-checkmark" size={20} color="#0EA5E9" style={{ marginRight: 8 }} />
                <Text className="text-sky-900 font-bold text-base">Verifikasi Instansi</Text>
              </View>
              <Text className="text-sky-700 text-xs mb-4 leading-relaxed">
                Akun Anda belum terikat ke sekolah manapun. Masukkan kode rahasia sekolah untuk mensinkronkan jadwal distribusi makanan Anda.
              </Text>
              <View className="flex-row items-center space-x-2">
                <TextInput
                  className="flex-1 bg-white border border-sky-200 rounded-xl px-4 py-3 text-gray-900 uppercase font-bold tracking-widest mr-2"
                  placeholder="KODE SEKOLAH"
                  placeholderTextColor="#94A3B8"
                  value={kodeVerify}
                  onChangeText={setKodeVerify}
                  autoCapitalize="characters"
                />
                <TouchableOpacity 
                  onPress={handleVerifyInstitution}
                  disabled={isVerifying || !kodeVerify}
                  className={`px-5 py-3 rounded-xl justify-center items-center ${isVerifying || !kodeVerify ? 'bg-sky-300' : 'bg-primary active:bg-sky-600'}`}
                >
                  {isVerifying ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Validasi</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Data Utama</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <InputField label="Nama Lengkap" value={name} onChangeText={setName} icon="person-outline" />
            <InputField label="Alamat Email" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" />
            <InputField label="Nomor Telepon" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" isLast={true} />
          </View>

          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Detail Demografi</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <InputField label="Tempat Lahir" value={birthDate} onChangeText={setBirthDate} icon="calendar-outline" />
            <InputField label="Alamat Domisili" value={address} onChangeText={setAddress} icon="location-outline" isLast={true} />
          </View>

          <TouchableOpacity 
            onPress={handleSaveChanges}
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl items-center shadow-sm mb-4 ${isLoading ? 'bg-sky-400' : 'bg-primary active:bg-sky-700'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-bold text-base">Simpan Perubahan</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert 
        visible={alertVisible}
        type={alertConfig.type as any}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.type === 'error' ? "Tutup" : "Selesai"}
        onClose={() => setAlertVisible(false)}
        onConfirm={() => {
          setAlertVisible(false);
          if (alertConfig.type === 'success') {
            navigation.goBack();
          }
        }}
      />
    </SafeAreaView>
  );
}