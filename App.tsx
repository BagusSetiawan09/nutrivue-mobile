import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as LocalAuthentication from 'expo-local-authentication';

import ScanScreen from './src/screens/main/ScanScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import MenuScreen from './src/screens/main/MenuScreen';
import HistoryScreen from './src/screens/main/HistoryScreen';
import StatistikScreen from './src/screens/main/StatistikScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import PersonalInfoScreen from './src/screens/main/profile/PersonalInfoScreen';
import HealthDataScreen from './src/screens/main/profile/HealthDataScreen';
import DigitalIdScreen from './src/screens/main/profile/DigitalIdScreen';
import SecurityScreen from './src/screens/main/profile/SecurityScreen';
import HelpCenterScreen from './src/screens/main/profile/HelpCenterScreen';
import GlobalUpdater from './src/components/GlobalUpdater';

// Mengimpor layar pelindung aplikasi
import PinUnlockScreen from './src/screens/auth/PinUnlockScreen';

if (!__DEV__) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        
        if (token) {
          const isBioEnabled = await AsyncStorage.getItem('biometricEnabled');
          const isPinEnabled = await AsyncStorage.getItem('appPin');

          if (isBioEnabled === 'true') {
            const auth = await LocalAuthentication.authenticateAsync({
              promptMessage: 'Pindai identitas Anda untuk membuka aplikasi',
              fallbackLabel: 'Gunakan Kode',
              cancelLabel: 'Batal'
            });

            if (auth.success) {
              setInitialRoute('Home');
            } else {
              if (isPinEnabled) {
                setInitialRoute('PinUnlock');
              } else {
                setInitialRoute('Login');
              }
            }
          } else if (isPinEnabled) {
            setInitialRoute('PinUnlock');
          } else {
            setInitialRoute('Home');
          }
        }
      } catch (e) {
        console.log('Sistem gagal memeriksa token akses');
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

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
        <GlobalUpdater />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          
          {/* Mendaftarkan layar pelindung aplikasi */}
          <Stack.Screen name="PinUnlock" component={PinUnlockScreen} />
          
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Scan" component={ScanScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Statistik" component={StatistikScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="HealthData" component={HealthDataScreen} />
          <Stack.Screen name="DigitalId" component={DigitalIdScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}