import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GlobalUpdater() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // ⚡ PROTEKSI SDK 54: Jangan jalankan radar jika sedang di Expo Go / Mode Dev
    // Radar HANYA akan menyala saat aplikasi sudah jadi APK
    if (!__DEV__) {
      checkUpdate();
    }
  }, []);

  const checkUpdate = async () => {
    try {
      // 1. Ketuk pintu server EAS
      const update = await Updates.checkForUpdateAsync();
      
      // 2. Jika ada versi baru, munculkan banner
      if (update.isAvailable) {
        setIsUpdateAvailable(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12
        }).start();
      }
    } catch (error) {
      console.log('Radar gagal terhubung ke server:', error);
    }
  };

  const handleUpdate = async () => {
    setIsDownloading(true);
    try {
      // 3. Tarik file update dari server
      await Updates.fetchUpdateAsync();
      // 4. Restart aplikasi untuk menerapkan perubahan
      await Updates.reloadAsync(); 
    } catch (error) {
      setIsDownloading(false);
      alert('Gagal mengunduh pembaruan. Pastikan internet Anda stabil.');
    }
  };

  // Sembunyikan banner jika tidak ada update
  if (!isUpdateAvailable) return null;

  return (
    <Animated.View 
      style={{ 
        transform: [{ translateY: slideAnim }],
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, elevation: 10,
        paddingTop: insets.top + 10,
      }}
      className="px-4"
    >
      <View className="bg-gray-900 rounded-3xl p-5 shadow-2xl shadow-black/50 border border-gray-700 flex-row items-center">
        <View className="w-12 h-12 bg-sky-500/20 rounded-full items-center justify-center mr-4">
          <Ionicons name="cloud-download" size={24} color="#0EA5E9" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-base mb-1">Pembaruan Sistem</Text>
          <Text className="text-gray-400 text-[11px] leading-relaxed">
            Versi terbaru NutriVue tersedia. Wajib diperbarui agar sistem berjalan sinkron.
          </Text>
        </View>
        <TouchableOpacity 
          onPress={handleUpdate} disabled={isDownloading}
          className={`${isDownloading ? 'bg-sky-700' : 'bg-primary'} ml-3 px-4 py-3 rounded-xl items-center justify-center`}
        >
          {isDownloading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold text-xs">Update</Text>}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}