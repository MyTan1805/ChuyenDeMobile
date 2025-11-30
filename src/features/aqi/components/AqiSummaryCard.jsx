import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AQI_SCALE } from '../../../constants/aqiScale'; 

const AqiSummaryCard = ({ aqiData, locationName, loading }) => {
  if (loading) {
    return (
      <View style={[styles.card, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2F847C" />
      </View>
    );
  }

  if (!aqiData) {
    return (
      <View style={[styles.card, styles.centerContent]}>
        <Text style={{ color: '#666', fontFamily: 'Nunito-Regular' }}>Chưa có dữ liệu vị trí</Text>
      </View>
    );
  }

  const { aqi, components } = aqiData;
  const scaleInfo = AQI_SCALE[aqi] || AQI_SCALE[1]; 
  const pm25 = components.pm2_5;
  
  // Tính % cho thanh progress (Max 300)
  const progressPercent = Math.min((pm25 / 300) * 100, 100);

  // Bộ màu Pastel (Nền) và Màu đậm (Chữ/Icon)
  const getTheme = () => {
      switch(aqi) {
          case 1: return { bg: ['#E8F5E9', '#C8E6C9'], text: '#1B5E20', accent: '#2E7D32' }; // Tốt (Xanh)
          case 2: return { bg: ['#FFFDE7', '#FFF59D'], text: '#F57F17', accent: '#FBC02D' }; // Khá (Vàng)
          case 3: return { bg: ['#FFF3E0', '#FFCC80'], text: '#E65100', accent: '#FB8C00' }; // TB (Cam)
          case 4: return { bg: ['#FFEBEE', '#EF9A9A'], text: '#B71C1C', accent: '#D32F2F' }; // Kém (Đỏ)
          default: return { bg: ['#F3E5F5', '#CE93D8'], text: '#4A148C', accent: '#7B1FA2' }; // Rất kém (Tím)
      }
  };

  const theme = getTheme();

  return (
    <LinearGradient
        colors={theme.bg}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
    >
        {/* Header: Location & Icon */}
        <View style={styles.topRow}>
            <View style={{flex: 1}}>
                <View style={styles.locationRow}>
                    <Ionicons name="location-sharp" size={16} color={theme.text} style={{marginTop: 2}} />
                    <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>
                        {locationName}
                    </Text>
                </View>
                <Text style={[styles.subLabel, { color: theme.text, opacity: 0.8 }]}>
                    Cập nhật trực tiếp
                </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: theme.accent }]}>
                <Text style={styles.statusText}>{scaleInfo.label}</Text>
            </View>
        </View>

        {/* Big Data Section */}
        <View style={styles.mainDataRow}>
            <View>
                <Text style={[styles.bigNumber, { color: theme.text }]}>
                    {pm25.toFixed(0)}
                </Text>
                <Text style={[styles.unitText, { color: theme.text }]}>AQI (US)</Text>
            </View>
            
            {/* Cột thông tin phụ bên cạnh số to */}
            <View style={styles.subDataCol}>
                <View style={styles.dataItem}>
                    <Text style={[styles.dataLabel, {color: theme.text}]}>PM2.5</Text>
                    <Text style={[styles.dataValue, {color: theme.text}]}>{pm25.toFixed(1)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.dataItem}>
                    <Text style={[styles.dataLabel, {color: theme.text}]}>PM10</Text>
                    <Text style={[styles.dataValue, {color: theme.text}]}>{components.pm10.toFixed(1)}</Text>
                </View>
            </View>
        </View>

        {/* Warning Text */}
        <View style={[styles.adviceBox, { borderColor: theme.accent }]}>
            <MaterialCommunityIcons name="comment-alert-outline" size={18} color={theme.text} style={{marginRight: 8}} />
            <Text style={[styles.adviceText, { color: theme.text }]}>
                {scaleInfo.advice}
            </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
                <View 
                    style={[
                        styles.progressBarFill, 
                        { width: `${progressPercent}%`, backgroundColor: theme.accent }
                    ]} 
                />
            </View>
            <View style={styles.scaleRow}>
                <Text style={[styles.scaleText, { color: theme.text }]}>Tốt</Text>
                <Text style={[styles.scaleText, { color: theme.text }]}>Nguy hại</Text>
            </View>
        </View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  centerContent: { backgroundColor: '#fff', alignItems: 'center', padding: 30, justifyContent: 'center' },
  
  // Top
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  locationText: { fontSize: 16, fontFamily: 'Nunito-Bold', marginLeft: 4, flex: 1 },
  subLabel: { fontSize: 12, fontFamily: 'Nunito-Regular', marginLeft: 20 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 12, textTransform: 'uppercase' },

  // Middle
  mainDataRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  bigNumber: { fontSize: 72, fontFamily: 'LilitaOne-Regular', lineHeight: 80, includeFontPadding: false },
  unitText: { fontSize: 14, fontFamily: 'Nunito-Bold', marginTop: -5, marginLeft: 5, opacity: 0.7 },
  
  subDataCol: { backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 16, padding: 12, width: 120 },
  dataItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dataLabel: { fontSize: 12, fontFamily: 'Nunito-Regular', opacity: 0.8 },
  dataValue: { fontSize: 14, fontFamily: 'Nunito-Bold' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 6 },

  // Advice
  adviceBox: { 
      flexDirection: 'row', alignItems: 'center', 
      backgroundColor: 'rgba(255,255,255,0.3)', 
      padding: 12, borderRadius: 12, marginBottom: 15,
      borderWidth: 1, borderStyle: 'dashed'
  },
  adviceText: { flex: 1, fontSize: 13, fontFamily: 'Nunito-Bold', lineHeight: 18 },

  // Progress
  progressContainer: { width: '100%' },
  progressBarTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleText: { fontSize: 10, fontFamily: 'Nunito-Bold', opacity: 0.7 }
});

export default AqiSummaryCard;