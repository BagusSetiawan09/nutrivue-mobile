import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import * as Notifications from 'expo-notifications';

import ScanScreen from './src/screens/main/ScanScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import MenuScreen from './src/screens/main/MenuScreen';
import HistoryScreen from './src/screens/main/HistoryScreen';
import StatistikScreen from './src/screens/main/StatistikScreen';

/** Impor komponen layar profil pengguna */
import ProfileScreen from './src/screens/main/ProfileScreen';
import PersonalInfoScreen from './src/screens/main/profile/PersonalInfoScreen';
import HealthDataScreen from './src/screens/main/profile/HealthDataScreen';
import DigitalIdScreen from './src/screens/main/profile/DigitalIdScreen';
import SecurityScreen from './src/screens/main/profile/SecurityScreen';
import HelpCenterScreen from './src/screens/main/profile/HelpCenterScreen';

/** Impor komponen peringatan kustom sistem */
import CustomAlert from './src/components/CustomAlert'; 

/**
 * Konfigurasi penanganan notifikasi global saat aplikasi dalam status aktif
 * Parameter ini mencegah aplikasi menutup paksa saat menerima panggilan sistem
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  /** Status manajemen untuk memicu dialog pembaruan sistem nirkabel */
  const [updateAlertVisible, setUpdateAlertVisible] = useState(false);

  useEffect(() => {
    /**
     * Prosedur pengecekan pembaruan perangkat lunak secara otomatis
     */
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setUpdateAlertVisible(true);
        }
      } catch (e) {
        console.log('Pengecekan pembaruan dilewati saat mode pengembangan', e);
      }
    };

    /**
     * Prosedur validasi sesi pengguna untuk penentuan rute awal navigasi
     */
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setInitialRoute('Home'); 
        }
      } catch (e) {
        console.log('Sistem gagal memeriksa token akses perangkat', e);
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
   * Prosedur eksekusi pengunduhan pembaruan saat pengguna memberikan konfirmasi
   */
  const handleProcessUpdate = async () => {
    setUpdateAlertVisible(false);
    setIsLoading(true);
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (e) {
      console.log('Sistem gagal mengunduh pembaruan rilis', e);
      setIsLoading(false);
    }
  };

  /** Layar pemuatan awal saat sistem menginisialisasi status sesi dan pembaruan */
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

          {/* Rute navigasi kelompok profil pengguna */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="HealthData" component={HealthDataScreen} />
          <Stack.Screen name="DigitalId" component={DigitalIdScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Komponen peringatan kustom yang dirender pada tingkat hierarki tertinggi */}
      <CustomAlert 
        visible={updateAlertVisible}
        type="info"
        title="Pembaruan Sistem"
        message="Versi terbaru NutriVue telah rilis Tekan tombol di bawah untuk memperbarui tanpa perlu instal ulang aplikasi"
        confirmText="Perbarui Sekarang"
        onClose={() => setUpdateAlertVisible(false)}
        onConfirm={handleProcessUpdate}
      />

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}