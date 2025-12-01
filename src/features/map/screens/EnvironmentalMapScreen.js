import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { fetchAqiDataByCoords } from '@/features/aqi/api/aqiApi';

// --- CONFIG ---
const FILTERS = [
  { id: 'aqi', label: 'Chỉ số AQI', icon: 'weather-windy', color: '#009688', lib: MaterialCommunityIcons },
  { id: 'all', label: 'Tất cả điểm', icon: 'map-marker-multiple', color: '#ae5663ff', lib: MaterialCommunityIcons },
  { id: 'waste', label: 'Điểm vi phạm', icon: 'alert-circle', color: '#EF5350', lib: MaterialCommunityIcons }, 
  { id: 'e_waste', label: 'Điện tử', icon: 'desktop', color: '#5C6BC0', lib: FontAwesome5 }, 
  { id: 'paper', label: 'Giấy', icon: 'newspaper', color: '#FFCA28', lib: MaterialCommunityIcons }, 
  { id: 'organic', label: 'Hữu cơ', icon: 'leaf', color: '#66BB6A', lib: FontAwesome5 }, 
  { id: 'metal', label: 'Kim loại', icon: 'tools', color: '#78909C', lib: FontAwesome5 }, 
  { id: 'plastic', label: 'Nhựa', icon: 'bottle-soda', color: '#29B6F6', lib: MaterialCommunityIcons }, 
  { id: 'glass', label: 'Thủy tinh', icon: 'glass-wine', color: '#AB47BC', lib: MaterialCommunityIcons }, 
];

const STATIC_POINTS = [
  { id: 's1', lat: 10.762622, lng: 106.660172, type: 'e_waste', title: 'Thu Gom Pin & ĐT Cũ', desc: 'Nhận pin, điện thoại, laptop hỏng' },
  { id: 's2', lat: 10.770000, lng: 106.690000, type: 'paper', title: 'Trạm Giấy Vụn Q1', desc: 'Thu mua sách báo cũ, bìa carton' },
  { id: 's3', lat: 10.755000, lng: 106.670000, type: 'plastic', title: 'Tái Chế Nhựa', desc: 'Chai nhựa, hộp nhựa sạch' },
  { id: 's4', lat: 10.780000, lng: 106.650000, type: 'organic', title: 'Ủ Phân Hữu Cơ', desc: 'Nhận rau củ quả thừa làm phân bón' },
  { id: 's5', lat: 10.765000, lng: 106.680000, type: 'glass', title: 'Thu Hồi Thủy Tinh', desc: 'Chai lọ thủy tinh nguyên vẹn' },
  { id: 's6', lat: 10.790000, lng: 106.700000, type: 'plastic', title: 'Trạm Nhựa Bình Thạnh', desc: 'Nhựa cứng, nhựa mềm' },
  { id: 's7', lat: 10.750000, lng: 106.630000, type: 'metal', title: 'Vựa Ve Chai Q8', desc: 'Sắt vụn, lon bia' },
  { id: 's8', lat: 10.800000, lng: 106.620000, type: 'e_waste', title: 'Điểm thu hồi Pin Tân Bình', desc: 'Pin các loại' },
  { id: 's9', lat: 10.775000, lng: 106.710000, type: 'paper', title: 'Giấy Quận 2', desc: 'Báo cũ' },
  { id: 's10', lat: 10.740000, lng: 106.680000, type: 'organic', title: 'Trạm ủ phân Q7', desc: 'Rác thực phẩm' }
];

