import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import BottomNavbar from '../../components/BottomNavbar';
import api from '../../config/api';
import CustomAlert from '../../components/CustomAlert';
import DailyTracker from '../../components/DailyTracker';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  
  const [userName, setUserName] = useState('Memuat...');
  const [kategori, setKategori] = useState('...');
  const [lokasi, setLokasi] = useState('...');

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState('');
  const [isLoadingQr, setIsLoadingQr] = useState(false);

  const [nutrition, setNutrition] = useState({ kalori: 0, protein: 0, lemak: 0, namaMenu: 'Memuat...' });
  const [greeting, setGreeting] = useState('Selamat Datang,');

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ type: 'warning', title: '', message: '' });

  const navTranslateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 4 && currentHour < 11) {
      setGreeting('Selamat Pagi,');
    } else if (currentHour >= 11 && currentHour < 15) {
      setGreeting('Selamat Siang,');
    } else if (currentHour >= 15 && currentHour < 18) {
      setGreeting('Selamat Sore,');
    } else {
      setGreeting('Selamat Malam,');
    }

    fetchUserData();
    fetchTodayMenu();
  }, []);

  const fetchUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user');
      
      if (userDataString) {
        const user = JSON.parse(userDataString);
        
        const firstName = user.name.split(' ')[0];
        setUserName(firstName);

        const formattedKategori = user.kategori ? user.kategori.replace('_', ' ').toUpperCase() : 'PENGGUNA';
        setKategori(formattedKategori);

        // Menampilkan nama instansi asli dari basis data
        setLokasi(user.instansi ? user.instansi.toUpperCase() : 'FASKES TERDAFTAR');
      }
    } catch (error) {
      console.log('Gagal mengambil data pengguna dari penyimpanan lokal', error);
    }
  };

  // Menggunakan rute jadwal cerdas agar selaras dengan layar jadwal
  const fetchTodayMenu = async () => {
    try {
      const response = await api.get('/meal/schedule');
      
      if (response.data.status === 'success' && response.data.data && response.data.data['Hari Ini']) {
        const menuHariIni = response.data.data['Hari Ini'];
        
        const dataProtein = menuHariIni.macros.find((m: any) => m.name === 'Protein');
        const dataLemak = menuHariIni.macros.find((m: any) => m.name === 'Lemak');
        
        setNutrition({
          kalori: menuHariIni.calories,
          protein: dataProtein ? dataProtein.population : 0,
          lemak: dataLemak ? dataLemak.population : 0,
          namaMenu: menuHariIni.title
        });
      } else {
        setNutrition({ kalori: 0, protein: 0, lemak: 0, namaMenu: 'Belum Tersedia' });
      }
    } catch (error) {
      console.log('Gagal melakukan sinkronisasi data nutrisi', error);
    }
  };

  const showNavbar = () => Animated.spring(navTranslateY, { toValue: 0, useNativeDriver: true, speed: 10, bounciness: 2 }).start();
  const hideNavbar = () => Animated.spring(navTranslateY, { toValue: 150, useNativeDriver: true, speed: 10, bounciness: 0 }).start();

  const handleScroll = (e: any) => {
    const currentOffsetY = e.nativeEvent.contentOffset.y;
    const direction = currentOffsetY > lastOffsetY.current ? 'down' : 'up';
    if (currentOffsetY > 50 && direction === 'down') hideNavbar();
    else if (direction === 'up' || currentOffsetY <= 50) showNavbar();
    lastOffsetY.current = currentOffsetY;
  };

  const handleGenerateQR = async () => {
    setIsLoadingQr(true);
    try {
      const response = await api.post('/meal/generate-qr');
      if (response.data.status === 'success') {
        setQrData(response.data.qr_data);
        setQrModalVisible(true);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Kegagalan sistem jaringan konektivitas memburuk';
      setAlertConfig({ type: 'warning', title: 'Akses Terbatas', message: errorMessage });
      setAlertVisible(true);
    } finally {
      setIsLoadingQr(false);
    }
  };

  const nutritionItems = [
    { label: 'Kalori', value: `${nutrition.kalori} kcal`, icon: 'flame' as const },
    { label: 'Protein', value: `${nutrition.protein} g`, icon: 'fitness' as const },
    { label: 'Lemak', value: `${nutrition.lemak} g`, icon: 'leaf' as const },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 px-6 pt-2"
        contentContainerStyle={{ paddingBottom: 130 }} 
        onScroll={handleScroll}
        onScrollEndDrag={showNavbar}
        onMomentumScrollEnd={showNavbar}
        scrollEventThrottle={16}
      >
        <View className="flex-row justify-between items-center mb-8 mt-6">
          <View>
            <Text className="text-gray-400 text-sm font-medium mb-1">{greeting}</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-900 text-2xl font-bold mr-2">{userName}</Text>
              <Ionicons name="sunny" size={24} color="#F59E0B" />
            </View>
            
            <View className="bg-sky-100 self-start px-3 py-1.5 rounded-full mt-2 flex-row items-center">
              <Ionicons name="business" size={12} color="#0EA5E9" style={{ marginRight: 6 }} />
              <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">
                {kategori} • {lokasi}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 relative">
            <Ionicons name="notifications-outline" size={24} color="#111827" />
            <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>

        <View className="bg-primary p-6 rounded-2xl shadow-xl shadow-sky-200 mb-8 overflow-hidden">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <Text className="text-sky-100 text-sm font-medium mb-1">Menu Hari Ini: {nutrition.namaMenu}</Text>
              <Text className="text-white text-xl font-bold leading-tight">Jatah Makan Bergizi Anda Tersedia</Text>
            </View>
            <View className="bg-white/20 p-4 rounded-2xl border border-white/30">
              <Ionicons name="qr-code" size={32} color="white" />
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleGenerateQR}
            disabled={isLoadingQr}
            className={`bg-white mt-6 py-4 rounded-xl items-center shadow-sm ${isLoadingQr ? 'opacity-80' : 'active:bg-gray-50'}`}
          >
            {isLoadingQr ? (
              <ActivityIndicator color="#0EA5E9" size="small" />
            ) : (
              <Text className="text-primary font-bold">Tampilkan Kode Pengambilan</Text>
            )}
          </TouchableOpacity>
        </View>

        <DailyTracker />

        <View className="mb-8">
          <Text className="text-gray-900 text-lg font-bold mb-4 px-1">Analisis Nutrisi</Text>
          <View className="flex-row justify-between">
            {nutritionItems.map((item, idx) => (
              <View key={item.label} className="bg-white p-5 rounded-2xl w-[31%] items-center shadow-sm border border-gray-50">
                <View className="w-12 h-12 rounded-full bg-sky-50 items-center justify-center mb-3">
                  <Ionicons name={item.icon} size={20} color={idx === 0 ? "#ef4444" : idx === 1 ? "#3b82f6" : "#f59e0b"} />
                </View>
                <Text className="text-gray-400 text-[10px] font-bold mb-1 uppercase">{item.label}</Text>
                <Text className="text-gray-900 font-bold text-sm">{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-sky-50 p-4 rounded-2xl flex-row items-center border border-sky-100 shadow-sm">
          <View className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-sm mr-4">
            <Ionicons name="bulb" size={24} color="#0EA5E9" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-sm mb-1">Fakta Nutrisi Hari Ini</Text>
            <Text className="text-gray-500 text-xs leading-relaxed">Asupan protein dan kalori telah disesuaikan dengan parameter kebutuhan gizi {kategori.toLowerCase()}.</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={qrModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-[32px] items-center w-full max-w-sm shadow-2xl">
            <View className="w-16 h-16 bg-sky-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="qr-code" size={32} color="#0EA5E9" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Kode Pengambilan</Text>
            <Text className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              Tunjukkan kode identifikasi ini kepada petugas mitra di lokasi distribusi resmi.
            </Text>
            <View className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
              {qrData ? <QRCode value={qrData} size={200} color="#111827" backgroundColor="white" /> : null}
            </View>
            <TouchableOpacity 
              onPress={() => { setQrModalVisible(false); setQrData(''); }}
              className="mt-8 bg-gray-50 border border-gray-200 w-full py-4 rounded-2xl items-center active:bg-gray-100"
            >
              <Text className="text-gray-700 font-bold text-base">Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomAlert 
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText="Tutup"
        onClose={() => setAlertVisible(false)} 
      />

      <BottomNavbar activeTab="Home" navigation={navigation} translateY={navTranslateY} />
    </SafeAreaView>
  );
}