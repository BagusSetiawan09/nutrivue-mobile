import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../../components/CustomAlert';

/**
 * Komponen manajemen profil pengguna untuk pembaruan data identitas dan kontak
 */
export default function PersonalInfoScreen({ navigation }: any) {
  
  /**
   * Inisialisasi state formulir dengan data pengguna yang tersimpan
   */
  const [name, setName] = useState('Bagus Setiawan');
  const [email, setEmail] = useState('bagus.setiawan@email.com');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [address, setAddress] = useState('Jl. Kapten Sumarsono, Helvetia');
  const [birthDate, setBirthDate] = useState('14 Agustus 2005');
  
  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  /**
   * Prosedur pengiriman data formulir ke layanan sinkronisasi backend
   */
  const handleSaveChanges = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAlertVisible(true);
    }, 1500);
  };

  /**
   * Komponen internal untuk standardisasi elemen input teks dalam formulir
   */
  const InputField = ({ label, value, onChangeText, icon, keyboardType = 'default', isLast = false, editable = true }: any) => (
    <View className={`py-3 ${!isLast ? 'border-b border-gray-50' : ''}`}>
      <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{label}</Text>
      <View className="flex-row items-center bg-gray-50/50 rounded-xl px-4 py-3 border border-gray-100">
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* Penanganan tata letak agar input tetap terlihat saat keyboard aktif */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Kontrol navigasi kembali dan judul modul informasi */}
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
          
          {/* Visualisasi foto profil dengan opsi interaksi pembaruan citra */}
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

          {/* Pengelompokan field untuk informasi identitas dan kontak utama */}
          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Data Utama</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <InputField label="Nama Lengkap" value={name} onChangeText={setName} icon="person-outline" />
            <InputField label="Alamat Email" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" />
            <InputField label="Nomor Telepon" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" isLast={true} />
          </View>

          {/* Pengelompokan field untuk informasi demografis dan lokasi */}
          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Detail Demografi</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <InputField label="Tanggal Lahir" value={birthDate} onChangeText={setBirthDate} icon="calendar-outline" />
            <InputField label="Alamat Domisili" value={address} onChangeText={setAddress} icon="location-outline" isLast={true} />
          </View>

          {/* Kontrol pengelolaan parameter keamanan akun */}
          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Keamanan</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center mr-3">
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-gray-900">Kata Sandi</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Diperbarui 3 bulan lalu</Text>
                </View>
              </View>
              <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-lg">
                <Text className="text-gray-700 font-bold text-xs">Ubah</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pemicu aksi penyimpanan data secara global */}
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

      {/* Komponen dialog pemberitahuan keberhasilan sinkronisasi profil */}
      <CustomAlert 
        visible={alertVisible}
        type="success"
        title="Pembaruan Berhasil"
        message="Informasi pribadi Anda telah berhasil diperbarui dan disinkronkan ke sistem."
        confirmText="Selesai"
        onClose={() => setAlertVisible(false)}
        onConfirm={() => {
          setAlertVisible(false);
          navigation.goBack();
        }}
      />

    </SafeAreaView>
  );
}