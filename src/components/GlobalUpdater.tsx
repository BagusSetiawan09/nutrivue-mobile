import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';

export default function GlobalUpdater() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // ⚡ PROTEKSI SDK 54: Hanya berjalan di APK/Production
    if (!__DEV__) {
      checkUpdateProcess();
    }
    
    // ⚠️ TIPS DESAIN LOKAL: 
    // Kalau Komandan mau mengedit desain ini di Expo Go, 
    // matikan if (!__DEV__) di atas, dan langsung setIsUpdateAvailable(true); di sini.
  }, []);

  const checkUpdateProcess = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setIsUpdateAvailable(true); // Memicu Modal Premium Muncul
      }
    } catch (error) {
      console.log('[OTA] Gagal mengecek update:', error);
    }
  };

  const handleDownloadAndUpdate = async () => {
    setIsDownloading(true);
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync(); // Restart aplikasi otomatis
    } catch (error) {
      setIsDownloading(false);
      alert("Gagal mengunduh pembaruan. Periksa internet Anda.");
      setIsUpdateAvailable(false);
    }
  };

  return (
    <Modal
      visible={isUpdateAvailable}
      transparent={true}
      animationType="fade" // Muncul dengan animasi transisi memudar yang elegan
      onRequestClose={() => {}} // Mencegah modal ditutup dengan tombol back Android
    >
      {/* 🌑 Latar Belakang Gelap (Overlay) */}
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        
        {/* 💳 Kartu Premium */}
        <View className="bg-white w-full rounded-[32px] p-8 items-center shadow-2xl elevation-10">
          
          {/* Ikon Header dengan Glow */}
          <View className="w-20 h-20 bg-sky-50 rounded-full items-center justify-center mb-5 border-[6px] border-white shadow-sm shadow-sky-100">
            <Ionicons name="rocket" size={36} color="#0EA5E9" />
          </View>

          {/* Teks Konten */}
          <Text className="text-2xl font-black text-gray-900 mb-3 text-center tracking-tight">
            Pembaruan Sistem
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-8 leading-relaxed px-2">
            Versi terbaru <Text className="font-bold text-primary">NutriVue</Text> sudah siap! Perbarui sekarang untuk menikmati fitur baru dan performa yang lebih maksimal.
          </Text>

          {/* Tombol Aksi */}
          <View className="w-full space-y-3">
            <TouchableOpacity
              onPress={handleDownloadAndUpdate}
              disabled={isDownloading}
              className={`${isDownloading ? 'bg-sky-700' : 'bg-primary'} w-full py-4 rounded-2xl items-center justify-center shadow-lg shadow-sky-200`}
            >
              {isDownloading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-bold text-base ml-2 tracking-wide">Mengunduh...</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-base tracking-wide">Update Sekarang</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsUpdateAvailable(false)}
              disabled={isDownloading}
              className="w-full py-4 rounded-2xl items-center justify-center bg-gray-50 border border-gray-100"
            >
              <Text className="text-gray-500 font-bold text-sm tracking-wide">Nanti Saja</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}