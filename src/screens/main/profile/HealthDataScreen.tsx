import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../../components/CustomAlert';

/**
 * Komponen manajemen data kesehatan untuk personalisasi nutrisi dan keamanan medis
 */
export default function HealthDataScreen({ navigation }: any) {
  
  /**
   * Status data kesehatan dasar meliputi golongan darah dan antropometri
   */
  const [bloodType, setBloodType] = useState('O+');
  const [weight, setWeight] = useState('65');
  const [height, setHeight] = useState('172');
  const [medicalNotes, setMedicalNotes] = useState('Intoleransi Laktosa ringan. Hindari susu sapi berlebih.');
  
  /**
   * Daftar alergi makanan yang disimpan dalam format array untuk representasi tag
   */
  const [allergies, setAllergies] = useState(['Kacang Tanah', 'Udang laut']);

  const [isLoading, setIsLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  /**
   * Logika kalkulasi indeks massa tubuh berdasarkan metrik berat dan tinggi badan
   */
  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return '0.0';
  };

  /**
   * Prosedur asinkron untuk persistensi perubahan data kesehatan ke server
   */
  const handleSaveChanges = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAlertVisible(true);
    }, 1500);
  };

  /**
   * Komponen internal untuk standarisasi input metrik fisik dengan unit ukuran
   */
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
          className="text-2xl font-black text-gray-900 p-0 m-0 leading-tight"
          maxLength={3}
        />
        <Text className="text-sm font-bold text-gray-400 ml-1 mb-0.5">{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        {/* Bagian header navigasi dan judul fungsionalitas */}
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

          {/* Banner informasi mengenai pentingnya sinkronisasi data medis */}
          <View className="bg-amber-50 p-4 rounded-2xl flex-row items-center border border-amber-100 mb-6 shadow-sm">
            <Ionicons name="information-circle" size={24} color="#F59E0B" style={{ marginRight: 12 }} />
            <Text className="flex-1 text-xs text-amber-700 leading-relaxed font-medium">
              Data ini akan disinkronkan dengan tim katering untuk memastikan menu yang Anda terima bebas dari pantangan medis.
            </Text>
          </View>

          {/* Kelompok input untuk data biometrik fisik */}
          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Metrik Fisik</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            <View className="flex-row space-x-3 mb-4">
              <MetricInput label="Berat Badan" value={weight} onChangeText={setWeight} unit="kg" icon="barbell" />
              <MetricInput label="Tinggi Badan" value={height} onChangeText={setHeight} unit="cm" icon="body" />
            </View>

            {/* Visualisasi hasil kalkulasi indeks massa tubuh */}
            <View className="bg-sky-50 rounded-xl p-4 flex-row items-center justify-between border border-sky-100">
              <View>
                <Text className="text-xs font-bold text-sky-700 uppercase mb-1">Body Mass Index (BMI)</Text>
                <Text className="text-xs text-sky-600 font-medium">Status: <Text className="font-bold text-emerald-600">Normal</Text></Text>
              </View>
              <Text className="text-3xl font-black text-sky-600">{calculateBMI()}</Text>
            </View>
          </View>

          {/* Kelompok input untuk informasi kondisi medis dan alergi */}
          <Text className="text-sm font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wider">Kondisi Medis</Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
            
            {/* Informasi golongan darah dengan skema visual ABO */}
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
              <View className="bg-rose-500 px-3 py-1.5 rounded-lg shadow-sm shadow-rose-200">
                <Text className="text-white font-black text-base">{bloodType}</Text>
              </View>
            </View>

            {/* Representasi visual daftar alergi menggunakan komponen chip */}
            <View className="mb-5 border-b border-gray-50 pb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Alergi Makanan</Text>
                <TouchableOpacity>
                  <Ionicons name="add-circle" size={20} color="#0EA5E9" />
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {allergies.map((item, index) => (
                  <View key={index} className="bg-red-50 px-3 py-1.5 rounded-full border border-red-100 flex-row items-center">
                    <Ionicons name="warning" size={12} color="#EF4444" style={{ marginRight: 4 }} />
                    <Text className="text-red-600 font-bold text-xs">{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Area input untuk deskripsi medis tambahan atau penyakit penyerta */}
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

          {/* Tombol eksekusi penyimpanan dengan status pemuatan */}
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

      {/* Komponen dialog konfirmasi keberhasilan sinkronisasi data */}
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