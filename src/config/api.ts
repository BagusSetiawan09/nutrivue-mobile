import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.110.248:8000/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      // Coba ambil token. Kalau error (karena Native Module null), abaikan saja.
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log('AsyncStorage dilewati sementara untuk rute ini.');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;