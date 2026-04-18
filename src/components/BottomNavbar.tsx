import React from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Definisi tipe data untuk properti komponen navigasi bawah
 */
interface BottomNavbarProps {
  activeTab: string;
  navigation: any;
  translateY?: Animated.Value | number;
}

/**
 * Komponen navigasi utama aplikasi dengan dukungan animasi transisi
 */
const BottomNavbar = ({ activeTab, navigation, translateY = 0 }: BottomNavbarProps) => {
  
  /**
   * Konfigurasi daftar menu navigasi beserta ikon dan label
   */
  const tabs = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'Beranda' },
    { name: 'History', icon: 'time-outline', activeIcon: 'time', label: 'Riwayat' },
    { name: 'Menu', icon: 'restaurant-outline', activeIcon: 'restaurant', label: 'Menu', isCenter: true },
    { name: 'Statistik', icon: 'stats-chart-outline', activeIcon: 'stats-chart', label: 'Nutrisi' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', label: 'Profil' },
  ];

  return (
    /**
     * Kontainer utama navigasi dengan posisi absolut dan dukungan animasi gerak
     */
    <Animated.View 
      style={{ transform: [{ translateY }] }}
      className="absolute bottom-6 left-6 right-6 bg-white/95 h-20 rounded-[30px] flex-row items-center justify-around px-2 shadow-xl border border-gray-100"
    >
      {tabs.map((tab) => {
        /**
         * Logika pemeriksaan status aktif pada setiap menu
         */
        const isActive = activeTab === tab.name;

        /**
         * Render khusus untuk tombol pusat navigasi dengan posisi menonjol
         */
        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              className="bg-primary -mt-12 w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-primary/40 border-4 border-gray-50"
            >
              <Ionicons name={tab.activeIcon as any} size={28} color="white" />
            </TouchableOpacity>
          );
        }

        /**
         * Render untuk tombol menu navigasi standar
         */
        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            className="items-center justify-center flex-1 py-2"
          >
            <Ionicons
              name={(isActive ? tab.activeIcon : tab.icon) as any}
              size={24}
              color={isActive ? '#0EA5E9' : '#9CA3AF'}
            />
            <Text className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : 'text-gray-400'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

export default BottomNavbar;