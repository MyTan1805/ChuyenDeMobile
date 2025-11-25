import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AQI_SCALE } from '../../../constants/aqiScale'; 

const AqiSummaryCard = ({ aqiData, locationName, loading }) => {
  // 1. Xử lý trạng thái đang tải
  if (loading) {
    return (
      <View style={[styles.card, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10, color: '#666' }}>Đang phân tích không khí...</Text>
      </View>
    );
  }

  // 2. Xử lý khi chưa có dữ liệu
  if (!aqiData) {
    return (
      <View style={[styles.card, styles.centerContent]}>
        <MaterialCommunityIcons name="weather-cloudy-alert" size={40} color="#999" />
        <Text style={{ marginTop: 10, color: '#666' }}>Chưa có dữ liệu</Text>
      </View>
    );
  }

  // 3. Lấy thông tin từ dữ liệu API
  const { aqi, components, dt } = aqiData;
  // Map màu sắc và lời khuyên từ file constant
  const scaleInfo = AQI_SCALE[aqi] || AQI_SCALE[1]; 
  
  // Lấy thời gian cập nhật từ timestamp
  const updateTime = new Date(dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.card, { borderTopWidth: 4, borderTopColor: scaleInfo.color }]}>
      
      {/* Hàng 1: Tiêu đề nhỏ + Icon gió */}
      <View style={styles.row}>
        <Text style={styles.subTitle}>Chất lượng không khí</Text>
        <MaterialCommunityIcons name="weather-windy" size={24} color="#666" />
      </View>

      {/* Hàng 2: Trạng thái chữ to (Ví dụ: Trung bình) */}
      <Text style={[styles.statusText, { color: scaleInfo.color }]}>
        {scaleInfo.label}
      </Text>

      {/* Hàng 3: Số to (Dùng PM2.5 để hiển thị số chi tiết giống thiết kế, vì AQI chỉ từ 1-5) */}
      <Text style={styles.bigNumber}>
        {components.pm2_5.toFixed(0)}
        <Text style={styles.unit}> (PM2.5)</Text>
      </Text>

      {/* Hàng 4: Địa điểm và thời gian */}
      <View style={styles.footer}>
        <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
        <Text style={styles.timeText}>Cập nhật: {updateTime}</Text>
      </View>
      
      {/* (Optional) Lời khuyên ngắn */}
      <View style={[styles.adviceBox, { backgroundColor: scaleInfo.color + '20' }]}>
         <Text style={[styles.adviceText, { color: scaleInfo.color }]}>
           {scaleInfo.advice}
         </Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    // Đổ bóng (Shadow) giống thiết kế
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Cho Android
    minHeight: 200,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  statusText: {
    fontSize: 32, // Chữ to "Trung bình"
    fontWeight: 'bold',
    marginVertical: 5,
  },
  bigNumber: {
    fontSize: 48, // Số "52" rất to
    fontWeight: 'bold',
    color: '#333',
  },
  unit: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'normal',
  },
  footer: {
    marginTop: 15,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  adviceBox: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
  },
  adviceText: {
    fontSize: 13,
    fontWeight: '500',
  }
});

export default AqiSummaryCard;