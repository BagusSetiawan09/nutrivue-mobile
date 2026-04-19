import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator, Dimensions } from 'react-native';
import * as Updates from 'expo-updates';
import { useUpdates } from 'expo-updates'; // ⚡ INI RADAR PRODUCTION TERBARU EXPO
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GlobalUpdater() {
  // Radar ini akan mendengarkan status update langsung dari mesin inti EAS di Production
  const { isUpdateAvailable, isUpdatePending } = useUpdates();
  
  const [isDownloading, setIsDownloading] = useState(false);
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const insets = useSafeAreaInsets();

  // Banner muncul jika: (1) Ada update baru di server, ATAU (2) Update sudah selesai di-download background tapi belum di-restart
  const shouldShowBanner = isUpdateAvailable || isUpdatePending;

  useEffect(() => {
    if (shouldShowBanner) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
        speed: 12
      }).start();
    }
  }, [shouldShowBanner]);

  const handleUpdate = async () => {
    setIsDownloading(true);
    try {
      // Jika update baru tersedia, paksa download
      if (isUpdateAvailable) {
        await Updates.fetchUpdateAsync();
      }
      // Jika sudah terdownload (pending) atau baru siap di-download, reload aplikasinya!
      await Updates.reloadAsync();
    } catch (error) {
      setIsDownloading(false);
      console.log('Gagal memperbarui:', error);
      alert('Gagal mengunduh pembaruan. Pastikan internet Anda stabil.');
    }
  };

  if (!shouldShowBanner) return null;

  return (
    <Animated.View 
      style={{ 
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 10,
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
            {isUpdatePending 
              ? 'Pembaruan telah siap. Mulai ulang aplikasi sekarang.' 
              : 'Versi terbaru tersedia. Wajib diperbarui untuk melanjutkan.'}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleUpdate}
          disabled={isDownloading}
          className={`${isDownloading ? 'bg-sky-700' : 'bg-primary'} ml-3 px-4 py-3 rounded-xl items-center justify-center`}
        >
          {isDownloading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-bold text-xs">Update</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}