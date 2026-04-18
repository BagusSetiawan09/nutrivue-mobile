import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import BottomNavbar from '../../components/BottomNavbar';

const screenWidth = Dimensions.get('window').width;

/**
 * Komponen penyajian analisis statistik gizi dan pelacakan target kesehatan
 */
export default function StatistikScreen({ navigation }: any) {
  
  /**
   * Referensi variabel animasi untuk visibilitas komponen navigasi
   */
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const isNavbarVisible = useRef(true);

  /**
   * Referensi variabel animasi perentangan untuk visualisasi grafik garis
   */
  const chartWidthAnim = useRef(new Animated.Value(0)).current;
  
  /**
   * Konfigurasi data statis untuk pelacakan metrik target makronutrisi
   */
  const progressData = [
    { name: 'Protein', target: 85, color: 'bg-sky-500', icon: 'fitness' },
    { name: 'Kalsium', target: 60, color: 'bg-emerald-500', icon: 'leaf' },
    { name: 'Serat', target: 40, color: 'bg-rose-500', icon: 'nutrition' }
  ];

  /**
   * Inisialisasi daftar referensi animasi independen untuk setiap indikator pencapaian
   */
  const progressAnims = useRef(progressData.map(() => new Animated.Value(0))).current;

  /**
   * Status lokal untuk manajemen visibilitas dialog kalender dan pemilihan tanggal
   */
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(18); 

  useEffect(() => {
    /**
     * Prosedur eksekusi animasi perentangan lebar pada grafik utama
     */
    Animated.timing(chartWidthAnim, {
      toValue: screenWidth - 80,
      duration: 1500, 
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, 
    }).start();

    /**
     * Prosedur eksekusi animasi pergerakan progres secara sekuensial
     */
    Animated.stagger(200, 
      progressAnims.map((anim, index) => 
        Animated.timing(anim, {
          toValue: progressData[index].target,
          duration: 1200,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        })
      )
    ).start();
  }, []);

  /**
   * Prosedur pemicu animasi transisi vertikal untuk menampilkan bilah navigasi
   */
  const showNavbar = () => {
    if (!isNavbarVisible.current) {
      Animated.timing(navTranslateY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      isNavbarVisible.current = true;
    }
  };

  /**
   * Prosedur pemicu animasi transisi vertikal untuk menyembunyikan bilah navigasi
   */
  const hideNavbar = () => {
    if (isNavbarVisible.current) {
      Animated.timing(navTranslateY, { toValue: 150, duration: 250, useNativeDriver: true }).start();
      isNavbarVisible.current = false;
    }
  };

  /**
   * Handler peristiwa gulir untuk deteksi ambang batas dan penyesuaian tata letak
   */
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

  /**
   * Struktur data dasar untuk pemetaan visualisasi grafik tren kalori mingguan
   */
  const chartData = {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [{
      data: [1800, 2100, 1950, 2400, 2200, 1700, 2050],
      color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
      strokeWidth: 4
    }],
  };

  /**
   * Konfigurasi parameter visual dan gaya untuk komponen grafik
   */
  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "3", stroke: "#ffffff" },
    propsForBackgroundLines: { strokeDasharray: "", stroke: "#f1f5f9" }
  };

  /**
   * Prosedur modular penyusunan tata letak matriks tanggal kalender
   */
  const renderCalendarDays = () => {
    const emptySlots = 2; 
    const daysInMonth = 30; 
    let daysArray = [];

    for (let i = 0; i < emptySlots; i++) {
      daysArray.push(<View key={`empty-${i}`} className="w-[14.28%] aspect-square" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = selectedDate === i;
      const isToday = i === 18; 
      
      daysArray.push(
        <TouchableOpacity 
          key={`day-${i}`} 
          onPress={() => setSelectedDate(i)}
          className="w-[14.28%] aspect-square items-center justify-center p-1"
        >
          <View className={`w-full h-full items-center justify-center rounded-full ${isSelected ? 'bg-primary shadow-sm' : isToday ? 'bg-sky-50' : ''}`}>
            <Text className={`text-sm font-medium ${isSelected ? 'text-white font-bold' : isToday ? 'text-primary font-bold' : 'text-gray-700'}`}>
              {i}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return daysArray;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* Struktur utama bagian tajuk dengan tombol akses filter periode */}
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Analisis Gizi</Text>
          <Text className="text-sm text-gray-500">Laporan mingguan asupan nutrisi</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setCalendarVisible(true)}
          className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50"
        >
          <Ionicons name="calendar" size={20} color="#0EA5E9" />
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
        
        {/* Visualisasi data statistik makro kuantitatif tingkat tinggi */}
        <View className="flex-row justify-between mb-8 mt-2">
            {[
              { label: 'Avg. Kalori', value: '2.050', unit: 'kcal', color: 'bg-sky-500' },
              { label: 'Avg. Protein', value: '75.4', unit: 'g', color: 'bg-emerald-500' },
              { label: 'Avg. Lemak', value: '42.1', unit: 'g', color: 'bg-amber-500' }
            ].map((stat, i) => (
              <View key={i} className="bg-white p-4 rounded-[24px] w-[31%] shadow-sm border border-gray-50">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">{stat.label}</Text>
                <View className="flex-row items-end">
                  <Text className="text-gray-900 font-bold text-base">{stat.value}</Text>
                  <Text className="text-gray-400 text-[8px] mb-1 ml-0.5">{stat.unit}</Text>
                </View>
                <View className={`h-1 w-8 rounded-full mt-2 ${stat.color}`} />
              </View>
            ))}
        </View>

        {/* Kontainer grafik utama dengan dukungan penyajian pergerakan transisi */}
        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-bold text-gray-900">Tren Kalori</Text>
            <View className="bg-sky-50 px-3 py-1 rounded-full">
              <Text className="text-primary text-[10px] font-bold">+12% vs Minggu Lalu</Text>
            </View>
          </View>
          
          <Animated.View style={{ width: chartWidthAnim, overflow: 'hidden' }}>
            <View style={{ width: screenWidth - 80 }}>
              <LineChart
                data={chartData}
                width={screenWidth - 80}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{ marginLeft: -15, borderRadius: 16 }}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
              />
            </View>
          </Animated.View>
        </View>

        {/* Pemetaan visualisasi metrik pemenuhan target nutrisi berbasis batang */}
        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-6">Pencapaian Target Gizi</Text>
          
          {progressData.map((item, i) => {
            /** Formulasi pemetaan persentase terhadap dimensi spasial indikator */
            const widthInterpolation = progressAnims[i].interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            });

            return (
              <View key={i} className="mb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name={item.icon as any} size={16} color="#64748b" />
                    <Text className="text-gray-600 font-bold text-sm ml-2">{item.name}</Text>
                  </View>
                  <Text className="text-gray-900 font-bold text-sm">{item.target}%</Text>
                </View>
                <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <Animated.View 
                    style={{ width: widthInterpolation }} 
                    className={`h-full rounded-full ${item.color}`} 
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Panel edukasi evaluatif berbasis kompilasi data analitik gizi */}
        <View className="bg-sky-50 p-5 rounded-[28px] flex-row items-center border border-sky-100 mb-4">
          <View className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-sm mr-4">
            <Ionicons name="analytics" size={24} color="#0EA5E9" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-sm mb-1">Analisis Sistem NutriVue</Text>
            <Text className="text-gray-500 text-xs leading-relaxed">
              Asupan protein Anda sangat stabil minggu ini. Pertahankan konsumsi sayuran hijau untuk meningkatkan kadar serat Anda.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Komponen pengendali antarmuka navigasi lintas modul */}
      <BottomNavbar activeTab="Statistik" navigation={navigation} translateY={navTranslateY} />

      {/* Tampilan antarmuka hamparan kalender tingkat lanjut untuk penyaringan temporal */}
      <Modal visible={calendarVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white p-6 rounded-[32px] w-full max-w-md shadow-2xl">
            
            {/* Bagian kontrol temporal bulan dan tahun pada antarmuka kalender */}
            <View className="flex-row justify-between items-center mb-6 px-2">
              <TouchableOpacity className="w-8 h-8 items-center justify-center bg-gray-50 rounded-full">
                <Ionicons name="chevron-back" size={18} color="#4B5563" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-gray-900">April 2026</Text>
              <TouchableOpacity className="w-8 h-8 items-center justify-center bg-gray-50 rounded-full">
                <Ionicons name="chevron-forward" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Penyajian referensi hari format singkat pada tatanan matriks kalender */}
            <View className="flex-row w-full mb-2">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => (
                <Text key={i} className="text-[11px] font-bold text-gray-400 w-[14.28%] text-center">
                  {day}
                </Text>
              ))}
            </View>

            {/* Injeksi fungsional penyusunan susunan identitas tanggal matriks temporal */}
            <View className="flex-row flex-wrap w-full mb-6">
              {renderCalendarDays()}
            </View>

            {/* Pemicu tindakan utama aplikasi rentang tanggal analisis */}
            <TouchableOpacity 
              onPress={() => setCalendarVisible(false)}
              className="bg-primary w-full py-4 rounded-2xl items-center active:bg-sky-700 shadow-sm"
            >
              <Text className="text-white font-bold text-base">Terapkan Tanggal</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}