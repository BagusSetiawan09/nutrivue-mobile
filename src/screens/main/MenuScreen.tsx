import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, TextInput, Modal, Image, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';

import BottomNavbar from '../../components/BottomNavbar';
import api from '../../config/api';
import CustomAlert from '../../components/CustomAlert';

const screenWidth = Dimensions.get('window').width;

export default function MenuScreen({ navigation }: any) {
  
  const [selectedDay, setSelectedDay] = useState('Hari Ini');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  
  const [menuData, setMenuData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMacro, setSelectedMacro] = useState<any>(null);
  
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const navTranslateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const isNavbarVisible = useRef(true);

  useEffect(() => {
    fetchMenuSchedule();
  }, []);

  const fetchMenuSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/meal/schedule');
      
      if (response.data.status === 'success') {
        setMenuData(response.data.data || {});
      }
    } catch (error) {
      console.log('Gagal menarik jadwal menu:', error);
      setMenuData({});
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async () => {
    if (rating === 0) {
      setAlertMessage('Silakan berikan penilaian bintang terlebih dahulu.');
      setAlertVisible(true);
      return;
    }
    
    setAlertMessage('Terima kasih! Ulasan Anda telah berhasil dikirim ke server.');
    setAlertVisible(true);
    setRating(0);
    setReview('');
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

  const days = ['Hari Ini', 'Besok', 'Lusa'];

  const currentMenu = (menuData && typeof menuData === 'object') ? menuData[selectedDay] : null;

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
        
        <View className="flex-row items-center mb-8 mt-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Jadwal Makan</Text>
        </View>

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

        {isLoading ? (
          <View className="items-center justify-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text className="text-gray-400 mt-4 font-medium">Sinkronisasi jadwal menu...</Text>
          </View>
        ) : !currentMenu ? (
          <View className="items-center justify-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm border-dashed">
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 font-medium text-center px-4">Jadwal menu untuk {selectedDay} belum tersedia</Text>
          </View>
        ) : (
          <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 mb-8">
            <View className="h-56 w-full relative bg-gray-200">
               <Image 
                 source={{ uri: currentMenu.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop' }} 
                 className="w-full h-full"
                 resizeMode="cover"
               />
               <View className="absolute top-4 right-4 bg-white/95 px-3 py-1.5 rounded-full flex-row items-center shadow-md">
                  <Ionicons name="flame" size={14} color="#F59E0B" />
                  <Text className="font-bold text-gray-900 ml-1 text-xs">{currentMenu.calories || 0} kkal</Text>
               </View>
            </View>

            <View className="p-6">
              <Text className="text-xl font-bold text-gray-900 mb-1">{currentMenu.title || 'Menu Gizi'}</Text>
              <Text className="text-gray-500 text-sm leading-relaxed mb-6">
                {currentMenu.description || 'Deskripsi menu belum diisi oleh Admin.'}
              </Text>
              
              <View className="bg-gray-50 rounded-[28px] border border-gray-100 p-6 items-center">
                <Text className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 text-center">Komposisi Makronutrisi</Text>
                
                {currentMenu.macros && currentMenu.macros.length > 0 ? (
                  <>
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
                  </>
                ) : (
                  <Text className="text-gray-400 text-xs py-4">Data makronutrisi belum diatur</Text>
                )}
              </View>
            </View>
          </View>
        )}

        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mt-8">
          <Text className="text-lg font-bold text-gray-900 mb-2">Ulasan NutriVue</Text>
          <Text className="text-gray-400 text-xs mb-6">Penilaian Anda membantu kami meningkatkan standar kualitas penyajian hidangan.</Text>

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

          <TouchableOpacity onPress={submitReview} className="bg-primary w-full py-4 rounded-2xl items-center shadow-sm active:bg-sky-700">
            <Text className="text-white font-bold text-base">Kirim Ulasan</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <BottomNavbar activeTab="Menu" navigation={navigation} translateY={navTranslateY} />

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

      <CustomAlert 
        visible={alertVisible}
        type="success"
        title="Ulasan Diterima"
        message={alertMessage}
        confirmText="Tutup"
        onClose={() => setAlertVisible(false)} 
        onConfirm={() => setAlertVisible(false)}
      />

    </SafeAreaView>
  );
}