import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ⚡ IMPORT SENJATA RADAR EXPO
import * as Location from 'expo-location';

const ToggleRow = ({ icon, title, subtitle, color, value, onValueChange, isLast }: any) => (
  <View className={`flex-row items-center py-4 ${!isLast ? 'border-b border-gray-50' : ''}`}>
    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 bg-${color}-50`}>
      <Ionicons name={icon} size={20} color={`#${color === 'sky' ? '0EA5E9' : color === 'rose' ? 'F43F5E' : color === 'emerald' ? '10B981' : color === 'amber' ? 'F59E0B' : '64748B'}`} />
    </View>
    <View className="flex-1 pr-4">
      <Text className="text-gray-900 font-bold text-sm mb-0.5">{title}</Text>
      <Text className="text-gray-400 text-[10px] leading-relaxed">{subtitle}</Text>
    </View>
    <Switch 
      trackColor={{ false: "#E2E8F0", true: "#BAE6FD" }}
      thumbColor={value ? "#0EA5E9" : "#F8FAFC"}
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

const ActionRow = ({ icon, title, subtitle, color, isLast, onPress }: any) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} className={`flex-row items-center py-4 ${!isLast ? 'border-b border-gray-50' : ''}`}>
    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 bg-${color}-50`}>
      <Ionicons name={icon} size={20} color={`#${color === 'sky' ? '0EA5E9' : color === 'rose' ? 'F43F5E' : color === 'emerald' ? '10B981' : color === 'amber' ? 'F59E0B' : '64748B'}`} />
    </View>
    <View className="flex-1">
      <Text className="text-gray-900 font-bold text-sm mb-0.5">{title}</Text>
      <Text className="text-gray-400 text-[10px] leading-relaxed">{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
  </TouchableOpacity>
);

export default function SecurityScreen({ navigation }: any) {
  
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(true);
  const [medicalVisibility, setMedicalVisibility] = useState(true);
  
  // ⚡ STATE LOKASI
  const [locationTracking, setLocationTracking] = useState(true);
  const [cityName, setCityName] = useState('Mendeteksi...');
  const [isLocating, setIsLocating] = useState(false);

  // ⚡ EFEK RADAR: Berjalan setiap kali toggle Lokasi dinyalakan/dimatikan
  useEffect(() => {
    (async () => {
      if (locationTracking) {
        setIsLocating(true);
        setCityName('Mencari satelit...');
        
        // 1. Minta Izin GPS ke HP Pengguna
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCityName('Akses Ditolak');
          setLocationTracking(false); // Matikan toggle jika ditolak
          setIsLocating(false);
          return;
        }

        try {
          // 2. Ambil Koordinat saat ini
          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          
          // 3. Ubah Koordinat jadi Nama Kota (Reverse Geocoding)
          let geocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });

          if (geocode.length > 0) {
            // Ambil nama kota atau sub-region
            const city = geocode[0].city || geocode[0].subregion || 'Lokasi Ditemukan';
            setCityName(city);
          } else {
            setCityName('Lokasi Tidak Dikenal');
          }
        } catch (error) {
          setCityName('Gagal Melacak');
        } finally {
          setIsLocating(false);
        }
      } else {
        // Jika toggle dimatikan
        setCityName('Pelacakan Nonaktif');
      }
    })();
  }, [locationTracking]); // Akan dipicu ulang jika locationTracking berubah

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      <View className="flex-row items-center mb-4 mt-4 px-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50">
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-gray-900">Privasi Keamanan</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Kelola perlindungan data dan akses akun</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-2" contentContainerStyle={{ paddingBottom: 40 }} bounces={false}>
        
        <View className="bg-emerald-50 p-5 rounded-2xl flex-row items-center border border-emerald-100 mb-8 shadow-sm">
          <View className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-sm mr-4">
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-emerald-900 font-bold text-sm mb-1">Enkripsi Data Aktif</Text>
            <Text className="text-emerald-700 text-xs leading-relaxed">Seluruh informasi medis dan kredensial Anda dilindungi menggunakan standar enkripsi mutakhir</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Metode Akses</Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <ActionRow icon="key" title="Ubah Kata Sandi" subtitle="Perbarui kata sandi secara berkala" color="sky" onPress={() => {}} />
          <ToggleRow icon="finger-print" title="Autentikasi Biometrik" subtitle="Gunakan sidik jari atau pemindai wajah" color="emerald" value={biometricEnabled} onValueChange={setBiometricEnabled} />
          <ToggleRow icon="keypad" title="Kunci Aplikasi PIN" subtitle="Minta PIN setiap membuka aplikasi" color="amber" value={pinEnabled} onValueChange={setPinEnabled} isLast={true} />
        </View>

        <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Kontrol Privasi</Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <ToggleRow icon="medical" title="Visibilitas Data Medis" subtitle="Izinkan mitra melihat pantangan alergi Anda" color="rose" value={medicalVisibility} onValueChange={setMedicalVisibility} />
          <ToggleRow icon="location" title="Pelacakan Lokasi Distribusi" subtitle="Simpan riwayat lokasi pengambilan gizi" color="sky" value={locationTracking} onValueChange={setLocationTracking} isLast={true} />
        </View>

        {/* Manajemen sesi perangkat keras yang terhubung ke sistem */}
        <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Perangkat Tertaut</Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          
          {/* ⚡ FIX LAYOUT: Penambahan flex-1 pada bagian kiri dan pembatasan lebar pada bagian kanan */}
          <View className="flex-row items-center justify-between border-b border-gray-50 pb-4 mb-4">
            
            {/* Bagian Kiri (Ikon & Nama Perangkat) */}
            <View className="flex-row items-center flex-1 pr-4">
              <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-3 shrink-0">
                <Ionicons name="phone-portrait" size={20} color="#64748B" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>Ponsel Pintar Pengguna</Text>
                <Text className="text-emerald-500 font-bold text-[10px] mt-0.5" numberOfLines={1}>Sedang Digunakan Saat Ini</Text>
              </View>
            </View>
            
            {/* ⚡ Bagian Kanan (Lokasi Dinamis) - Diberi batasan maksimal 40% dari layar */}
            <View className="items-end justify-center max-w-[40%]">
              {isLocating ? (
                <ActivityIndicator size="small" color="#0EA5E9" />
              ) : (
                <Text 
                  className={`text-[11px] text-right font-bold ${locationTracking ? 'text-sky-600' : 'text-gray-400'}`}
                  numberOfLines={2} 
                >
                  {cityName}
                </Text>
              )}
            </View>

          </View>
          
          <TouchableOpacity className="flex-row items-center justify-center py-2 active:bg-gray-50 rounded-xl">
            <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text className="text-red-500 font-bold text-sm">Keluar dari Semua Perangkat</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}