import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

// --- CẤU HÌNH DANH MỤC (Giống ảnh bạn gửi) ---
const FILTERS = [
  { id: 'all', label: 'Tất cả', icon: 'map-marker-multiple', color: '#555', lib: MaterialCommunityIcons },
  { id: 'e_waste', label: 'Điện tử', icon: 'desktop', color: '#5C6BC0', lib: FontAwesome5 }, // Xanh tím
  { id: 'paper', label: 'Giấy', icon: 'newspaper', color: '#FFCA28', lib: MaterialCommunityIcons }, // Vàng
  { id: 'organic', label: 'Hữu cơ', icon: 'leaf', color: '#66BB6A', lib: FontAwesome5 }, // Xanh lá nhạt
  { id: 'metal', label: 'Kim loại', icon: 'tools', color: '#78909C', lib: FontAwesome5 }, // Xám xanh
  { id: 'plastic', label: 'Nhựa', icon: 'bottle-soda', color: '#29B6F6', lib: MaterialCommunityIcons }, // Xanh dương sáng
  { id: 'glass', label: 'Thủy tinh', icon: 'glass-wine', color: '#AB47BC', lib: MaterialCommunityIcons }, // Tím
  { id: 'waste', label: 'Bãi rác', icon: 'trash', color: '#EF5350', lib: FontAwesome5 }, // Đỏ (Dữ liệu từ Report)
];

// Dữ liệu tĩnh giả lập (Các điểm thu gom cố định)
const STATIC_POINTS = [
  { id: 's1', lat: 10.762622, lng: 106.660172, type: 'e_waste', title: 'Thu Gom Pin & ĐT Cũ', desc: 'Nhận pin, điện thoại, laptop hỏng' },
  { id: 's2', lat: 10.770000, lng: 106.690000, type: 'paper', title: 'Trạm Giấy Vụn Q1', desc: 'Thu mua sách báo cũ, bìa carton' },
  { id: 's3', lat: 10.755000, lng: 106.670000, type: 'plastic', title: 'Tái Chế Nhựa', desc: 'Chai nhựa, hộp nhựa sạch' },
  { id: 's4', lat: 10.780000, lng: 106.650000, type: 'organic', title: 'Ủ Phân Hữu Cơ', desc: 'Nhận rau củ quả thừa làm phân bón' },
  { id: 's5', lat: 10.765000, lng: 106.680000, type: 'glass', title: 'Thu Hồi Thủy Tinh', desc: 'Chai lọ thủy tinh nguyên vẹn' },
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

  // 2. Lắng nghe Báo cáo vi phạm (Points động từ người dùng)
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
                        type: 'waste', // Mặc định báo cáo vi phạm là "Bãi rác"
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

  // 3. Cập nhật WebView
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

  // HTML Map (Leaflet JS)
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
              html: '<div style="background-color: #2980B9; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 4px rgba(41, 128, 185, 0.3);"></div>',
              className: 'user-pin',
              iconSize: [14, 14]
           });
           L.marker([userLat, userLng], {icon: userIcon}).addTo(map).bindPopup("Bạn ở đây");
        }

        function getColor(type) {
          switch(type) {
            case 'e_waste': return '#5C6BC0';
            case 'paper': return '#FFCA28';
            case 'organic': return '#66BB6A';
            case 'metal': return '#78909C';
            case 'plastic': return '#29B6F6';
            case 'glass': return '#AB47BC';
            case 'waste': return '#EF5350';
            default: return '#7F8C8D';
          }
        }

        window.updateMarkers = function(points, filter) {
          markersLayer.clearLayers();
          points.forEach(function(p) {
            if (filter !== 'all' && p.type !== filter) return;
            
            var color = getColor(p.type);
            var iconHtml = '<div style="background-color: '+color+'; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>';
            
            var icon = L.divIcon({ className: 'custom-pin', html: iconHtml, iconSize: [24, 24], iconAnchor: [12, 12] });
            
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
                        style={[styles.filterChip, isActive && { backgroundColor: f.color }]}
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
        renderLoading={() => <ActivityIndicator size="large" color="#27AE60" style={{position:'absolute', top:'50%', left:'50%'}} />}
        onLoadEnd={() => {
            if (webViewRef.current) {
                const dataToSend = JSON.stringify(mapPoints);
                webViewRef.current.injectJavaScript(`window.updateMarkers(${dataToSend}, '${activeFilter}'); true;`);
            }
        }}
      />
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
  filterContainer: { paddingHorizontal: 15, alignItems: 'center' },
  
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#F5F7FA', marginRight: 10,
    borderWidth: 1, borderColor: '#eee'
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  map: { flex: 1 },
});

export default EnvironmentalMapScreen;