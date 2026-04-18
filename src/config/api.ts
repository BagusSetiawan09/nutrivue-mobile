import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Konfigurasi Dasar Layanan API
 * Mengatur alamat server pusat dan standar header untuk pertukaran data json
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://nutrivueapp.com/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Interseptor Permintaan Akses
 * Menangani penyematan token otentikasi secara otomatis pada setiap permintaan api
 */
api.interceptors.request.use(
  async (config) => {
    try {
      /**
       * Pengambilan token identitas dari penyimpanan lokal perangkat
       * Digunakan untuk memvalidasi akses pengguna pada rute terproteksi
       */
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Penanganan jika penyimpanan lokal tidak dapat diakses sementara
      console.warn('Kegagalan akses penyimpanan lokal sesi dilewati');
    }
    return config;
  },
  (error) => {
    // Menangani kesalahan pada tingkat pengiriman permintaan
    return Promise.reject(error);
  }
);

export default api;