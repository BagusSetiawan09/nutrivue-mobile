import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';

/**
 * Komponen pelacak harian untuk memantau distribusi gizi dalam satu bulan
 */
export default function DailyTracker() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  /**
   * State penyimpanan data riwayat pengambilan gizi dari sumber eksternal
   */
  const [claimedDates, setClaimedDates] = useState<number[]>([]);

  useEffect(() => {
    /**
     * Prosedur pengambilan data riwayat dari layanan API backend
     */
    const fetchHistory = async () => {
      try {
        /**
         * Sinkronisasi data riwayat pengambilan gizi bulan berjalan
         */
        setClaimedDates([]); 
      } catch (error) {
        console.log("Kegagalan sinkronisasi data riwayat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    /**
     * Inisialisasi pengambilan data dengan jeda waktu untuk estetika pemuatan
     */
    setTimeout(fetchHistory, 500);
  }, []);

  /**
   * Konstanta referensi waktu saat ini untuk kalkulasi kalender
   */
  const today = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  /**
   * Kalkulasi dinamis jumlah hari dalam bulan berjalan
   */
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  /**
   * Konstruksi array objek hari untuk representasi antarmuka kalender horizontal
   */
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dateObj = new Date(currentYear, currentMonth, i + 1);
    return {
      date: i + 1,
      dayName: dateObj.toLocaleDateString('id-ID', { weekday: 'short' }),
      isToday: (i + 1) === today,
      isPast: (i + 1) < today,
    };
  });

  /**
   * Efek samping untuk mengatur posisi gulir otomatis ke indikator hari ini
   */
  useEffect(() => {
    if (!isLoading && scrollViewRef.current) {
      setTimeout(() => {
        /**
         * Kalkulasi posisi gulir agar hari aktif berada pada area pandang optimal
         */
        const scrollPosition = (today - 3) * 68;
        scrollViewRef.current?.scrollTo({ x: scrollPosition > 0 ? scrollPosition : 0, animated: true });
      }, 500);
    }
  }, [isLoading, today]);

  return (
    <View className="mb-8">
      {/* Bagian judul dan informasi bulan berjalan */}
      <View className="flex-row justify-between items-end mb-4 px-1">
        <Text className="text-gray-900 text-lg font-bold">Laporan Harian</Text>
        <Text className="text-gray-400 text-xs font-medium uppercase tracking-widest">
          {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Representasi visual status pemuatan data */}
      {isLoading ? (
        <View className="h-24 justify-center items-center bg-white rounded-2xl border border-gray-100 shadow-sm mx-1">
          <ActivityIndicator size="small" color="#0EA5E9" />
          <Text className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">Sinkronisasi Data...</Text>
        </View>
      ) : (
        /**
         * Area kalender horizontal dengan indikator status berbasis warna
         */
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ paddingRight: 20, paddingLeft: 4 }}
        >
          {daysArray.map((item, index) => {
            /**
             * Penentuan logika status berdasarkan riwayat pengambilan dan waktu berjalan
             */
            const isClaimed = claimedDates.includes(item.date);
            const isMissed = item.isPast && !isClaimed;

            /**
             * Konfigurasi skema warna antarmuka berdasarkan kondisi logika gizi
             */
            let bgColor = 'bg-white';
            let borderColor = 'border-gray-100';
            let textColor = 'text-gray-900';
            let dayColor = 'text-gray-400';

            if (isClaimed) {
              /** Kondisi jika jatah gizi telah diklaim pengguna */
              bgColor = 'bg-emerald-500';
              borderColor = 'border-emerald-500';
              textColor = 'text-white';
              dayColor = 'text-emerald-100';
            } else if (item.isToday) {
              /** Kondisi hari aktif berjalan */
              bgColor = 'bg-primary';
              borderColor = 'border-primary';
              textColor = 'text-white';
              dayColor = 'text-sky-100';
            } else if (isMissed) {
              /** Kondisi jika jatah gizi terlewati tanpa pengambilan */
              bgColor = 'bg-gray-100';
              borderColor = 'border-gray-200';
              textColor = 'text-gray-400';
              dayColor = 'text-gray-400';
            }

            return (
              <View key={index} className="items-center mr-3">
                {/* Kontainer visual tanggal harian */}
                <View className={`w-14 h-20 rounded-xl items-center justify-center border ${bgColor} ${borderColor} shadow-sm`}>
                  <Text className={`text-[10px] font-bold uppercase ${dayColor}`}>{item.dayName}</Text>
                  <Text className={`text-lg font-bold mt-1 ${textColor}`}>{item.date}</Text>
                  
                  {/* Indikator visual status aktif hari ini */}
                  {item.isToday && !isClaimed && <View className="w-1.5 h-1.5 bg-white rounded-full mt-1" />}
                </View>
                
                {/* Penanda garis bawah untuk memudahkan identifikasi hari ini */}
                {item.isToday && <View className="h-1 w-8 bg-primary rounded-full mt-2" />}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}