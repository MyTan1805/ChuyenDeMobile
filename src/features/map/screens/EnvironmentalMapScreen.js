import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

// --- CẤU HÌNH BỘ LỌC (Cập nhật thêm Môi trường & Xử lý rác) ---
const FILTERS = [
  { id: 'all', label: 'Tất cả', icon: 'map-marker-multiple', color: '#555', lib: MaterialCommunityIcons },
  // --- Nhóm Rác & Tái chế ---
  { id: 'treatment', label: 'Trạm xử lý', icon: 'factory', color: '#795548', lib: MaterialCommunityIcons }, // Mới: Nâu
  { id: 'waste', label: 'Bãi rác', icon: 'trash', color: '#E57373', lib: FontAwesome5 }, // Đỏ (Report)
  { id: 'e_waste', label: 'Điện tử', icon: 'chip', color: '#5C6BC0', lib: MaterialCommunityIcons },
  { id: 'plastic', label: 'Nhựa', icon: 'bottle-soda', color: '#4FC3F7', lib: MaterialCommunityIcons },
  // --- Nhóm Chỉ số Môi trường (Mới) ---
  { id: 'aqi', label: 'AQI (Không khí)', icon: 'weather-windy', color: '#009688', lib: MaterialCommunityIcons }, // Teal
  { id: 'water', label: 'Nước', icon: 'water', color: '#0288D1', lib: MaterialCommunityIcons }, // Xanh biển đậm
  { id: 'noise', label: 'Tiếng ồn', icon: 'volume-high', color: '#FBC02D', lib: MaterialCommunityIcons }, // Vàng
];

// --- DỮ LIỆU TĨNH (Giả lập các trạm quan trắc & xử lý) ---
const STATIC_POINTS = [
  // 1. Trạm Xử Lý & Bãi Rác Tập Trung
  { id: 't1', lat: 10.750000, lng: 106.600000, type: 'treatment', title: 'Khu Liên Hợp Xử Lý Đa Phước', desc: 'Xử lý rác thải sinh hoạt quy mô lớn' },
  { id: 't2', lat: 10.820000, lng: 106.750000, type: 'treatment', title: 'Trạm Trung Chuyển Rác Q9', desc: 'Điểm tập kết rác thải trước khi xử lý' },
  
  // 2. Điểm Tái Chế (Mẫu)
  { id: 's1', lat: 10.762622, lng: 106.660172, type: 'e_waste', title: 'Thu Gom Pin & ĐT Cũ', desc: 'Nhận pin, điện thoại, laptop hỏng' },
  { id: 's3', lat: 10.755000, lng: 106.670000, type: 'plastic', title: 'Tái Chế Nhựa Sạch', desc: 'Chai nhựa, hộp nhựa đã rửa sạch' },

  // 3. Dữ liệu Môi trường (AQI, Nước, Tiếng ồn)
  { id: 'env1', lat: 10.7769, lng: 106.7009, type: 'aqi', title: 'Trạm Quan Trắc Bến Thành', desc: 'AQI: 112 (Kém) - Bụi mịn PM2.5 cao' },
  { id: 'env2', lat: 10.8015, lng: 106.6523, type: 'aqi', title: 'Trạm Quan Trắc Tân Sơn Nhất', desc: 'AQI: 85 (Trung bình)' },
  { id: 'env3', lat: 10.7900, lng: 106.7100, type: 'water', title: 'Sông Sài Gòn (Khu vực 1)', desc: 'Chất lượng: B (Khá) - Phù hợp tưới tiêu' },
  { id: 'env4', lat: 10.7400, lng: 106.6200, type: 'water', title: 'Kênh Đôi (Khu vực 2)', desc: 'Chất lượng: D (Ô nhiễm) - Không sử dụng sinh hoạt' },
  { id: 'env5', lat: 10.7720, lng: 106.6930, type: 'noise', title: 'Ngã 6 Phù Đổng', desc: 'Tiếng ồn: 85dB (Vượt ngưỡng giờ cao điểm)' },
  { id: 'env6', lat: 10.7680, lng: 106.6780, type: 'noise', title: 'Khu Dân Cư Q3', desc: 'Tiếng ồn: 50dB (Yên tĩnh)' },
];

const EnvironmentalMapScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [mapPoints, setMapPoints] = useState(STATIC_POINTS);
  const webViewRef = useRef(null);

  // 1. Lấy vị trí người dùng
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      } catch (e) { console.log(e); }
    })();
  }, []);

  // 2. Lắng nghe Báo cáo vi phạm đã duyệt (Thêm vào bản đồ là 'waste')
  useEffect(() => {
    const q = query(collection(db, 'reports'), where('status', '==', 'approved'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const reportPoints = snapshot.docs
            .map(doc => {
                const data = doc.data();
                if (data.location && data.location.lat && data.location.lng) {
                    return {
                        id: doc.id,
                        lat: data.location.lat,
                        lng: data.location.lng,
                        type: 'waste', // Báo cáo người dùng -> Bãi rác tự phát
                        title: data.violationType || 'Điểm ô nhiễm',
                        desc: data.description || 'Cần xử lý gấp'
                    };
                }
                return null;
            })
            .filter(item => item !== null);

        setMapPoints([...STATIC_POINTS, ...reportPoints]);
    });

    return () => unsubscribe();
  }, []);

  // 3. Cập nhật WebView khi dữ liệu thay đổi
  useEffect(() => {
    if (webViewRef.current) {
        const dataToSend = JSON.stringify(mapPoints);
        webViewRef.current.injectJavaScript(`
            if (window.updateMarkers) {
                window.updateMarkers(${dataToSend}, '${activeFilter}');
            }
            true;
        `);
    }
  }, [mapPoints, activeFilter]);

  // HTML Map (Leaflet JS) - Cập nhật icon và màu sắc mới
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style> body { margin: 0; padding: 0; } #map { width: 100%; height: 100vh; } </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {zoomControl: false}).setView([${userLocation ? userLocation.latitude : 10.762}, ${userLocation ? userLocation.longitude : 106.660}], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
        var markersLayer = L.layerGroup().addTo(map);

        // Vị trí người dùng
        var userLat = ${userLocation ? userLocation.latitude : 'null'};
        var userLng = ${userLocation ? userLocation.longitude : 'null'};
        if (userLat && userLng) {
           var userIcon = L.divIcon({
              html: '<div style="background-color: #4285F4; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.3);"></div>',
              className: 'user-pin',
              iconSize: [16, 16]
           });
           L.marker([userLat, userLng], {icon: userIcon, zIndexOffset: 1000}).addTo(map).bindPopup("Vị trí của bạn");
        }

        function getColor(type) {
          switch(type) {
            case 'treatment': return '#795548'; // Nâu
            case 'waste': return '#E57373';     // Đỏ
            case 'aqi': return '#009688';       // Teal (Không khí)
            case 'water': return '#0288D1';     // Xanh nước biển
            case 'noise': return '#FBC02D';     // Vàng đậm (Tiếng ồn)
            case 'e_waste': return '#5C6BC0';   
            case 'plastic': return '#4FC3F7';
            default: return '#7F8C8D';
          }
        }

        // Hàm tạo ký hiệu chữ cái bên trong marker để dễ phân biệt
        function getSymbol(type) {
            switch(type) {
                case 'treatment': return 'Tx'; // Trạm xử lý
                case 'aqi': return 'A';        // Air
                case 'water': return 'W';      // Water
                case 'noise': return 'N';      // Noise
                case 'waste': return '!';      // Báo cáo vi phạm
                case 'e_waste': return 'E';
                case 'plastic': return 'P';
                default: return '';
            }
        }

        window.updateMarkers = function(points, filter) {
          markersLayer.clearLayers();
          points.forEach(function(p) {
            if (filter !== 'all' && p.type !== filter) return;
            
            var color = getColor(p.type);
            var symbol = getSymbol(p.type);
            
            // Style Marker tròn có chữ cái bên trong
            var iconHtml = '<div style="background-color: '+color+'; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-family: sans-serif; font-size: 12px;">' + symbol + '</div>';
            
            var icon = L.divIcon({ className: 'custom-pin', html: iconHtml, iconSize: [30, 30], iconAnchor: [15, 15] });
            
            L.marker([p.lat, p.lng], {icon: icon})
              .bindPopup('<div style="text-align: center;"><b>'+p.title+'</b><br><span style="color: #666; font-size: 12px;">'+p.desc+'</span></div>')
              .addTo(markersLayer);
          });
        };
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bản đồ Môi trường</Text>
        <View style={{width: 24}}/>
      </View>

      {/* Filter Bar (Cuộn ngang) */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
            {FILTERS.map((f) => {
                const isActive = activeFilter === f.id;
                return (
                    <TouchableOpacity 
                        key={f.id} 
                        style={[styles.filterChip, isActive && { backgroundColor: f.color, borderColor: f.color }]}
                        onPress={() => setActiveFilter(f.id)}
                    >
                        <f.lib 
                            name={f.icon} 
                            size={14} 
                            color={isActive ? '#fff' : f.color} 
                            style={{marginRight: 6}} 
                        />
                        <Text style={[styles.filterText, isActive && styles.filterTextActive, !isActive && {color: f.color}]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </ScrollView>
      </View>

      {/* Map */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
        startInLoadingState={true}
        renderLoading={() => <ActivityIndicator size="large" color="#81C784" style={{position:'absolute', top:'50%', left:'50%'}} />}
        onLoadEnd={() => {
            if (webViewRef.current) {
                const dataToSend = JSON.stringify(mapPoints);
                webViewRef.current.injectJavaScript(`window.updateMarkers(${dataToSend}, '${activeFilter}'); true;`);
            }
        }}
      />
      
      {/* Chú thích nổi (Floating Legend) */}
      <View style={styles.legendFloating}>
          <Text style={styles.legendTitle}>Ký hiệu:</Text>
          <View style={styles.legendRow}><View style={[styles.dot, {backgroundColor:'#009688'}]}/><Text style={styles.legendLabel}>AQI</Text></View>
          <View style={styles.legendRow}><View style={[styles.dot, {backgroundColor:'#0288D1'}]}/><Text style={styles.legendLabel}>Nước</Text></View>
          <View style={styles.legendRow}><View style={[styles.dot, {backgroundColor:'#FBC02D'}]}/><Text style={styles.legendLabel}>Ồn</Text></View>
          <View style={styles.legendRow}><View style={[styles.dot, {backgroundColor:'#795548'}]}/><Text style={styles.legendLabel}>Xử lý</Text></View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', zIndex: 10
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  filterWrapper: { height: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterContainer: { paddingHorizontal: 10, alignItems: 'center', paddingRight: 20 },
  
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff', marginRight: 10,
    borderWidth: 1, borderColor: '#eee'
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  map: { flex: 1 },

  legendFloating: {
      position: 'absolute', bottom: 30, right: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 10, borderRadius: 8,
      elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
  },
  legendTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#555' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendLabel: { fontSize: 10, color: '#333' }
});

export default EnvironmentalMapScreen;