import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

import api from '../../config/api';
import CustomAlert from '../../components/CustomAlert';

/**
 * Komponen utama pemindai optik untuk verifikasi distribusi gizi peserta
 */
export default function ScanScreen({ navigation }: any) {
  
  /**
   * Manajemen variabel status untuk perangkat kamera dan pemindai
   */
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  /**
   * Konfigurasi status lokal untuk antarmuka verifikasi identitas
   */
  const [showVerification, setShowVerification] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  /**
   * Pengaturan dialog peringatan kustom untuk interaksi pengguna
   */
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning',
    onConfirm: () => {},
  });
  
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  /**
   * Validasi ketersediaan hak akses perangkat keras kamera
   */
  if (!permission) {
    return <View className="flex-1 bg-black justify-center items-center"><ActivityIndicator size="large" color="#0EA5E9" /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="camera-outline" size={80} color="#9CA3AF" />
        <Text className="text-xl font-bold text-gray-900 mt-6 text-center">Akses Kamera Diperlukan</Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">Kami membutuhkan izin kamera Anda untuk memindai kode peserta.</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-primary px-8 py-4 rounded-2xl">
          <Text className="text-white font-bold text-base">Berikan Izin Kamera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /**
   * Prosedur utama pemrosesan data saat kode matriks berhasil dipindai
   */
  const handleBarcodeScanned = async ({ type, data }: { type: string, data: string }) => {
    
    /** Mengunci pemindai untuk mencegah eksekusi berulang */
    setScanned(true); 
    setIsVerifying(true);

    try {
      /** Mengirimkan permintaan validasi ke layanan backend utama */
      const response = await api.post('/meal/verify-qr', {
        qr_data: data
      });

      if (response.data.status === 'success') {
        /** Penanganan kondisi sukses saat data sah dan belum diklaim */
        setUserData(response.data.data);
        
        /** Menampilkan antarmuka profil penerima untuk konfirmasi visual */
        setShowVerification(true); 
      }

    } catch (error: any) {
      /** Penanganan galat untuk kode tidak sah atau telah kedaluwarsa */
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan sistem saat memverifikasi kode pemindaian.';
      setAlertConfig({
        visible: true,
        title: 'VERIFIKASI DITOLAK',
        message: errorMessage,
        type: 'error',
        onConfirm: () => {
          closeAlert();
          
          /** Mengaktifkan kembali sensor pemindai setelah dialog peringatan ditutup */
          setScanned(false); 
        },
      });
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Prosedur konfirmasi akhir saat mitra mendistribusikan jatah nutrisi
   */
  const handleConfirmDistribution = () => {
    setShowVerification(false);
    setAlertConfig({
      visible: true,
      title: 'Distribusi Berhasil',
      message: 'Nutrisi telah diserahkan kepada penerima yang sah secara sistem.',
      type: 'success',
      onConfirm: () => {
        closeAlert();
        
        /** Mengondisikan sistem untuk pemindaian peserta selanjutnya */
        setScanned(false); 
      },
    });
  };

  return (
    <View className="flex-1 bg-black">
      
      {/* Modul utama integrasi pemindai optik */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      {/* Lapisan visual untuk panduan pemindaian antarmuka */}
      <View className="flex-1 bg-black/60 justify-center items-center">
        <View className="absolute top-16 left-6 z-10">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white/20 p-2 rounded-full backdrop-blur-md">
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-white text-xl font-bold mb-8 tracking-widest uppercase">Arahkan ke Kode Identitas</Text>
        
        {/* Kontainer presisi fokus kamera */}
        <View className="w-64 h-64 border-2 border-primary/50 bg-transparent relative justify-center items-center">
          
          {/* Ornamen visual futuristik pada tiap sudut area fokus pemindaian */}
          <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
          <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
          <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
          <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />

          {isVerifying && <ActivityIndicator size="large" color="#0EA5E9" />}
        </View>
        
        <Text className="text-white/70 text-sm mt-8 text-center px-10">
          Sistem otomatis mendeteksi dan memverifikasi data penerima secara presisi.
        </Text>
      </View>

      {/* Antarmuka lapisan atas untuk konfirmasi identitas penerima */}
      <Modal visible={showVerification} animationType="slide">
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1 px-8 py-10 items-center justify-center">
            
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            </View>

            <Text className="text-sm font-bold text-green-500 tracking-widest uppercase mb-2">Kode Valid Lolos Cek</Text>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-10">Data Penerima Sah</Text>

            {/* Komponen visual penyajian informasi identitas peserta */}
            {userData && (
              <View className="w-full bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 mb-10 items-center border border-gray-100">
                <View className="w-24 h-24 bg-sky-100 rounded-full mb-4 items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                  
                  {/* Ruang penempatan aset foto profil dinamis dari peladen */}
                  <Ionicons name="person" size={40} color="#0EA5E9" />
                </View>
                
                <Text className="text-xl font-bold text-gray-900 mb-1">{userData.name}</Text>
                <View className="bg-sky-100 px-3 py-1 rounded-full mb-4">
                  <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">{userData.kategori}</Text>
                </View>

                <View className="w-full h-px bg-gray-100 my-4" />
                
                <View className="w-full">
                  <Text className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Asal Daerah</Text>
                  <Text className="text-sm text-gray-700 font-semibold mb-4">{userData.tempat_lahir}</Text>

                  <Text className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Alamat Lengkap</Text>
                  <Text className="text-sm text-gray-700 font-semibold">{userData.alamat}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity 
              onPress={handleConfirmDistribution}
              className="bg-primary w-full py-4 rounded-2xl items-center shadow-sm mb-4"
            >
              <Text className="text-white font-bold text-lg">Selesai Berikan Makanan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setShowVerification(false);
                setScanned(false);
              }}
              className="bg-white border border-red-500 w-full py-4 rounded-2xl items-center"
            >
              <Text className="text-red-500 font-bold text-base">Batalkan Data Tidak Cocok</Text>
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </Modal>

      <CustomAlert 
        visible={alertConfig.visible} title={alertConfig.title}
        message={alertConfig.message} type={alertConfig.type}
        onClose={closeAlert} onConfirm={alertConfig.onConfirm}
      />
    </View>
  );
}