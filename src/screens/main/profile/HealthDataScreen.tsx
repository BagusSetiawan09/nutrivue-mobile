import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../../components/CustomAlert';

// ⚡ IMPORT API CONFIG ANDA
import api from '../../../config/api'; 

export default function HealthDataScreen({ navigation }: any) {
  
  // ⚡ STATE UNTUK DATA REAL
  const [bloodType, setBloodType] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  
  // State untuk input alergi baru
  const [newAllergy, setNewAllergy] = useState('');

  // State Indikator
  const [isFetching, setIsFetching] = useState(true); // Loading awal saat buka halaman
  const [isLoading, setIsLoading] = useState(false);  // Loading saat tombol simpan ditekan
  const [alertVisible, setAlertVisible] = useState(false);

  // ⚡ JALANKAN SAAT HALAMAN PERTAMA KALI DIBUKA
  useEffect(() => {
    fetchHealthData();
  }, []);

  /**
   * Menarik data kesehatan dari Database (Laravel API)
   */
  const fetchHealthData = async () => {
    try {
      setIsFetching(true);
      // Sesuaikan URL endpoint ini dengan route API Laravel Anda
      const response = await api.get('/profile/health'); 
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        setWeight(data.berat_badan?.toString() || '');
        setHeight(data.tinggi_badan?.toString() || '');
        setBloodType(data.golongan_darah || '');
        setMedicalNotes(data.catatan_medis || '');
        
        // Parsing data alergi (Jika dari backend berupa JSON string)
        if (data.alergi) {
          try {
            const parsedAlergi = typeof data.alergi === 'string' ? JSON.parse(data.alergi) : data.alergi;
            setAllergies(Array.isArray(parsedAlergi) ? parsedAlergi : []);
          } catch (e) {
            setAllergies([]);
          }
        }
      }
    } catch (error) {
      console.log('[API Health] Gagal menarik data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  /**
   * Logika kalkulasi Body Mass Index (BMI)
   */
  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return '0.0';
  };

  /**
   * Fungsi untuk menambah alergi ke dalam array
   */
  const handleAddAllergy = () => {
    if (newAllergy.trim() !== '') {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy(''); // Kosongkan input setelah ditambah
    }
  };

  /**
   * Fungsi untuk menghapus alergi dari array saat di-tap
   */
  const handleRemoveAllergy = (indexToRemove: number) => {
    setAllergies(allergies.filter((_, index) => index !== indexToRemove));
  };

  /**
   * Menyimpan perubahan data kesehatan ke Server
   */
  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const payload = {
        berat_badan: weight,
        tinggi_badan: height,
        golongan_darah: bloodType,
        catatan_medis: medicalNotes,
        alergi: JSON.stringify(allergies) // Kirim sebagai string JSON ke Laravel
      };

      // Tembak data ke API Laravel
      const response = await api.post('/profile/health', payload);
      
      if (response.data.status === 'success') {
        setAlertVisible(true);
      }
    } catch (error) {
      console.log('[API Health] Gagal menyimpan data:', error);
      alert('Gagal menyimpan profil medis. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // Komponen Input Metrik Reusable
  const MetricInput = ({ label, value, onChangeText, unit, icon }: any) => (
    <View className="flex-1 bg-gray-50 rounded-2xl p-3 border border-gray-100">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={14} color="#64748B" style={{ marginRight: 4 }} />
        <Text className="text-[11px] font-bold text-gray-500 uppercase">{label}</Text>
      </View>
      <View className="flex-row items-end">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="0"
          className="text-2xl font-black text-gray-900 p-0 m-0 leading-tight"
          maxLength={3}
        />
        <Text className="text-sm font-bold text-gray-400 ml-1 mb-0.5">{unit}</Text>
      </View>
    </View>
  );

  // Jika sedang menarik data dari server, tampilkan loading layar penuh
  if (isFetching) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text className="text-gray-400 mt-4 font-bold">Sinkronisasi Rekam Medis...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        {/* Header */}
        <View className="flex-row items-center mb-2 mt-4 px-6">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="mr-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">Data Kesehatan</Text>
            <Text className="text-xs text-gray-500 mt-0.5">Informasi medis untuk keamanan gizi Anda</Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          bounces={false}
        >

          {/* Banner Informasi */}
          <View className="bg-amber-50 p-4 rounded-2xl flex-row items-center border border-amber-100 mb-6 shadow-sm">
            <Ionicons name="information-circle" size={24} color="#F59E0B" style={{ marginRight: 12 }} />
            <Text className="flex-1 text-xs text-amber-700 leading-relaxed font-medium">
              Data ini akan disinkronkan dengan tim katering untuk memastikan menu yang Anda terima bebas dari pantangan medis.
            </Text>
          </View>

          {/* Metrik Fisik */}
          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Metrik Fisik</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <View className="flex-row space-x-3 mb-4">
              <MetricInput label="Berat Badan" value={weight} onChangeText={setWeight} unit="kg" icon="barbell" />
              <MetricInput label="Tinggi Badan" value={height} onChangeText={setHeight} unit="cm" icon="body" />
            </View>

            {/* Visualisasi BMI Dinamis */}
            <View className="bg-sky-50 rounded-xl p-4 flex-row items-center justify-between border border-sky-100">
              <View>
                <Text className="text-xs font-bold text-sky-700 uppercase mb-1">Body Mass Index (BMI)</Text>
                <Text className="text-xs text-sky-600 font-medium">Status: <Text className="font-bold text-emerald-600">Terpantau</Text></Text>
              </View>
              <Text className="text-3xl font-black text-sky-600">{calculateBMI()}</Text>
            </View>
          </View>

          {/* Kondisi Medis & Alergi */}
          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Kondisi Medis</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            
            {/* Input Golongan Darah (Dibuat Editable) */}
            <View className="flex-row items-center justify-between mb-5 border-b border-gray-50 pb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center mr-3">
                  <Ionicons name="water" size={20} color="#F43F5E" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-gray-900">Golongan Darah</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">Sistem ABO & Rhesus</Text>
                </View>
              </View>
              <View className="bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 items-center justify-center">
                <TextInput
                  value={bloodType}
                  onChangeText={setBloodType}
                  placeholder="-"
                  maxLength={3}
                  autoCapitalize="characters"
                  className="text-rose-500 font-black text-base p-0 m-0 text-center w-8"
                />
              </View>
            </View>

            {/* Input Alergi Dinamis */}
            <View className="mb-5 border-b border-gray-50 pb-4">
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Alergi Makanan</Text>
              
              {/* Form Tambah Alergi */}
              <View className="flex-row items-center mb-3">
                <TextInput
                  value={newAllergy}
                  onChangeText={setNewAllergy}
                  placeholder="Ketik pantangan/alergi..."
                  className="flex-1 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 text-sm mr-2"
                  onSubmitEditing={handleAddAllergy} // Bisa ditekan Enter dari Keyboard
                />
                <TouchableOpacity onPress={handleAddAllergy} className="bg-sky-50 p-2 rounded-xl border border-sky-100">
                  <Ionicons name="add" size={20} color="#0EA5E9" />
                </TouchableOpacity>
              </View>

              {/* Daftar Tag Alergi */}
              <View className="flex-row flex-wrap gap-2">
                {allergies.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => handleRemoveAllergy(index)} // Hapus jika di-tap
                    className="bg-red-50 px-3 py-1.5 rounded-full border border-red-100 flex-row items-center active:bg-red-200"
                  >
                    <Text className="text-red-600 font-bold text-xs mr-1">{item}</Text>
                    <Ionicons name="close-circle" size={14} color="#EF4444" />
                  </TouchableOpacity>
                ))}
                {allergies.length === 0 && (
                  <Text className="text-xs text-gray-400 italic">Belum ada data alergi.</Text>
                )}
              </View>
            </View>

            {/* Catatan Khusus */}
            <View>
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Catatan Khusus / Penyakit Bawaan</Text>
              <TextInput
                multiline
                numberOfLines={3}
                value={medicalNotes}
                onChangeText={setMedicalNotes}
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-sm font-medium text-gray-900 h-24"
                textAlignVertical="top"
                placeholder="Tambahkan catatan jika ada..."
              />
            </View>

          </View>

          {/* Tombol Simpan Real-Time API */}
          <TouchableOpacity 
            onPress={handleSaveChanges}
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl items-center shadow-sm mb-4 ${isLoading ? 'bg-sky-400' : 'bg-primary active:bg-sky-700'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-bold text-base">Simpan Profil Medis</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert 
        visible={alertVisible}
        type="success"
        title="Data Disimpan"
        message="Informasi kesehatan Anda berhasil diperbarui dan aman bersama kami."
        confirmText="Selesai"
        onClose={() => setAlertVisible(false)}
        onConfirm={() => {
          setAlertVisible(false);
          navigation.goBack();
        }}
      />

    </SafeAreaView>
  );
}