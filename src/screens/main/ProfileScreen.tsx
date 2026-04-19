import React, { useRef, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Image, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // ⚡ RADAR REFRESH HALAMAN
import BottomNavbar from '../../components/BottomNavbar';

export default function ProfileScreen({ navigation }: any) {
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const isNavbarVisible = useRef(true);

  // ⚡ STATE UNTUK MENYIMPAN DATA DINAMIS DARI LOKAL MEMORI
  const [userData, setUserData] = useState({
    name: 'Memuat Data...',
    kategori: '...'
  });

  // ⚡ USE FOCUS EFFECT: Menarik data terbaru setiap kali halaman Profil dibuka
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const userString = await AsyncStorage.getItem('user');
          if (userString) {
            const user = JSON.parse(userString);
            setUserData({
              name: user.name || 'Pengguna NutriVue',
              // Anda bisa menyesuaikan ini. Jika kategori Siswa, bisa ditambah nama sekolahnya.
              kategori: user.kategori ? `${user.kategori} NutriVue` : 'Siswa SMKS PAB 2 Helvetia',
            });
          }
        } catch (error) {
          console.log('Gagal memuat data profil:', error);
        }
      };

      loadUserData();
    }, [])
  );

  const showNavbar = () => {
    if (!isNavbarVisible.current) {
      Animated.timing(navTranslateY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      isNavbarVisible.current = true;
    }
  };

  const hideNavbar = () => {
    if (isNavbarVisible.current) {
      Animated.timing(navTranslateY, { toValue: 150, duration: 250, useNativeDriver: true }).start();
      isNavbarVisible.current = false;
    }
  };

  const handleScroll = (e: any) => {
    const currentOffsetY = e.nativeEvent.contentOffset.y;
    const contentHeight = e.nativeEvent.contentSize.height;
    const layoutHeight = e.nativeEvent.layoutMeasurement.height;

    if (currentOffsetY < 0 || currentOffsetY > (contentHeight - layoutHeight)) return;

    const deltaY = currentOffsetY - lastOffsetY.current;
    if (Math.abs(deltaY) > 10) {
      if (deltaY > 0 && currentOffsetY > 50) hideNavbar();
      else if (deltaY < 0) showNavbar();
      lastOffsetY.current = currentOffsetY;
    }
  };

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [pushNotification, setPushNotification] = useState(true);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await AsyncStorage.removeItem('auth_token'); // Pastikan ini sesuai dengan nama token login Anda
      await AsyncStorage.removeItem('user'); 
      navigation.replace('Login'); 
    } catch (e) {
      console.log('Kegagalan terminasi sesi pengguna', e);
    }
  };

  const MenuRow = ({ icon, title, subtitle, color, isLast, rightElement, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center py-4 ${!isLast ? 'border-b border-gray-50' : ''}`}
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 bg-${color}-50`}>
        <Ionicons name={icon} size={20} color={`#${color === 'sky' ? '0EA5E9' : color === 'rose' ? 'F43F5E' : color === 'emerald' ? '10B981' : color === 'amber' ? 'F59E0B' : '64748B'}`} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-bold text-sm mb-0.5">{title}</Text>
        {subtitle && <Text className="text-gray-400 text-[10px]">{subtitle}</Text>}
      </View>
      {rightElement ? rightElement : <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Profil Komandan</Text>
        <TouchableOpacity className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <Ionicons name="scan" size={20} color="#0EA5E9" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 140 }}
        onScroll={handleScroll}
        onScrollEndDrag={showNavbar}
        onMomentumScrollEnd={showNavbar}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
      >
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 items-center mb-6 relative">
          <TouchableOpacity 
            onPress={() => navigation.navigate('PersonalInfo')}
            className="absolute top-4 right-4 p-2"
          >
            <Ionicons name="pencil" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View className="relative mb-4 mt-2">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=500&auto=format&fit=crop' }} 
              className="w-24 h-24 rounded-full border-4 border-sky-50"
            />
            <View className="absolute bottom-0 right-0 bg-emerald-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="checkmark" size={14} color="white" />
            </View>
          </View>

          {/* ⚡ MENAMPILKAN NAMA DINAMIS */}
          <Text className="text-2xl font-bold text-gray-900 mb-1">{userData.name}</Text>
          <Text className="text-gray-500 text-sm font-medium mb-4">{userData.kategori}</Text>
          
          <View className="bg-primary/10 px-4 py-2 rounded-full flex-row items-center">
            <Ionicons name="shield-checkmark" size={14} color="#0EA5E9" style={{ marginRight: 6 }} />
            <Text className="text-primary font-bold text-xs uppercase tracking-wide">Akun Terverifikasi</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-8">
          <View className="bg-white p-4 rounded-xl w-[48%] shadow-sm border border-gray-100 items-center">
            <View className="w-10 h-10 bg-amber-50 rounded-full items-center justify-center mb-2">
              <Ionicons name="flame" size={20} color="#F59E0B" />
            </View>
            <Text className="text-xl font-black text-gray-900">12 Hari</Text>
            <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Beruntun</Text>
          </View>
          
          <View className="bg-white p-4 rounded-xl w-[48%] shadow-sm border border-gray-100 items-center">
            <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mb-2">
              <Ionicons name="restaurant" size={20} color="#10B981" />
            </View>
            <Text className="text-xl font-black text-gray-900">45 Porsi</Text>
            <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Total Diambil</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Pengaturan Akun</Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <MenuRow icon="person-outline" title="Informasi Pribadi" subtitle="Ubah parameter kontak pengguna" color="sky" onPress={() => navigation.navigate('PersonalInfo')} />
          <MenuRow icon="medical-outline" title="Data Kesehatan" subtitle="Manajemen riwayat medis alergi" color="emerald" onPress={() => navigation.navigate('HealthData')} />
          <MenuRow icon="card-outline" title="Kartu Identitas Digital" subtitle="Penyajian visual tiket gizi" color="amber" isLast={true} onPress={() => navigation.navigate('DigitalId')} />
        </View>

        <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Preferensi Sistem</Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <MenuRow 
            icon="notifications-outline" 
            title="Notifikasi Pengingat" 
            subtitle="Kendali penyebaran informasi jadwal" 
            color="sky" 
            rightElement={
              <Switch 
                trackColor={{ false: "#E2E8F0", true: "#BAE6FD" }}
                thumbColor={pushNotification ? "#0EA5E9" : "#F8FAFC"}
                onValueChange={() => setPushNotification(!pushNotification)}
                value={pushNotification}
              />
            }
          />
          <MenuRow 
            icon="lock-closed-outline" 
            title="Privasi Keamanan" 
            subtitle="Perlindungan autentikasi biometrik" 
            color="slate" 
            onPress={() => navigation.navigate('Security')} 
          />
          
          <MenuRow 
            icon="help-buoy-outline" 
            title="Pusat Bantuan" 
            subtitle="Informasi layanan kendala teknis" 
            color="slate" 
            isLast={true} 
            onPress={() => navigation.navigate('HelpCenter')} 
          />
        </View>

        <TouchableOpacity 
          onPress={() => setLogoutModalVisible(true)}
          className="bg-white border border-red-100 p-5 rounded-xl shadow-sm flex-row items-center justify-center mb-8 active:bg-red-50"
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" style={{ marginRight: 8 }} />
          <Text className="text-red-500 font-bold text-base">Keluar dari Akun</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-300 text-[10px] font-medium mb-2">NutriVue App v1.0.0 Build 26</Text>
        <Text className="text-center text-gray-300 text-[10px] font-medium">Dirancang di Medan Indonesia</Text>

      </ScrollView>

      <BottomNavbar activeTab="Profile" navigation={navigation} translateY={navTranslateY} />

      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl items-center">
            
            <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="warning" size={32} color="#EF4444" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Akhiri Sesi</Text>
            <Text className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              Anda perlu masuk kembali menggunakan alamat email untuk melihat jadwal distribusi gizi
            </Text>

            <View className="flex-row justify-between w-full space-x-3">
              <TouchableOpacity 
                onPress={() => setLogoutModalVisible(false)}
                className="flex-1 bg-gray-50 border border-gray-200 py-4 rounded-xl items-center active:bg-gray-100"
              >
                <Text className="text-gray-700 font-bold text-base">Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleLogout}
                className="flex-1 bg-red-500 py-4 rounded-xl items-center shadow-sm shadow-red-200 active:bg-red-600"
              >
                <Text className="text-white font-bold text-base">Ya Keluar</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}