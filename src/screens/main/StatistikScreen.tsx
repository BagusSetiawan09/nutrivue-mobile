import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, Easing, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import BottomNavbar from '../../components/BottomNavbar';
import api from '../../config/api';

const screenWidth = Dimensions.get('window').width;

export default function StatistikScreen({ navigation }: any) {
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const isNavbarVisible = useRef(true);
  const chartWidthAnim = useRef(new Animated.Value(0)).current;

  // ⚡ STATE DINAMIS UNTUK DATA API
  const [isLoading, setIsLoading] = useState(true);
  const [statistik, setStatistik] = useState({
    avgKalori: 0,
    avgProtein: 0,
    avgLemak: 0,
    chartData: [0, 0, 0, 0, 0, 0, 0], // Data 7 hari (Sen-Min)
    progressData: [
      { name: 'Protein', target: 0, color: 'bg-sky-500', icon: 'fitness' },
      { name: 'Karbohidrat', target: 0, color: 'bg-emerald-500', icon: 'leaf' },
      { name: 'Lemak', target: 0, color: 'bg-amber-500', icon: 'water' }
    ]
  });

  const progressAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate()); 

  useEffect(() => {
    fetchStatistikData();
  }, []);

  // ⚡ Memicu animasi SETELAH data berhasil ditarik
  useEffect(() => {
    if (!isLoading) {
      Animated.timing(chartWidthAnim, {
        toValue: screenWidth - 80,
        duration: 1500, 
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, 
      }).start();

      Animated.stagger(200, 
        progressAnims.map((anim, index) => 
          Animated.timing(anim, {
            toValue: statistik.progressData[index].target,
            duration: 1200,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
          })
        )
      ).start();
    }
  }, [isLoading, statistik]);

  const fetchStatistikData = async () => {
    try {
      setIsLoading(true);
      // Menembak ke API Laravel untuk mengambil ringkasan statistik
      const response = await api.get('/meal/statistics');
      
      if (response.data.status === 'success') {
        setStatistik({
          avgKalori: response.data.data.avg_kalori,
          avgProtein: response.data.data.avg_protein,
          avgLemak: response.data.data.avg_lemak,
          chartData: response.data.data.chart_mingguan,
          progressData: [
            { name: 'Protein', target: response.data.data.progress.protein, color: 'bg-sky-500', icon: 'fitness' },
            { name: 'Karbohidrat', target: response.data.data.progress.karbohidrat, color: 'bg-emerald-500', icon: 'leaf' },
            { name: 'Lemak', target: response.data.data.progress.lemak, color: 'bg-amber-500', icon: 'water' }
          ]
        });
      }
    } catch (error) {
      console.log('Gagal menarik data statistik:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const chartData = {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [{
      data: statistik.chartData,
      color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
      strokeWidth: 4
    }],
  };

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

  const renderCalendarDays = () => {
    const emptySlots = 2; 
    const daysInMonth = 30; 
    let daysArray = [];

    for (let i = 0; i < emptySlots; i++) {
      daysArray.push(<View key={`empty-${i}`} className="w-[14.28%] aspect-square" />);
    }

    const today = new Date().getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = selectedDate === i;
      const isToday = i === today; 
      
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

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text className="text-gray-400 mt-4 font-medium">Memuat Analisis Sistem...</Text>
        </View>
      ) : (
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
          <View className="flex-row justify-between mb-8 mt-2">
              {[
                { label: 'Avg. Kalori', value: statistik.avgKalori, unit: 'kcal', color: 'bg-sky-500' },
                { label: 'Avg. Protein', value: statistik.avgProtein, unit: 'g', color: 'bg-emerald-500' },
                { label: 'Avg. Lemak', value: statistik.avgLemak, unit: 'g', color: 'bg-amber-500' }
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

          <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8 overflow-hidden">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-gray-900">Tren Kalori</Text>
              <View className="bg-sky-50 px-3 py-1 rounded-full">
                <Text className="text-primary text-[10px] font-bold">Minggu Ini</Text>
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

          <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-6">Pencapaian Target Gizi</Text>
            
            {statistik.progressData.map((item, i) => {
              const widthInterpolation = progressAnims[i].interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp'
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

          <View className="bg-sky-50 p-5 rounded-[28px] flex-row items-center border border-sky-100 mb-4">
            <View className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-sm mr-4">
              <Ionicons name="analytics" size={24} color="#0EA5E9" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-sm mb-1">Analisis Sistem NutriVue</Text>
              <Text className="text-gray-500 text-xs leading-relaxed">
                Asupan gizi Anda terpantau stabil. Sistem merekomendasikan untuk terus mempertahankan rutinitas pengambilan menu harian.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      <BottomNavbar activeTab="Statistik" navigation={navigation} translateY={navTranslateY} />

      <Modal visible={calendarVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white p-6 rounded-[32px] w-full max-w-md shadow-2xl">
            <View className="flex-row justify-between items-center mb-6 px-2">
              <TouchableOpacity className="w-8 h-8 items-center justify-center bg-gray-50 rounded-full">
                <Ionicons name="chevron-back" size={18} color="#4B5563" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-gray-900">April 2026</Text>
              <TouchableOpacity className="w-8 h-8 items-center justify-center bg-gray-50 rounded-full">
                <Ionicons name="chevron-forward" size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View className="flex-row w-full mb-2">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => (
                <Text key={i} className="text-[11px] font-bold text-gray-400 w-[14.28%] text-center">
                  {day}
                </Text>
              ))}
            </View>

            <View className="flex-row flex-wrap w-full mb-6">
              {renderCalendarDays()}
            </View>

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