const EnvironmentalMapScreen = ({ navigation, route }) => {
  const mapFilterId = (id) => {
      if (!id) return 'all';
      const mapping = { 'dientu': 'e_waste', 'nhua': 'plastic', 'giay': 'paper', 'kimloai': 'metal', 'huuco': 'organic', 'thuytinh': 'glass' };
      return mapping[id] || 'all';
  };

  const { initialFilter, initialPoints } = route.params || {};
  const [activeFilter, setActiveFilter] = useState(initialFilter ? mapFilterId(initialFilter) : 'aqi');
  const [userLocation, setUserLocation] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // ✅ STATE MỚI: Kiểm tra map đã load xong chưa
  const [isMapReady, setIsMapReady] = useState(false);

  const webViewRef = useRef(null);

  // 1. Lấy vị trí
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }
    })();
  }, []);

  // 2. Hàm lấy AQI thật
  const fetchRealAqiPoints = async (centerLat, centerLng) => {
      setLoadingData(true);
      
      // Hàm sinh số ngẫu nhiên trong khoảng [min, max]
      const randomRange = (min, max) => Math.random() * (max - min) + min;

      // Tạo 5 điểm xung quanh với vị trí hơi lệch một chút (Random)
      // Delta 0.015 ~ 1.5km
      const offsets = [
          { dx: 0, dy: 0, label: "Vị trí của bạn" }, // Điểm tâm giữ nguyên
          { dx: randomRange(0.01, 0.02), dy: randomRange(0.01, 0.02), },
          { dx: randomRange(-0.02, -0.06), dy: randomRange(-0.02, -0.01), },
          { dx: randomRange(0.09, 0.02), dy: randomRange(-0.02, -0.01),  },
          { dx: randomRange(-0.02, -0.01), dy: randomRange(0.01, 0.02), },
      ];

      try {
          const promises = offsets.map(async (offset, index) => {
              const lat = centerLat + offset.dy;
              const lng = centerLng + offset.dx;
              try {
                  const data = await fetchAqiDataByCoords(lat, lng);
                  if (data && data.list && data.list.length > 0) {
                      const pm25 = data.list[0].components.pm2_5;
                      
                      // Random nhẹ giá trị hiển thị để các điểm gần nhau không bị trùng số y hệt
                      // Ví dụ: PM2.5 thật là 20 -> AQI hiển thị dao động từ 65-75
                      const variation = Math.floor(Math.random() * 10) - 5; 
                      const displayAqi = Math.max(10, Math.round(pm25 * 3.5) + variation); 

                      return {
                          id: `real_aqi_${index}`, lat, lng, type: 'aqi',
                          val: displayAqi, title: offset.label, desc: `PM2.5: ${pm25.toFixed(1)} µg/m³`
                      };
                  }
                  throw new Error("No Data");
              } catch (e) { 
                  // Fallback ngẫu nhiên nếu API lỗi
                  return { 
                      id: `mock_${index}`, lat, lng, type: 'aqi', 
                      val: Math.floor(randomRange(30, 180)), // Random từ Tốt đến Kém
                      title: offset.label, desc: 'Dữ liệu mô phỏng'
                  }; 
              }
          });
          const results = await Promise.all(promises);
          setMapPoints(results.filter(p => p !== null));
      } catch (error) { console.error(error); } 
      finally { setLoadingData(false); }
  };

  // 3. Logic Load Data
  useEffect(() => {
      if (initialPoints && initialPoints.length > 0 && activeFilter === mapFilterId(route.params?.initialFilter)) {
          const customPoints = initialPoints.map((p, i) => ({
              id: `c_${i}`, lat: p.lat || 10.762, lng: p.lng || 106.660,
              type: initialFilter || 'waste', title: p.name, desc: p.address
          }));
          setMapPoints(customPoints);
          return;
      }

      if (activeFilter === 'aqi') {
          if (userLocation) fetchRealAqiPoints(userLocation.latitude, userLocation.longitude);
          return;
      }

      const q = query(collection(db, 'reports'), where('status', '==', 'approved'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reportPoints = snapshot.docs.map(doc => {
            const data = doc.data();
            if (data.location?.lat) {
                return {
                    id: doc.id, lat: data.location.lat, lng: data.location.lng,
                    type: 'waste', title: 'Điểm vi phạm', desc: data.violationType
                };
            }
            return null;
        }).filter(Boolean);
        setMapPoints([...STATIC_POINTS, ...reportPoints]);
      });
      return () => unsubscribe();
  }, [activeFilter, initialPoints, userLocation]);

  // 4. ✅ Cập nhật Map (CHỈ KHI MAP READY)
  useEffect(() => {
    if (isMapReady && webViewRef.current) {
        console.log("Gửi dữ liệu xuống Map:", mapPoints.length, "điểm");
        const dataStr = JSON.stringify(mapPoints);
        const filterToSend = initialPoints ? 'all' : activeFilter;
        
        // Sử dụng postMessage thay vì gọi hàm trực tiếp để ổn định hơn
        webViewRef.current.postMessage(JSON.stringify({
            type: 'UPDATE_MARKERS',
            points: mapPoints,
            filter: filterToSend
        }));
    }
  }, [mapPoints, activeFilter, isMapReady]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style> body { margin: 0; } #map { width: 100%; height: 100vh; } </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {zoomControl: false}).setView([${userLocation ? userLocation.latitude : 10.762}, ${userLocation ? userLocation.longitude : 106.660}], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        var markersLayer = L.layerGroup().addTo(map);

        function getAqiColor(val) {
            if(val <= 50) return '#00E400'; 
            if(val <= 100) return '#FFFF00'; 
            if(val <= 150) return '#FF7E00'; 
            if(val <= 200) return '#FF0000'; 
            return '#8F3F97'; 
        }

        function getWasteColor(type) {
            switch(type) {
                case 'e_waste': return '#5C6BC0';
                case 'plastic': return '#29B6F6';
                case 'organic': return '#66BB6A';
                case 'waste': return '#EF5350';
                default: return '#7F8C8D';
            }
        }

        // Hàm vẽ chính
        function renderMarkers(points, filter) {
          markersLayer.clearLayers();
          var bounds = L.latLngBounds();
          var hasPoints = false;

          points.forEach(function(p) {
            if (filter === 'aqi') {
                if (p.type !== 'aqi') return;
            } else {
                if (filter === 'all' && p.type === 'aqi') return;
                if (filter !== 'all' && p.type !== filter) return;
            }

            var icon;
            if (p.type === 'aqi') {
                var color = getAqiColor(p.val);
                var textColor = (p.val > 50 && p.val <= 100) ? 'black' : 'white';
                var html = '<div style="background:'+color+';color:'+textColor+';width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;font-weight:bold;font-family:sans-serif;font-size:12px;box-shadow:0 2px 4px rgba(0,0,0,0.3);">'+p.val+'</div>';
                icon = L.divIcon({ className: '', html: html, iconSize: [38, 38] });
            } else {
                var color = getWasteColor(p.type);
                var html = '<div style="background:'+color+';width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>';
                icon = L.divIcon({ className: '', html: html, iconSize: [20, 20] });
            }

            L.marker([p.lat, p.lng], {icon: icon})
              .bindPopup('<b>'+p.title+'</b><br>'+(p.desc||''))
              .addTo(markersLayer);
            
            bounds.extend([p.lat, p.lng]);
            hasPoints = true;
          });

          if (hasPoints) map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Lắng nghe tin nhắn từ React Native
        document.addEventListener("message", function(event) {
            try {
                var data = JSON.parse(event.data);
                if (data.type === 'UPDATE_MARKERS') {
                    renderMarkers(data.points, data.filter);
                }
            } catch(e) {}
        });
        
        // Dành cho iOS (window.ReactNativeWebView)
        window.addEventListener("message", function(event) {
             try {
                var data = JSON.parse(event.data);
                if (data.type === 'UPDATE_MARKERS') {
                    renderMarkers(data.points, data.filter);
                }
            } catch(e) {}
        });

      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{initialPoints ? "Địa điểm" : "Bản đồ Môi trường"}</Text>
        <View style={{width:24}}/>
      </View>

      {!initialPoints && (
          <View style={styles.filterWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{padding: 10}}>
                {FILTERS.map((f) => (
                    <TouchableOpacity 
                        key={f.id} 
                        style={[styles.chip, activeFilter === f.id && { backgroundColor: f.color, borderColor: f.color }]}
                        onPress={() => setActiveFilter(f.id)}
                    >
                        <f.lib name={f.icon} size={16} color={activeFilter === f.id ? '#fff' : f.color} style={{marginRight:6}}/>
                        <Text style={[styles.chipText, activeFilter === f.id && {color:'#fff'}]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
      )}

      {loadingData && <ActivityIndicator size="small" color="#27AE60" style={{position:'absolute', top:120, zIndex:10, alignSelf:'center'}} />}

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={{ flex: 1 }}
        // ✅ Bắt sự kiện Load xong
        onLoadEnd={() => setIsMapReady(true)}
      />
      
      <View style={styles.legend}>
          <Text style={{fontSize:12, fontWeight:'bold', color:'#333'}}>
             {activeFilter === 'aqi' ? "🟢 Tốt  🟡 TB  🔴 Xấu" : "🔵 Điểm thu gom  🔴 Điểm vi phạm"}
          </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 10, paddingHorizontal: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  filterWrap: { height: 60 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  chipText: { fontWeight: '600', fontSize: 13, color: '#555' },
  legend: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 20, elevation: 5 }
});

export default EnvironmentalMapScreen;