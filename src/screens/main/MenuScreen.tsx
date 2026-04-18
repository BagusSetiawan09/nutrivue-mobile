import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, TextInput, Modal, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import BottomNavbar from '../../components/BottomNavbar';

const screenWidth = Dimensions.get('window').width;

/**
 * Komponen penyajian katalog menu gizi harian beserta analisis komposisi makronutrisi
 */
export default function MenuScreen({ navigation }: any) {
  
  /**
   * Manajemen status hari yang dipilih dan variabel input ulasan pengguna
   */
  const [selectedDay, setSelectedDay] = useState('Hari Ini');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMacro, setSelectedMacro] = useState<any>(null);

  /**
   * Konfigurasi koordinasi animasi untuk kontrol visibilitas bar navigasi bawah
   */
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const isNavbarVisible = useRef(true);

  /**
   * Prosedur eksekusi animasi kemunculan komponen navigasi utama
   */
  const showNavbar = () => {
    if (!isNavbarVisible.current) {
      Animated.timing(navTranslateY, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      isNavbarVisible.current = true;
    }
  };

  /**
   * Prosedur eksekusi animasi penyembunyian komponen navigasi utama
   */
  const hideNavbar = () => {
    if (isNavbarVisible.current) {
      Animated.timing(navTranslateY, { toValue: 150, duration: 250, useNativeDriver: true }).start();
      isNavbarVisible.current = false;
    }
  };

  /**
   * Handler peristiwa gulir untuk deteksi ambang batas dan arah pergerakan layar
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

  const days = ['Hari Ini', 'Besok', 'Lusa'];

  /**
   * Definisi palet warna standar untuk representasi visual makronutrisi
   */
  const modernColors = {
    protein: '#6366F1',
    fat: '#F43F5E',
    carbs: '#14B8A6'
  };

  /**
   * Struktur data statis katalog menu gizi berdasarkan periode waktu
   */
  const menuData: any = {
    'Hari Ini': {
      title: 'Nasi Ayam Teriyaki & Sayur',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
      description: 'Disajikan dengan nasi putih hangat, tumis brokoli wortel, dan potongan ayam saus teriyaki yang kaya protein.',
      calories: '650',
      macros: [
        { name: 'Protein', population: 32, color: modernColors.protein, description: 'Sangat penting untuk perbaikan sel dan pertumbuhan otot.' },
        { name: 'Lemak', population: 14, color: modernColors.fat, description: 'Sumber energi cadangan dan membantu penyerapan vitamin.' },
        { name: 'Karbohidrat', population: 65, color: modernColors.carbs, description: 'Sumber energi utama untuk otak dan aktivitas harian.' },
      ]
    },
    'Besok': {
      title: 'Ikan Bakar Bumbu Kuning',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1000&auto=format&fit=crop',
      description: 'Fillet ikan nila segar dengan bumbu rempah kuning alami, lalapan sayur segar, dan sambal rendah kalori.',
      calories: '580',
      macros: [
        { name: 'Protein', population: 38, color: modernColors.protein, description: 'Ikan adalah sumber protein tinggi yang sangat mudah dicerna.' },
        { name: 'Lemak', population: 12, color: modernColors.fat, description: 'Mengandung Omega-3 yang baik untuk perkembangan otak.' },
        { name: 'Karbohidrat', population: 55, color: modernColors.carbs, description: 'Karbohidrat kompleks untuk energi yang tahan lebih lama.' },
      ]
    },
    'Lusa': {
      title: 'Sapi Lada Hitam & Buah Segar',
      image: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=1000&auto=format&fit=crop',
      description: 'Daging sapi pilihan dengan saus lada hitam, nasi merah organik, dan pendamping irisan buah melon segar.',
      calories: '710',
      macros: [
        { name: 'Protein', population: 42, color: modernColors.protein, description: 'Zat besi pada daging sapi membantu mencegah anemia.' },
        { name: 'Lemak', population: 18, color: modernColors.fat, description: 'Mendukung struktur sel tubuh Anda agar tetap kuat.' },
        { name: 'Karbohidrat', population: 70, color: modernColors.carbs, description: 'Memberikan asupan glikogen yang stabil untuk belajar.' },
      ]
    }
  };

  const currentMenu = menuData[selectedDay];

  /**
   * Handler interaksi label gizi untuk menampilkan informasi edukatif modular
   */
  const handleMacroClick = (macro: any) => {
    setSelectedMacro(macro);
    setModalVisible(true);
  };

  const chartWidth = screenWidth - 100;
  const centerOffset = chartWidth / 4; 

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 px-6 pt-4" 
        contentContainerStyle={{ paddingBottom: 130 }}
        onScroll={handleScroll}
        onScrollEndDrag={showNavbar}
        onMomentumScrollEnd={showNavbar}
        scrollEventThrottle={16}
        bounces={false} 
        overScrollMode="never" 
      >
        
        {/* Kontrol navigasi kembali dan identitas halaman modul menu */}
        <View className="flex-row items-center mb-8 mt-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Jadwal Makan</Text>
        </View>

        {/* Komponen pemilihan periode hari berbasis sistem tab */}
        <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-8">
          {days.map((day) => (
            <TouchableOpacity 
              key={day}
              onPress={() => setSelectedDay(day)}
              className={`flex-1 py-3 rounded-xl items-center ${selectedDay === day ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-sm font-bold ${selectedDay === day ? 'text-primary' : 'text-gray-400'}`}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Representasi visual detail menu gizi beserta kartu informasi utama */}
        <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 mb-8">
          <View className="h-56 w-full relative bg-gray-200">
             <Image 
                source={{ uri: currentMenu.image }} 
                className="w-full h-full"
                resizeMode="cover"
             />
             <View className="absolute top-4 right-4 bg-white/95 px-3 py-1.5 rounded-full flex-row items-center shadow-md">
                <Ionicons name="flame" size={14} color="#F59E0B" />
                <Text className="font-bold text-gray-900 ml-1 text-xs">{currentMenu.calories} kkal</Text>
             </View>
          </View>

          <View className="p-6">
            <Text className="text-xl font-bold text-gray-900 mb-1">{currentMenu.title}</Text>
            <Text className="text-gray-500 text-sm leading-relaxed mb-6">
              {currentMenu.description}
            </Text>
            
            {/* Visualisasi data makronutrisi menggunakan komponen diagram lingkaran */}
            <View className="bg-gray-50 rounded-[28px] border border-gray-100 p-6 items-center">
              <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 text-center">Komposisi Makronutrisi</Text>
              
              <View className="w-full items-center justify-center">
                <PieChart
                  data={currentMenu.macros}
                  width={chartWidth} 
                  height={160}
                  chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"0"}
                  center={[centerOffset, 0]} 
                  absolute 
                  hasLegend={false}
                />
              </View>

              {/* Legenda interaktif untuk rincian kuantitas makronutrisi */}
              <View className="flex-row justify-center flex-wrap w-full mt-4 gap-2">
                {currentMenu.macros.map((item: any, index: number) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => handleMacroClick(item)}
                    className="flex-row items-center bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100 active:bg-gray-100"
                  >
                    <View style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full mr-1.5" />
                    <Text className="text-[10px] font-bold text-gray-400 uppercase mr-1">{item.name}</Text>
                    <Text style={{ color: item.color }} className="text-[11px] font-black">{item.population}g</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text className="text-[10px] text-gray-400 mt-5 text-center italic">*Ketuk label gizi untuk detail manfaat</Text>
            </View>
          </View>
        </View>

        {/* Modul umpan balik pengguna untuk evaluasi kualitas penyajian gizi */}
        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-2">Ulasan NutriVue</Text>
          <Text className="text-gray-400 text-xs mb-6">Penilaian Anda membantu kami meningkatkan standar kualitas penyajian hidangan.</Text>

          {/* Kontrol input penilaian berbasis representasi visual bintang */}
          <View className="flex-row mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} className="mr-3">
                <Ionicons 
                  name={rating >= star ? "star" : "star-outline"} 
                  size={32} 
                  color={rating >= star ? "#F59E0B" : "#D1D5DB"} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            multiline
            numberOfLines={4}
            placeholder="Bagikan pengalaman rasa Anda hari ini..."
            value={review}
            onChangeText={setReview}
            className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-700 text-sm mb-6 h-28"
            textAlignVertical="top"
          />

          <TouchableOpacity className="bg-primary w-full py-4 rounded-2xl items-center shadow-sm active:bg-sky-700">
            <Text className="text-white font-bold text-base">Kirim Ulasan</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Komponen navigasi bawah dengan dukungan parameter transformasi animasi */}
      <BottomNavbar activeTab="Menu" navigation={navigation} translateY={navTranslateY} />

      {/* Komponen modalitas untuk penyajian informasi edukasi gizi mendalam */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          {selectedMacro && (
            <View className="bg-white p-8 rounded-[32px] w-full max-w-sm shadow-2xl items-center relative overflow-hidden">
              
              <View style={{ backgroundColor: selectedMacro.color }} className="absolute top-0 left-0 right-0 h-16 opacity-10" />

              <View style={{ backgroundColor: selectedMacro.color }} className="w-16 h-16 rounded-full items-center justify-center mb-4 mt-2 shadow-sm">
                <Ionicons 
                  name={selectedMacro.name === 'Protein' ? 'fitness' : selectedMacro.name === 'Lemak' ? 'water' : 'leaf'} 
                  size={32} color="white" 
                />
              </View>

              <Text className="text-2xl font-bold text-gray-900 mb-1">{selectedMacro.name}</Text>
              <Text style={{ color: selectedMacro.color }} className="text-xl font-black mb-4">{selectedMacro.population} Gram</Text>
              
              <Text className="text-sm text-gray-500 text-center leading-relaxed mb-8 px-2">
                {selectedMacro.description}
              </Text>

              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="bg-gray-900 w-full py-4 rounded-2xl items-center active:bg-gray-800"
              >
                <Text className="text-white font-bold text-base">Mengerti</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}