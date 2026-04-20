import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BottomNavbar from '../../components/BottomNavbar';
import api from '../../config/api';

/**
 * Layar Riwayat (HistoryScreen)
 * Bertugas menampilkan log pengambilan nutrisi/gizi pengguna.
 * Dilengkapi dengan proteksi tipe data (Defensive Programming) untuk mencegah crash rendering.
 */
export default function HistoryScreen({ navigation }: any) {
  
  // Konfigurasi animasi untuk menyembunyikan/menampilkan Bottom Navbar saat di-scroll
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);

  const showNavbar = () => Animated.spring(navTranslateY, { toValue: 0, useNativeDriver: true, speed: 10, bounciness: 2 }).start();
  const hideNavbar = () => Animated.spring(navTranslateY, { toValue: 150, useNativeDriver: true, speed: 10, bounciness: 0 }).start();

  const handleScroll = (e: any) => {
    const currentOffsetY = e.nativeEvent.contentOffset.y;
    const direction = currentOffsetY > lastOffsetY.current ? 'down' : 'up';
    
    if (currentOffsetY > 50 && direction === 'down') hideNavbar();
    else if (direction === 'up' || currentOffsetY <= 50) showNavbar();
    
    lastOffsetY.current = currentOffsetY;
  };

  // State Manajemen Data Dinamis
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [totalPorsi, setTotalPorsi] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lokasiUser, setLokasiUser] = useState('Memuat Lokasi...');

  // Hook inisialisasi awal saat komponen dimuat
  useEffect(() => {
    fetchUserData();
    fetchHistoryData();
  }, []);

  /**
   * Mengambil data profil lokal pengguna untuk menentukan lokasi default
   * jika data dari server tidak memiliki keterangan lokasi spesifik.
   */
  const fetchUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        if (user.kategori === 'siswa') setLokasiUser('SMKS PAB 2 HELVETIA');
        else if (user.kategori === 'ibu_hamil' || user.kategori === 'ibu_balita') setLokasiUser('POSYANDU MITRA');
        else setLokasiUser('FASKES TERDAFTAR');
      }
    } catch (error) {
      console.log('[Profil Lokal] Gagal membaca storage:', error);
    }
  };

  /**
   * Menarik data riwayat distribusi gizi dari API backend Laravel.
   * Dilengkapi dengan validasi struktur data untuk memastikan kestabilan UI.
   */
  const fetchHistoryData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/meal/schedule');
      
      if (response.data.status === 'success') {
        // ⚡ PERISAI DATA (DEFENSIVE PROGRAMMING)
        // Mencegah error "map is not a function" jika Laravel mengirim Object (Paginasi) atau null.
        let dataAsli = [];
        if (Array.isArray(response.data.data)) {
          // Jika data murni array
          dataAsli = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data.data)) {
          // Jika data dibungkus struktur Paginasi Laravel (response.data.data.data)
          dataAsli = response.data.data.data; 
        }
        
        setHistoryData(dataAsli);
        setTotalPorsi(response.data.total_bulan_ini || 0);
      }
    } catch (error) {
      console.log('[API Riwayat] Gagal menarik data dari server:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* Header Statis */}
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
        
        {/* Kartu Ringkasan Asupan Bulanan */}
        <View className="bg-primary p-5 rounded-2xl mb-8 flex-row items-center justify-between shadow-lg shadow-sky-200">
          <View>
            <Text className="text-sky-100 text-sm font-medium mb-1">Total Diambil (Bulan Ini)</Text>
            <View className="flex-row items-end">
              <Text className="text-white text-3xl font-bold">
                {isLoading ? '-' : totalPorsi}
              </Text>
              <Text className="text-sky-100 text-base mb-1 ml-1"> Porsi</Text>
            </View>
          </View>
          <View className="bg-white/20 w-14 h-14 rounded-full items-center justify-center border border-white/30">
            <Ionicons name="restaurant" size={28} color="white" />
          </View>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Minggu Ini</Text>

        {/* ⚡ LOGIKA RENDER DINAMIS & AMAN */}
        {isLoading ? (
          // State 1: Sedang Memuat Data
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text className="text-gray-400 mt-4 font-medium">Memuat riwayat Anda...</Text>
          </View>
        ) : (!Array.isArray(historyData) || historyData.length === 0) ? (
          // State 2: Data Kosong atau Bukan Array (Mencegah Crash Map)
          <View className="items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 border-dashed">
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-3 font-medium">Belum ada riwayat pengambilan</Text>
          </View>
        ) : (
          // State 3: Menampilkan Data List Array
          historyData.map((item, index) => (
            <View key={item.id || index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 mb-4 flex-row items-center">
              
              {/* Indikator Tanggal Distribusi */}
              <View className="w-14 h-14 rounded-2xl bg-sky-50 items-center justify-center mr-4 border border-sky-100">
                <Text className="text-primary font-bold text-lg">{item.tanggal ? item.tanggal.split(' ')[0] : '-'}</Text>
                <Text className="text-sky-600 text-[10px] font-medium uppercase">{item.tanggal ? item.tanggal.split(' ')[1] : '-'}</Text>
              </View>

              {/* Metadata Porsi Makanan */}
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base mb-1">{item.menu || 'Menu Terjadwal'}</Text>
                
                <View className="flex-row items-center mb-1.5">
                  <Ionicons name="location" size={12} color="#9CA3AF" />
                  <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
                    {item.lokasi || lokasiUser}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="time" size={12} color="#0EA5E9" />
                  <Text className="text-primary text-xs ml-1 font-medium">{item.waktu || '-'}</Text>
                  <Text className="text-gray-300 mx-2">•</Text>
                  <Ionicons name="flame" size={12} color="#F59E0B" />
                  <Text className="text-amber-500 text-xs ml-1 font-medium">{item.kalori || '0 kcal'}</Text>
                </View>
              </View>

              {/* Status Selesai */}
              <View className="items-center justify-center pl-2">
                <View className="bg-emerald-50 w-8 h-8 rounded-full items-center justify-center border border-emerald-100">
                  <Ionicons name="checkmark" size={16} color="#10B981" />
                </View>
              </View>

            </View>
          ))
        )}

        <View className="items-center mt-6">
          <Text className="text-gray-400 text-xs">Menampilkan riwayat 30 hari terakhir</Text>
        </View>

      </ScrollView>

      {/* Komponen Navigasi Utama */}
      <BottomNavbar activeTab="History" navigation={navigation} translateY={navTranslateY} />
    </SafeAreaView>
  );
}