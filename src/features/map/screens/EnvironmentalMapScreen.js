import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Import Firebase
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

// Dữ liệu tĩnh (Giả lập các trạm cố định)
const STATIC_POINTS = [
  { id: 'static_1', lat: 10.762622, lng: 106.660172, type: 'recycle', title: 'Trạm Tái Chế Q5', desc: 'Thu gom nhựa, giấy' },
  { id: 'static_2', lat: 10.775000, lng: 106.700000, type: 'air', title: 'Trạm Quan Trắc', desc: 'AQI: 85 (Trung bình)' },
];

const FILTERS = [
  { id: 'all', label: 'Tất cả', icon: 'map' },
  { id: 'recycle', label: 'Tái chế', icon: 'recycle' },
  { id: 'waste', label: 'Bãi rác', icon: 'trash' }, // Dữ liệu từ báo cáo vi phạm
  { id: 'air', label: 'Không khí', icon: 'wind' },
];

const EnvironmentalMapScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [mapPoints, setMapPoints] = useState(STATIC_POINTS);
  const webViewRef = useRef(null);

  // 1. Lấy vị trí người dùng
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  // 2. Lấy dữ liệu Báo cáo đã duyệt từ Firebase
  useEffect(() => {
    const q = query(
        collection(db, 'reports'), 
        where('status', '==', 'approved') // Chỉ lấy báo cáo đã duyệt
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const reportPoints = snapshot.docs
            .map(doc => {
                const data = doc.data();
                // Chỉ lấy những báo cáo có toạ độ
                if (data.location && data.location.lat && data.location.lng) {
                    return {
                        id: doc.id,
                        lat: data.location.lat,
                        lng: data.location.lng,
                        type: 'waste', // Loại "Bãi rác/Ô nhiễm"
                        title: data.violationType || 'Vi phạm môi trường',
                        desc: data.description || 'Được báo cáo bởi cộng đồng'
                    };
                }
                return null;
            })
            .filter(item => item !== null);

        // Gộp dữ liệu tĩnh và dữ liệu báo cáo
        setMapPoints([...STATIC_POINTS, ...reportPoints]);
    });

    return () => unsubscribe();
  }, []);

  // 3. Cập nhật bản đồ khi dữ liệu hoặc bộ lọc thay đổi
  useEffect(() => {
    if (webViewRef.current) {
        const dataToSend = JSON.stringify(mapPoints);
        // Gọi hàm updateMarkers trong WebView
        webViewRef.current.injectJavaScript(`
            if (window.updateMarkers) {
                window.updateMarkers(${dataToSend}, '${activeFilter}');
            }
            true;
        `);
    }
  }, [mapPoints, activeFilter]);

  // HTML Bản đồ (OpenStreetMap + Leaflet)
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Khởi tạo bản đồ
        var map = L.map('map', {zoomControl: false}).setView([${userLocation ? userLocation.latitude : 10.762}, ${userLocation ? userLocation.longitude : 106.660}], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // Layer chứa các marker
        var markersLayer = L.layerGroup().addTo(map);

        // Marker vị trí người dùng
        var userLat = ${userLocation ? userLocation.latitude : 'null'};
        var userLng = ${userLocation ? userLocation.longitude : 'null'};
        if (userLat && userLng) {
           var userIcon = L.divIcon({
              html: '<div style="background-color: #3498DB; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.3);"></div>',
              className: 'user-pin',
              iconSize: [14, 14]
           });
           L.marker([userLat, userLng], {icon: userIcon}).addTo(map).bindPopup("Vị trí của bạn");
        }

        // Hàm lấy màu theo loại
        function getColor(type) {
          if (type === 'recycle') return '#27AE60'; // Xanh lá
          if (type === 'waste') return '#E74C3C';   // Đỏ
          if (type === 'air') return '#3498DB';     // Xanh dương
          return '#7F8C8D';
        }

        // Hàm cập nhật markers (được gọi từ React Native)
        window.updateMarkers = function(points, filter) {
          markersLayer.clearLayers(); // Xóa cũ

          points.forEach(function(p) {
            if (filter !== 'all' && p.type !== filter) return;

            var color = getColor(p.type);
            var iconHtml = '<div style="background-color: '+color+'; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>';
            
            var icon = L.divIcon({
              className: 'custom-pin',
              html: iconHtml,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            var popupContent = '<div style="text-align: center;"><b>'+p.title+'</b><br><span style="color: #666; font-size: 12px;">'+p.desc+'</span></div>';

            L.marker([p.lat, p.lng], {icon: icon})
              .bindPopup(popupContent)
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
        <TouchableOpacity style={styles.infoButton} onPress={() => Alert.alert("Chú thích", "Xanh: Điểm tái chế\nĐỏ: Điểm ô nhiễm (Report)\nXanh dương: Trạm không khí")}>
            <Ionicons name="help-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
                <TouchableOpacity 
                    key={f.id} 
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setActiveFilter(f.id)}
                >
                    <FontAwesome5 
                        name={f.icon} 
                        size={13} 
                        color={isActive ? '#fff' : '#555'} 
                        style={{marginRight: 6}} 
                    />
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                        {f.label}
                    </Text>
                </TouchableOpacity>
            )
        })}
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
            // Gửi dữ liệu lần đầu khi map load xong
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
  
  filterContainer: {
    flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10,
    backgroundColor: '#fff', zIndex: 5, height: 60
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#F0F2F5', marginRight: 10,
    height: 36
  },
  filterChipActive: { backgroundColor: '#27AE60' },
  filterText: { fontSize: 13, color: '#555', fontWeight: '500' },
  filterTextActive: { color: '#fff' },

  map: { flex: 1 },
});

export default EnvironmentalMapScreen;