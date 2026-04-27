import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';

export default function NotificationScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.status === 'success') {
        setNotifications(response.data.data);
        // Langsung tandai semua sudah dibaca di peladen saat layar ini dibuka
        if (response.data.unread_count > 0) {
          await api.post('/notifications/read');
        }
      }
    } catch (error) {
      console.log('Gagal memuat notifikasi', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'success': return { icon: 'checkmark-circle', color: '#10B981', bg: 'bg-emerald-50' };
      case 'warning': return { icon: 'warning', color: '#F59E0B', bg: 'bg-amber-50' };
      default: return { icon: 'information-circle', color: '#0EA5E9', bg: 'bg-sky-50' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-gray-50 rounded-xl active:bg-gray-100">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Pusat Notifikasi</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-4">
        {isLoading ? (
          <ActivityIndicator size="large" color="#0EA5E9" style={{ marginTop: 50 }} />
        ) : notifications.length === 0 ? (
          <View className="items-center justify-center py-20 mt-10">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="notifications-off-outline" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-2">Belum Ada Pemberitahuan</Text>
            <Text className="text-sm text-gray-500 text-center px-4 leading-relaxed">
              Semua pembaruan terkait jadwal distribusi dan keamanan akun Anda akan muncul di sini.
            </Text>
          </View>
        ) : (
          notifications.map((notif) => {
            const config = getIconConfig(notif.type);
            return (
              <View 
                key={notif.id} 
                className={`flex-row p-5 mb-4 rounded-2xl border ${notif.is_read ? 'bg-white border-gray-100 shadow-sm' : 'bg-sky-50/50 border-sky-100 shadow-sm'}`}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${config.bg}`}>
                  <Ionicons name={config.icon as any} size={24} color={config.color} />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-sm font-bold text-gray-900 flex-1 mr-2">{notif.title}</Text>
                    {!notif.is_read && <View className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />}
                  </View>
                  <Text className="text-xs text-gray-500 leading-relaxed">{notif.message}</Text>
                </View>
              </View>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}