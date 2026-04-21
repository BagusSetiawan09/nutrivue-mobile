import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * GlobalUpdater - Versi Native Alert
 * Menggunakan modal sistem untuk memastikan notifikasi update muncul 100%
 */
export default function GlobalUpdater() {
  
  useEffect(() => {
    // ⚡ PROTEKSI SDK 54: Hanya berjalan di APK/Production
    if (!__DEV__) {
      checkUpdateProcess();
    }
  }, []);

  const checkUpdateProcess = async () => {
    try {
      // 1. Cek ketersediaan update di server EAS
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        // 2. Munculkan Alert Modal langsung dari Sistem (Anti-Gagal)
        Alert.alert(
          "Pembaruan Tersedia",
          "Versi terbaru NutriVue sudah siap. Perbarui aplikasi sekarang untuk fitur terbaru dan kestabilan sistem.",
          [
            {
              text: "Nanti",
              style: "cancel"
            },
            { 
              text: "Update Sekarang", 
              onPress: () => handleDownloadAndUpdate(),
              style: "default"
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.log('[OTA] Gagal mengecek update:', error);
    }
  };

  const handleDownloadAndUpdate = async () => {
    try {
      // Munculkan notifikasi sederhana bahwa proses sedang berjalan
      if (Platform.OS === 'android') {
        // Anda bisa menambah Toast atau sekadar logging
        console.log('Sedang mengunduh update...');
      }

      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync(); // Restart aplikasi otomatis
    } catch (error) {
      Alert.alert("Gagal", "Pembaruan gagal diunduh. Periksa koneksi internet Anda.");
    }
  };

  // Komponen ini tidak merender UI apa pun (Invisible) karena menggunakan Native Alert
  return null;
}