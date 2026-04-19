import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../../components/CustomAlert';
import api from '../../../config/api';

/**
 * Komponen manajemen profil pengguna terintegrasi API
 */
export default function PersonalInfoScreen({ navigation }: any) {
  
  // ⚡ State untuk Data Dinamis
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', message: '' });

  // ⚡ AMBIL DATA ASLI SAAT HALAMAN DIBUKA
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Ambil data user yang tersimpan saat login
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || ''); // Opsional: pastikan kolom ini ada di backend nanti
        setAddress(user.alamat || ''); 
        setBirthDate(user.tempat_lahir || ''); // Disuaikan dengan kolom database Anda
      }
    } catch (error) {
      console.log('Gagal menarik data profil lokal', error);
    } finally {
      setIsScreenLoading(false);
    }
  };

  /**
   * Prosedur pengiriman data ke Laravel Backend & update lokal
   */
  const handleSaveChanges = async () => {
    if (!name || !email) {
      setAlertConfig({ type: 'error', title: 'Validasi Gagal', message: 'Nama dan Email tidak boleh kosong!' });
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      // ⚡ 1. Kirim data pembaruan ke API Laravel
      const payload = { 
        name, 
        email, 
        phone, 
        alamat: address, 
        tempat_lahir: birthDate 
      };
      
      // Buka komentar di bawah jika endpoint /profile/update sudah siap di Laravel
      const response = await api.post('/profile/update', payload);

      // ⚡ 2. Update data di AsyncStorage agar perubahan langsung terasa di aplikasi
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        let user = JSON.parse(userDataString);
        user = { ...user, ...payload }; 
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      // Simulasi delay (Hapus jika API backend sudah aktif)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAlertConfig({ 
        type: 'success', 
        title: 'Pembaruan Berhasil', 
        message: 'Informasi pribadi Anda telah berhasil diperbarui dan disinkronkan ke sistem.' 
      });
      setAlertVisible(true);

    } catch (error) {
      console.log('Kegagalan sinkronisasi profil', error);
      setAlertConfig({ type: 'error', title: 'Sistem Sibuk', message: 'Gagal menghubungi server. Periksa koneksi Anda.' });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

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

          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Keamanan</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center mr-3">
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-gray-900">Kata Sandi</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Diperbarui saat registrasi</Text>
                </View>
              </View>
              <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-lg">
                <Text className="text-gray-700 font-bold text-xs">Ubah</Text>
              </TouchableOpacity>
            </View>
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
        confirmText={alertConfig.type === 'error' ? "Coba Lagi" : "Selesai"}
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