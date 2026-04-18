import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

/**
 * Komponen kartu identitas digital untuk keperluan verifikasi pengambilan gizi
 */
export default function DigitalIdScreen({ navigation }: any) {
  
  /**
   * Data statis identitas pengguna untuk keperluan representasi antarmuka
   */
  const userData = {
    name: 'Bagus Setiawan',
    role: 'Siswa',
    institution: 'SMKS PAB 2 Helvetia',
    idNumber: '2214370148',
    bloodType: 'O+',
    qrPayload: 'NUTRI-2214370148-VALID', 
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=500&auto=format&fit=crop'
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* Bagian navigasi kembali dan judul halaman */}
      <View className="flex-row items-center mb-6 mt-4 px-6">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="mr-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-gray-900">ID Digital</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Tunjukkan kartu ini saat pengambilan</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 px-6 pt-2"
        contentContainerStyle={{ paddingBottom: 60, alignItems: 'center' }}
        bounces={false}
      >

        {/* Struktur utama kontainer kartu identitas digital */}
        <View 
          className="bg-white w-full max-w-[340px] rounded-[32px] shadow-2xl shadow-sky-900/20 overflow-hidden border border-gray-100 mt-8"
        >
          {/* Bagian header visual kartu dengan ornamen dekoratif */}
          <View className="bg-primary h-32 items-center pt-6 px-6 relative">
            <View className="flex-row items-center w-full justify-between opacity-80">
              <Text className="text-white font-bold text-xs tracking-widest uppercase">NutriVue Access</Text>
              <Ionicons name="shield-checkmark" size={16} color="white" />
            </View>
            
            <View className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
            <View className="absolute bottom-1.5 left-0 right-0 h-0.5 bg-white/10" />
          </View>

          {/* Penempatan foto profil dengan teknik overlap ke area header */}
          <View className="items-center -mt-14 mb-4 z-10">
            <View className="bg-white p-1.5 rounded-full shadow-sm">
              <Image 
                source={{ uri: userData.photo }} 
                className="w-24 h-24 rounded-full border-2 border-gray-100"
              />
            </View>
          </View>

          {/* Bagian detail informasi identitas pengguna */}
          <View className="items-center px-6 pb-6">
            <Text className="text-2xl font-black text-gray-900 mb-1">{userData.name}</Text>
            <View className="bg-sky-50 px-3 py-1 rounded-full mb-4">
              <Text className="text-primary font-bold text-xs uppercase tracking-wider">{userData.role}</Text>
            </View>

            <Text className="text-gray-500 font-medium text-sm text-center leading-relaxed">
              {userData.institution}
            </Text>
            
            {/* Informasi metrik tambahan seperti nomor induk dan golongan darah */}
            <View className="flex-row w-full justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
              <View className="items-center">
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1">Nomor Induk</Text>
                <Text className="text-gray-900 font-black text-base">{userData.idNumber}</Text>
              </View>
              <View className="w-px h-full bg-gray-200" />
              <View className="items-center">
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1">Gol. Darah</Text>
                <Text className="text-rose-500 font-black text-base">{userData.bloodType}</Text>
              </View>
            </View>
          </View>

          {/* Area verifikasi kode QR dengan latar belakang yang kontras */}
          <View className="bg-gray-50 items-center justify-center py-8 border-t border-gray-100 border-dashed">
            <View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
              <QRCode 
                value={userData.qrPayload} 
                size={160} 
                color="#111827" 
                backgroundColor="white" 
              />
            </View>
            <Text className="text-[10px] text-gray-400 font-bold uppercase mt-4 tracking-widest">Pindai untuk verifikasi</Text>
          </View>

        </View>

        {/* Kotak informasi tambahan untuk panduan penggunaan perangkat */}
        <View className="flex-row items-center mt-8 bg-sky-50 py-3 px-4 rounded-2xl border border-sky-100 max-w-[340px]">
          <Ionicons name="sunny" size={20} color="#0EA5E9" style={{ marginRight: 12 }} />
          <Text className="flex-1 text-xs text-sky-700 font-medium leading-relaxed">
            Terangkan layar perangkat Anda saat melakukan pemindaian agar QR Code lebih mudah terbaca oleh alat mitra.
          </Text>
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}