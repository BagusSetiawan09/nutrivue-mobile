import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import * as Location from 'expo-location';
import * as Device from 'expo-device';
// ⚡ IMPORT SENJATA BIOMETRIK
import * as LocalAuthentication from 'expo-local-authentication';

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
  
  // Biometrik kita matikan dulu di awal agar bisa dites menyalakannya
  const [biometricEnabled, setBiometricEnabled] = useState(false); 
  const [pinEnabled, setPinEnabled] = useState(true);
  const [medicalVisibility, setMedicalVisibility] = useState(true);
  
  const [locationTracking, setLocationTracking] = useState(true);
  const [cityName, setCityName] = useState('Mendeteksi...');
  const [isLocating, setIsLocating] = useState(false);

  const [deviceName, setDeviceName] = useState('Mendeteksi Perangkat...');

  // ⚡ LOGIKA NAMA PERANGKAT (FASE 1)
  useEffect(() => {
    const brand = Device.brand ? Device.brand.toUpperCase() : '';
    const model = Device.modelName || 'PONSEL PINTAR';
    if (Platform.OS === 'ios') {
      setDeviceName(model);
    } else {
      setDeviceName(brand ? `${brand} ${model}` : model);
    }
  }, []);

  // ⚡ LOGIKA SATELIT GPS (FASE 1)
  useEffect(() => {
    (async () => {
      if (locationTracking) {
        setIsLocating(true);
        setCityName('Mencari satelit...');
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCityName('Akses Ditolak');
          setLocationTracking(false); 
          setIsLocating(false);
          return;
        }
        try {
          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          let geocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
          if (geocode.length > 0) {
            setCityName(geocode[0].city || geocode[0].subregion || 'Lokasi Ditemukan');
          } else {
            setCityName('Lokasi Tidak Dikenal');
          }
        } catch (error) {
          setCityName('Gagal Melacak');
        } finally {
          setIsLocating(false);
        }
      } else {
        setCityName('Pelacakan Nonaktif');
      }
    })();
  }, [locationTracking]); 

  // ⚡ LOGIKA SENSOR BIOMETRIK (FASE 2)
  const handleBiometricToggle = async (newValue: boolean) => {
    if (newValue) {
      // Jika user ingin MENYALAKAN, kita tes dulu mesinnya
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert("Gagal", "Perangkat Anda tidak mendukung Sidik Jari/Face ID, atau Anda belum mendaftarkannya di pengaturan HP.");
        return;
      }

      // Panggil sensor HP muncul ke layar
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Pindai sidik jari Anda untuk mengaktifkan keamanan Biometrik NutriVue.',
        fallbackLabel: 'Gunakan Sandi HP',
        cancelLabel: 'Batal'
      });

      // Jika sidik jari benar, nyalakan tombolnya
      if (auth.success) {
        setBiometricEnabled(true);
        Alert.alert("Berhasil", "Autentikasi Biometrik berhasil diaktifkan!");
      } else {
        // Jika gagal/batal, biarkan tetap mati
        setBiometricEnabled(false);
      }
    } else {
      // Jika user ingin MEMATIKAN, langsung matikan saja
      setBiometricEnabled(false);
    }
  };

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
          
          {/* ⚡ TOGGLE BIOMETRIK DIPASANGKAN DENGAN FUNGSI BARU */}
          <ToggleRow 
            icon="finger-print" title="Autentikasi Biometrik" subtitle="Gunakan sidik jari atau pemindai wajah" color="emerald" 
            value={biometricEnabled} onValueChange={handleBiometricToggle} 
          />
          
          <ToggleRow icon="keypad" title="Kunci Aplikasi PIN" subtitle="Minta PIN setiap membuka aplikasi" color="amber" value={pinEnabled} onValueChange={setPinEnabled} isLast={true} />
        </View>

        <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Kontrol Privasi</Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <ToggleRow icon="medical" title="Visibilitas Data Medis" subtitle="Izinkan mitra melihat pantangan alergi Anda" color="rose" value={medicalVisibility} onValueChange={setMedicalVisibility} />
          <ToggleRow icon="location" title="Pelacakan Lokasi Distribusi" subtitle="Simpan riwayat lokasi pengambilan gizi" color="sky" value={locationTracking} onValueChange={setLocationTracking} isLast={true} />
        </View>

        <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Perangkat Tertaut</Text>
        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          
          <View className="flex-row items-center border-b border-gray-50 pb-5 mb-5">
            <View className="w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center mr-4 shrink-0 border border-slate-100">
              <Ionicons name={Platform.OS === 'ios' ? 'phone-portrait' : 'phone-portrait-outline'} size={28} color="#64748B" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider mb-1">Sedang Digunakan Saat Ini</Text>
              <Text className="text-gray-900 font-black text-base uppercase tracking-wider mb-1.5" numberOfLines={1}>{deviceName}</Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={12} color={locationTracking ? '#0EA5E9' : '#9CA3AF'} style={{ marginRight: 4 }} />
                {isLocating ? (
                  <ActivityIndicator size="small" color="#0EA5E9" style={{ transform: [{ scale: 0.7 }] }} />
                ) : (
                  <Text className={`text-[11px] font-bold ${locationTracking ? 'text-sky-600' : 'text-gray-400'}`} numberOfLines={1}>{cityName}</Text>
                )}
              </View>
            </View>
          </View>
          
          <TouchableOpacity className="flex-row items-center justify-center py-3 bg-red-50 active:bg-red-100 rounded-xl border border-red-100">
            <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text className="text-red-600 font-bold text-sm">Keluar dari Semua Perangkat</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}