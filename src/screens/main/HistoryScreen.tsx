import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BottomNavbar from '../../components/BottomNavbar';
import api from '../../config/api';

export default function HistoryScreen({ navigation }: any) {
  
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

  // ⚡ STATE DINAMIS UNTUK DATA REAL
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [totalPorsi, setTotalPorsi] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lokasiUser, setLokasiUser] = useState('Memuat Lokasi...');

  // ⚡ JALANKAN SAAT HALAMAN DIBUKA
  useEffect(() => {
    fetchUserData();
    fetchHistoryData();
  }, []);

  /**
   * Mengambil data lokasi cerdas dari memori HP
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
      console.log('Gagal baca storage:', error);
    }
  };

  /**
   * Menarik data riwayat pengambilan gizi dari Database (Laravel API)
   */
  const fetchHistoryData = async () => {
    try {
      setIsLoading(true);
      // Tembak ke API Laravel (Pastikan endpoint /meal/history ini sudah ada di backend)
      const response = await api.get('/meal/history');
      
      if (response.data.status === 'success') {
        setHistoryData(response.data.data);
        setTotalPorsi(response.data.total_bulan_ini || 0);
      }
    } catch (error) {
      console.log('Gagal menarik riwayat:', error);
      // Jika API belum siap, kita biarkan kosong dulu
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* LOGIKA LOADING & DATA KOSONG */}
        {isLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text className="text-gray-400 mt-4 font-medium">Memuat riwayat Anda...</Text>
          </View>
        ) : historyData.length === 0 ? (
          <View className="items-center justify-center py-10 bg-white rounded-2xl border border-gray-100 border-dashed">
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-3 font-medium">Belum ada riwayat pengambilan</Text>
          </View>
        ) : (
          historyData.map((item, index) => (
            <View key={item.id || index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 mb-4 flex-row items-center">
              
              {/* Indikator visual tanggal distribusi gizi */}
              <View className="w-14 h-14 rounded-2xl bg-sky-50 items-center justify-center mr-4 border border-sky-100">
                <Text className="text-primary font-bold text-lg">{item.tanggal ? item.tanggal.split(' ')[0] : '-'}</Text>
                <Text className="text-sky-600 text-[10px] font-medium uppercase">{item.tanggal ? item.tanggal.split(' ')[1] : '-'}</Text>
              </View>

              {/* Representasi detail metadata setiap porsi makanan */}
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base mb-1">{item.menu}</Text>
                
                <View className="flex-row items-center mb-1.5">
                  <Ionicons name="location" size={12} color="#9CA3AF" />
                  {/* Gunakan lokasi dari API jika ada, jika tidak gunakan fallback dari AsyncStorage */}
                  <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
                    {item.lokasi || lokasiUser}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="time" size={12} color="#0EA5E9" />
                  <Text className="text-primary text-xs ml-1 font-medium">{item.waktu}</Text>
                  <Text className="text-gray-300 mx-2">•</Text>
                  <Ionicons name="flame" size={12} color="#F59E0B" />
                  <Text className="text-amber-500 text-xs ml-1 font-medium">{item.kalori || '0 kcal'}</Text>
                </View>
              </View>

              {/* Indikator status penyelesaian pengambilan gizi */}
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

      <BottomNavbar activeTab="History" navigation={navigation} translateY={navTranslateY} />
    </SafeAreaView>
  );
}