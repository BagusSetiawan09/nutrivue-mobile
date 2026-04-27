import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, UIManager, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/** Konfigurasi animasi tata letak untuk antarmuka Android */
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Komponen antarmuka pusat bantuan dan layanan pelanggan terpadu
 */
export default function HelpCenterScreen({ navigation }: any) {
  
  /** Status lokal untuk manajemen kata kunci pencarian dan interaksi akordion */
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  /**
   * Basis data statis untuk pertanyaan yang sering diajukan
   */
  const faqData = [
    {
      id: 1,
      question: 'Bagaimana cara memindai kode pengambilan gizi?',
      answer: 'Buka menu pemindai di halaman beranda lalu arahkan kamera perangkat Anda tepat ke arah kode matriks milik peserta. Sistem akan memverifikasi data secara otomatis.',
    },
    {
      id: 2,
      question: 'Apa yang harus dilakukan jika kode ditolak sistem?',
      answer: 'Penolakan biasanya terjadi jika kode telah kedaluwarsa atau jatah gizi sudah diambil sebelumnya. Pastikan peserta memperbarui halaman aplikasi mereka untuk mendapatkan kode terbaru.',
    },
    {
      id: 3,
      question: 'Cara memperbarui informasi alergi medis?',
      answer: 'Navigasikan ke menu Profil lalu pilih opsi Data Kesehatan. Anda dapat menyesuaikan indikator alergi dan preferensi diet di halaman tersebut.',
    },
    {
      id: 4,
      question: 'Apakah aplikasi membutuhkan koneksi internet terus menerus?',
      answer: 'Benar sekali. NutriVue membutuhkan konektivitas internet yang stabil untuk melakukan sinkronisasi data distribusi dan verifikasi kode peserta secara waktu nyata.',
    }
  ];

  /**
   * ⚡ FITUR AKTIF 1: Filter pencarian pintar
   */
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqData;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return faqData.filter(
      (faq) => 
        faq.question.toLowerCase().includes(lowerCaseQuery) || 
        faq.answer.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchQuery]);

  /**
   * Prosedur pemicu animasi pembukaan dan penutupan panel pertanyaan
   */
  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  /**
   * ⚡ FITUR AKTIF 2: Aksi kontak langsung (Deep Linking)
   */
  const handleWhatsApp = () => {
    // Ganti nomor ini dengan nomor WhatsApp CS resmi Anda
    const phoneNumber = '+6281234567890'; 
    const message = 'Halo Tim Support NutriVue, saya membutuhkan bantuan terkait aplikasi.';
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`)
      .catch(() => alert('Pastikan aplikasi WhatsApp sudah terinstal di perangkat Anda.'));
  };

  const handleEmail = () => {
    // Ganti dengan email CS resmi Anda
    const email = 'support@nutrivueapp.com';
    const subject = 'Tiket Bantuan Pengguna NutriVue';
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`)
      .catch(() => alert('Tidak dapat membuka aplikasi Email klien.'));
  };

  /**
   * Subkomponen modular untuk menyajikan opsi kontak layanan pelanggan
   */
  const ContactCard = ({ icon, title, subtitle, color, onPressAction }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPressAction}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 ml-2 mr-2 items-center"
    >
      <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 bg-${color}-50`}>
        <Ionicons name={icon} size={24} color={`#${color === 'sky' ? '0EA5E9' : color === 'emerald' ? '10B981' : 'F59E0B'}`} />
      </View>
      <Text className="text-gray-900 font-bold text-sm mb-1 text-center">{title}</Text>
      <Text className="text-gray-400 text-[10px] text-center px-1">{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {/* Bagian tajuk utama antarmuka navigasi */}
      <View className="flex-row items-center mb-6 mt-4 px-6">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="mr-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50"
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-gray-900">Pusat Bantuan</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Solusi kendali teknis dan panduan sistem</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        bounces={false}
      >
        
        {/* Modul pencarian pintar untuk basis pengetahuan */}
        <View className="bg-primary p-6 rounded-[32px] shadow-xl shadow-sky-200 mb-8 overflow-hidden relative">
          <View className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <Text className="text-white text-xl font-bold mb-2">Ada yang bisa kami bantu</Text>
          <Text className="text-sky-100 text-xs mb-6 leading-relaxed">
            Ketik kata kunci masalah Anda untuk menemukan panduan resolusi dengan cepat
          </Text>
          
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm">
            <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Masukkan kata kunci pencarian"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-sm font-medium text-gray-900"
            />
            {/* Tombol silang untuk membersihkan pencarian */}
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Panel opsi komunikasi langsung dengan tim dukungan */}
        <Text className="text-sm font-bold text-gray-900 mb-4 ml-2 uppercase tracking-wider">Hubungi Kami</Text>
        <View className="flex-row justify-between mb-8 -mx-2">
          <ContactCard icon="chatbubbles" title="Chat Langsung" subtitle="Respon cepat via pesan" color="emerald" onPressAction={handleWhatsApp} />
          <ContactCard icon="mail" title="Kirim Tiket" subtitle="Laporan teknis mendetail" color="sky" onPressAction={handleEmail} />
        </View>

        {/* Daftar pertanyaan interaktif berbasis akordion */}
        <Text className="text-sm font-bold text-gray-900 mb-4 ml-2 uppercase tracking-wider">Pertanyaan Populer</Text>
        
        {filteredFaqs.length === 0 ? (
          // ⚡ Tampilan jika pencarian tidak membuahkan hasil
          <View className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-8 items-center mb-8">
            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
              <Ionicons name="document-text-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-base mb-1 text-center">Panduan Tidak Ditemukan</Text>
            <Text className="text-gray-500 text-xs text-center leading-relaxed">
              Kami tidak dapat menemukan jawaban untuk "{searchQuery}". Silakan gunakan fitur Hubungi Kami di atas.
            </Text>
          </View>
        ) : (
          <View className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-2 mb-8">
            {filteredFaqs.map((faq, index) => {
              const isExpanded = expandedId === faq.id;
              const isLast = index === filteredFaqs.length - 1;

              return (
                <View key={faq.id} className={`overflow-hidden ${!isLast ? 'border-b border-gray-50' : ''}`}>
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(faq.id)}
                    className="flex-row items-center justify-between p-4"
                  >
                    <Text className={`flex-1 pr-4 text-sm font-bold ${isExpanded ? 'text-primary' : 'text-gray-900'}`}>
                      {faq.question}
                    </Text>
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${isExpanded ? 'bg-sky-50' : 'bg-gray-50'}`}>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color={isExpanded ? "#0EA5E9" : "#9CA3AF"} 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View className="px-4 pb-5 pt-1">
                      <Text className="text-gray-500 text-xs leading-loose">
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Informasi tambahan mengenai versi perangkat lunak */}
        <View className="items-center mt-2">
          <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="leaf" size={24} color="#D1D5DB" />
          </View>
          <Text className="text-gray-400 text-xs font-medium text-center">Tim Dukungan NutriVue beroperasi</Text>
          <Text className="text-gray-400 text-xs font-medium text-center">Senin hingga Jumat jam operasional kerja</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}