import React, { useEffect, useState } from 'react';

import { View, ActivityIndicator } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Updates from 'expo-updates';



import ScanScreen from './src/screens/main/ScanScreen';

import LoginScreen from './src/screens/auth/LoginScreen';

import RegisterScreen from './src/screens/auth/RegisterScreen';

import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

import HomeScreen from './src/screens/main/HomeScreen';

import MenuScreen from './src/screens/main/MenuScreen';

import HistoryScreen from './src/screens/main/HistoryScreen';

import StatistikScreen from './src/screens/main/StatistikScreen';



// Import Screens Profile

import ProfileScreen from './src/screens/main/ProfileScreen';

import PersonalInfoScreen from './src/screens/main/profile/PersonalInfoScreen';

import HealthDataScreen from './src/screens/main/profile/HealthDataScreen';

import DigitalIdScreen from './src/screens/main/profile/DigitalIdScreen';



// Import Custom Alert buatanmu

import CustomAlert from './src/components/CustomAlert'; 



const Stack = createNativeStackNavigator();



export default function App() {

  const [isLoading, setIsLoading] = useState(true);

  const [initialRoute, setInitialRoute] = useState('Login');



  // State Manajemen untuk Custom Alert Update OTA

  const [updateAlertVisible, setUpdateAlertVisible] = useState(false);



  useEffect(() => {

    /**

     * Fungsi Pengecekan Pembaruan Otomatis 

     */

    const checkForUpdates = async () => {

      try {

        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {

          // Ganti Alert sistem dengan menampilkan Custom Alert

          setUpdateAlertVisible(true);

        }

      } catch (e) {

        console.log('Pengecekan pembaruan dilewati saat mode pengembangan', e);

      }

    };



    /**

     * Fungsi Validasi Sesi Pengguna

     */

    const checkLoginStatus = async () => {

      try {

        const token = await AsyncStorage.getItem('userToken');

        if (token) {

          setInitialRoute('Home'); 

        }

      } catch (e) {

        console.log('Gagal memeriksa token akses perangkat', e);

      } finally {

        setIsLoading(false);

      }

    };



    if (!__DEV__) {

      checkForUpdates();

    }

    

    checkLoginStatus();

  }, []);



  /**

   * Fungsi untuk mengeksekusi pembaruan saat user menekan tombol konfirmasi

   */

  const handleProcessUpdate = async () => {

    setUpdateAlertVisible(false); // Tutup modal alert

    setIsLoading(true); // Munculkan layar loading utama saat proses unduh pembaruan

    try {

      await Updates.fetchUpdateAsync();

      await Updates.reloadAsync();

    } catch (e) {

      console.log('Gagal mengunduh pembaruan', e);

      setIsLoading(false); // Matikan loading jika gagal

    }

  };



  // Layar tunggu sementara saat sistem membaca data sesi dan pembaruan

  if (isLoading) {

    return (

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>

        <ActivityIndicator size="large" color="#0EA5E9" />

      </View>

    );

  }



  return (

    <SafeAreaProvider>

      <NavigationContainer>

        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>

          <Stack.Screen name="Login" component={LoginScreen} />

          <Stack.Screen name="Register" component={RegisterScreen} />

          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

          <Stack.Screen name="Home" component={HomeScreen} />

          <Stack.Screen name="Scan" component={ScanScreen} />

          <Stack.Screen name="Menu" component={MenuScreen} />

          <Stack.Screen name="History" component={HistoryScreen} />

          <Stack.Screen name="Statistik" component={StatistikScreen} />



          {/* Halaman profil */}

          <Stack.Screen name="Profile" component={ProfileScreen} />

          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />

          <Stack.Screen name="HealthData" component={HealthDataScreen} />

          <Stack.Screen name="DigitalId" component={DigitalIdScreen} />

          

        </Stack.Navigator>

      </NavigationContainer>



      {/* RENDER CUSTOM ALERT DI TINGKAT ROOT (PALING ATAS) */}

      <CustomAlert 

        visible={updateAlertVisible}

        type="info"

        title="Pembaruan Sistem"

        message="Versi terbaru NutriVue telah rilis. Tekan tombol di bawah untuk memperbarui tanpa perlu instal ulang aplikasi."

        confirmText="Perbarui Sekarang"

        onClose={() => setUpdateAlertVisible(false)}

        onConfirm={handleProcessUpdate}

      />



      <StatusBar style="auto" />

    </SafeAreaProvider>

  );

}