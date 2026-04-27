import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../../components/CustomAlert';
import api from '../../../config/api';

// Komponen InputField dipindah ke LUAR agar tidak re-render & hilang fokus saat mengetik
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
  
  // State baru untuk mengecek instansi pengguna saat ini
  const [instansi, setInstansi] = useState('');
  
  // State baru untuk fitur Verifikasi Mandiri
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
        setInstansi(user.instansi || ''); // Menyimpan nama instansi saat ini
      }
    } catch (error) {
      console.log('Gagal menarik data profil lokal', error);
    } finally {
      setIsScreenLoading(false);
    }
  };

  // Fungsi khusus untuk melakukan verifikasi kode rahasia instansi
  const handleVerifyInstitution = async () => {
    if (!kodeVerify) return;
    setIsVerifying(true);
    try {
      const response = await api.post('/profile/verify-institution', {
        kode_rahasia: kodeVerify
      });
      
      if (response.data.status === 'success') {
        const updatedUser = response.data.data;
        
        // Memperbarui data memori lokal agar tampilan di Beranda & Profil ikut berubah
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          let user = JSON.parse(userDataString);
          user.instansi = updatedUser.instansi;
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }

        setInstansi(updatedUser.instansi); // Menyembunyikan form verifikasi
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
        message: error.response?.data?.message || 'Kode rahasia tidak valid atau tidak terdaftar.'
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
      const payload = { 
        name, 
        email, 
        phone, 
        alamat: address, 
        tempat_lahir: birthDate 
      };
      
      const response = await api.post('/profile/update', payload);

      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        let user = JSON.parse(userDataString);
        user = { ...user, ...payload }; 
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      setAlertConfig({ 
        type: 'success', 
        title: 'Pembaruan Berhasil', 
        message: 'Informasi pribadi Anda telah berhasil diperbarui dan disinkronkan ke sistem.' 
      });
      setAlertVisible(true);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal menghubungi server. Pastikan API berjalan normal.';
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
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=500&auto=format&fit=crop' }} 
                className="w-28 h-28 rounded-full border-4 border-white"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 bg-primary w-9 h-9 rounded-full items-center justify-center border-4 border-gray-50 active:bg-sky-600">
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* KOTAK VERIFIKASI MANDIRI - Hanya muncul jika belum ada instansi atau masih faskes terdaftar */}
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
          // Jika sukses menyimpan profil ATAU sukses verifikasi, kembali ke layar sebelumnya (Profil)
          if (alertConfig.type === 'success') {
            navigation.goBack();
          }
        }}
      />
    </SafeAreaView>
  );
}