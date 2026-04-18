import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomNavbar from '../../components/BottomNavbar';

/**
 * Komponen pelaporan riwayat untuk audit distribusi gizi pengguna
 */
export default function HistoryScreen({ navigation }: any) {
  
  /**
   * Konfigurasi animasi untuk kontrol visibilitas bar navigasi bawah
   */
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);

  /**
   * Prosedur pemicu animasi kemunculan bar navigasi
   */
  const showNavbar = () => Animated.spring(navTranslateY, { toValue: 0, useNativeDriver: true, speed: 10, bounciness: 2 }).start();
  
  /**
   * Prosedur pemicu animasi penyembunyian bar navigasi
   */
  const hideNavbar = () => Animated.spring(navTranslateY, { toValue: 150, useNativeDriver: true, speed: 10, bounciness: 0 }).start();

  /**
   * Logika penanganan interaksi gulir untuk deteksi arah gerakan layar
   */
  const handleScroll = (e: any) => {
    const currentOffsetY = e.nativeEvent.contentOffset.y;
    const direction = currentOffsetY > lastOffsetY.current ? 'down' : 'up';
    
    if (currentOffsetY > 50 && direction === 'down') hideNavbar();
    else if (direction === 'up' || currentOffsetY <= 50) showNavbar();
    
    lastOffsetY.current = currentOffsetY;
  };

  /**
   * Sekumpulan data statis untuk representasi riwayat distribusi gizi
   */
  const [historyData] = useState([
    {
      id: '1',
      tanggal: '18 April 2026',
      waktu: '11:45 WIB',
      menu: 'Nasi Ayam Bakar Madu',
      lokasi: 'SMKS PAB 2 Helvetia',
      status: 'Berhasil Diambil',
      kalori: '650 kcal'
    },
    {
      id: '2',
      tanggal: '17 April 2026',
      waktu: '12:10 WIB',
      menu: 'Nasi Ikan Nila & Susu',
      lokasi: 'SMKS PAB 2 Helvetia',
      status: 'Berhasil Diambil',
      kalori: '720 kcal'
    },
    {
      id: '3',
      tanggal: '16 April 2026',
      waktu: '11:30 WIB',
      menu: 'Nasi Telur Puyuh & Buah',
      lokasi: 'SMKS PAB 2 Helvetia',
      status: 'Berhasil Diambil',
      kalori: '580 kcal'
    },
  ]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* Struktur header statis dengan navigasi kembali */}
      <View className="px-6 pt-6 pb-4 bg-white shadow-sm shadow-gray-100 z-10 flex-row items-center">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-gray-900">Riwayat Makanan</Text>
          <Text className="text-sm text-gray-500 mt-0.5">Jejak distribusi nutrisi Anda bulan ini</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 140 }} 
        onScroll={handleScroll}
        onScrollEndDrag={showNavbar}
        onMomentumScrollEnd={showNavbar}
        scrollEventThrottle={16}
      >
        
        {/* Kontainer visual ringkasan total asupan bulanan */}
        <View className="bg-primary p-5 rounded-2xl mb-8 flex-row items-center justify-between shadow-lg shadow-sky-200">
          <View>
            <Text className="text-sky-100 text-sm font-medium mb-1">Total Diambil (Bulan Ini)</Text>
            <View className="flex-row items-end">
              <Text className="text-white text-3xl font-bold">12</Text>
              <Text className="text-sky-100 text-base mb-1 ml-1"> Porsi</Text>
            </View>
          </View>
          <View className="bg-white/20 w-14 h-14 rounded-full items-center justify-center border border-white/30">
            <Ionicons name="restaurant" size={28} color="white" />
          </View>
        </View>

        {/* Daftar urut waktu untuk setiap catatan distribusi gizi */}
        <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Minggu Ini</Text>

        {historyData.map((item) => (
          <View key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 mb-4 flex-row items-center">
            
            {/* Indikator visual tanggal distribusi gizi */}
            <View className="w-14 h-14 rounded-2xl bg-sky-50 items-center justify-center mr-4 border border-sky-100">
              <Text className="text-primary font-bold text-lg">{item.tanggal.split(' ')[0]}</Text>
              <Text className="text-sky-600 text-[10px] font-medium uppercase">{item.tanggal.split(' ')[1]}</Text>
            </View>

            {/* Representasi detail metadata setiap porsi makanan */}
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-base mb-1">{item.menu}</Text>
              
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="location" size={12} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>{item.lokasi}</Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="time" size={12} color="#0EA5E9" />
                <Text className="text-primary text-xs ml-1 font-medium">{item.waktu}</Text>
                <Text className="text-gray-300 mx-2">•</Text>
                <Ionicons name="flame" size={12} color="#F59E0B" />
                <Text className="text-amber-500 text-xs ml-1 font-medium">{item.kalori}</Text>
              </View>
            </View>

            {/* Indikator status penyelesaian pengambilan gizi */}
            <View className="items-center justify-center pl-2">
              <View className="bg-emerald-50 w-8 h-8 rounded-full items-center justify-center border border-emerald-100">
                <Ionicons name="checkmark" size={16} color="#10B981" />
              </View>
            </View>

          </View>
        ))}

        {/* Penanda batas akhir informasi daftar riwayat */}
        <View className="items-center mt-6">
          <Text className="text-gray-400 text-xs">Menampilkan riwayat 30 hari terakhir</Text>
        </View>

      </ScrollView>

      {/* Komponen navigasi bawah dengan kontrol animasi transformasi */}
      <BottomNavbar activeTab="History" navigation={navigation} translateY={navTranslateY} />
    </SafeAreaView>
  );
}