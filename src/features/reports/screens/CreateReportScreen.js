import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert, Modal, FlatList, Dimensions 
} from 'react-native';
// Import bộ icon phong phú để giống thiết kế nhất
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview'; // Thư viện hiển thị bản đồ miễn phí

// Firebase Imports
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/config/firebaseConfig'; 

// Màu sắc chuẩn theo thiết kế (Màu pastel nhẹ nhàng + Icon đậm)
const COLORS = {
  primary: '#81C784', // Xanh lá nút xác nhận
  bg: '#ffffff',
  text: '#333333',
  border: '#e0e0e0',
  // Cấu hình màu cho 3 mức độ
  low: { bg: '#FFF9C4', icon: '#FBC02D', label: '#F57F17' },     // Vàng
  medium: { bg: '#FFE0B2', icon: '#F57C00', label: '#E65100' },  // Cam
  high: { bg: '#FFCDD2', icon: '#D32F2F', label: '#B71C1C' },    // Đỏ
};

const VIOLATION_TYPES = [
  { id: '1', label: 'Rác thải bừa bãi' },
  { id: '2', label: 'Ô nhiễm không khí / Khói bụi' },
  { id: '3', label: 'Ô nhiễm nguồn nước' },
  { id: '4', label: 'Tiếng ồn quá mức' },
  { id: '5', label: 'Chặt phá cây xanh trái phép' },
  { id: '6', label: 'Khác' },
];

const CreateReportScreen = ({ navigation }) => {
  // --- STATE ---
  const [violationType, setViolationType] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  
  // Location State
  const [location, setLocation] = useState(null); // { latitude, longitude }
  const [address, setAddress] = useState('Đang định vị...');
  const [tempCoordinate, setTempCoordinate] = useState(null); // Tọa độ tạm khi chọn trên map

  const [severity, setSeverity] = useState('low'); // Mặc định Thấp
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  // 1. Tự động lấy vị trí (Logic tối ưu: Nhanh -> Chính xác)
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddress('Không có quyền truy cập vị trí');
        return;
      }

      try {
        // A. Lấy vị trí gần nhất (Hiển thị ngay lập tức)
        let lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown) {
          updateLocationState(lastKnown.coords);
        }

        // B. Lấy vị trí GPS chính xác (Cập nhật sau 1-2s)
        let current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        updateLocationState(current.coords);

      } catch (error) {
        if (!location) setAddress('Không thể lấy vị trí');
      }
    })();
  }, []);

  const updateLocationState = (coords) => {
    const { latitude, longitude } = coords;
    // Chỉ cập nhật nếu vị trí thay đổi đáng kể (tránh re-render map liên tục)
    if (!location || Math.abs(location.latitude - latitude) > 0.0001) {
      setLocation({ latitude, longitude });
      setTempCoordinate({ latitude, longitude });
      reverseGeocode(latitude, longitude);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const addr = addresses[0];
        const addressText = [addr.streetNumber, addr.street, addr.subregion, addr.region]
          .filter(Boolean).join(', ');
        setAddress(addressText || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (e) {
      setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  };

  // 2. Chọn ảnh
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Upload ảnh
  const uploadImageAsync = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () { resolve(xhr.response); };
      xhr.onerror = function (e) { reject(new TypeError("Network request failed")); };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    const filename = `reports/IMG_${Date.now()}.jpg`;
    const fileRef = ref(storage, filename);
    await uploadBytes(fileRef, blob);
    blob.close();
    return await getDownloadURL(fileRef);
  };

  // 3. Gửi báo cáo (ĐÃ CẬP NHẬT LOGIC BÁO LỖI)
  const handleSubmit = async () => {
    if (!description || !violationType) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn loại vi phạm và nhập mô tả.");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = null;
      if (imageUri) imageUrl = await uploadImageAsync(imageUri);

      const reportData = {
        violationType, description, severity,
        imageUrl: imageUrl || '',
        location: location ? { lat: location.latitude, lng: location.longitude, address } : null,
        status: 'pending', createdAt: serverTimestamp(), userId: 'guest_user',
      };

      await addDoc(collection(db, 'reports'), reportData);
      Alert.alert("Thành công", "Cảm ơn bạn đã gửi báo cáo! (+50 điểm)", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.log("Lỗi gửi báo cáo:", error); // Log ra terminal để debug
      // Hiển thị thông báo lỗi cụ thể cho người dùng
      Alert.alert("Lỗi Gửi Báo Cáo", error.message || "Đã có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // --- HTML CHO BẢN ĐỒ (OpenStreetMap) ---
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>body { margin: 0; padding: 0; } #map { width: 100%; height: 100vh; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var lat = ${location ? location.latitude : 10.762};
          var lng = ${location ? location.longitude : 106.660};
          var map = L.map('map').setView([lat, lng], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          var marker = L.marker([lat, lng]).addTo(map);
          map.on('click', function(e) {
            if (marker) map.removeLayer(marker);
            marker = L.marker(e.latlng).addTo(map);
            window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: e.latlng.lat, longitude: e.latlng.lng }));
          });
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.latitude && data.longitude) setTempCoordinate(data);
  };

  const confirmMapLocation = () => {
    if (tempCoordinate) {
      setLocation(tempCoordinate);
      reverseGeocode(tempCoordinate.latitude, tempCoordinate.longitude);
      setMapVisible(false);
    }
  };

  // --- RENDER MODAL ITEM ---
  const renderModalItem = ({ item }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => { setViolationType(item.label); setModalVisible(false); }}>
      <Text style={styles.modalItemText}>{item.label}</Text>
      {violationType === item.label && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo báo cáo</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Loại Vi Phạm */}
        <Text style={styles.label}>Loại Vi Phạm</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setModalVisible(true)}>
          <Text style={[styles.inputText, !violationType && { color: '#999' }]}>
            {violationType || 'Chọn loại vi phạm'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {/* Mô tả */}
        <Text style={styles.label}>Mô tả</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Mô tả chi tiết vi phạm môi trường..."
            multiline={true} numberOfLines={4}
            value={description} onChangeText={setDescription} textAlignVertical="top"
          />
        </View>

        {/* Bằng chứng */}
        <Text style={styles.label}>Bằng chứng (Ảnh/Video)</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <FontAwesome5 name="camera" size={32} color="#999" />
            </View>
          )}
        </TouchableOpacity>

        {/* Vị trí hiện tại (Card hiển thị) */}
        <Text style={styles.label}>Vị trí hiện tại</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationInfo}>
            <View style={styles.locationIconBg}>
                <Ionicons name="location-sharp" size={24} color="#000" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.locationTitle}>Vị trí hiện tại</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>{address}</Text>
            </View>
          </View>
        </View>

        {/* Nút Chọn từ Bản đồ */}
        <TouchableOpacity style={styles.mapButton} onPress={() => setMapVisible(true)}>
          <Ionicons name="map-outline" size={20} color="#333" />
          <Text style={styles.mapButtonText}>Chọn từ Bản đồ</Text>
        </TouchableOpacity>

        {/* Mức Độ Nghiêm Trọng */}
        <Text style={styles.label}>Mức Độ Nghiêm Trọng</Text>
        <View style={styles.severityContainer}>
          {/* Thấp - Icon Cảnh báo tam giác (Vàng) */}
          <TouchableOpacity 
            style={[styles.severityBox, { backgroundColor: COLORS.low.bg, borderWidth: severity === 'low' ? 2 : 0, borderColor: COLORS.low.icon }]}
            onPress={() => setSeverity('low')}
          >
            <Ionicons name="warning" size={24} color={COLORS.low.icon} />
            <Text style={styles.severityText}>Thấp</Text>
          </TouchableOpacity>

          {/* Trung bình - Icon Hình thoi (Cam) */}
          <TouchableOpacity 
            style={[styles.severityBox, { backgroundColor: COLORS.medium.bg, borderWidth: severity === 'medium' ? 2 : 0, borderColor: COLORS.medium.icon }]}
            onPress={() => setSeverity('medium')}
          >
            <MaterialCommunityIcons name="cards-diamond" size={24} color={COLORS.medium.icon} />
            <Text style={styles.severityText}>Trung bình</Text>
          </TouchableOpacity>

          {/* Cao - Icon Còi báo động (Đỏ) */}
          <TouchableOpacity 
            style={[styles.severityBox, { backgroundColor: COLORS.high.bg, borderWidth: severity === 'high' ? 2 : 0, borderColor: COLORS.high.icon }]}
            onPress={() => setSeverity('high')}
          >
            <MaterialCommunityIcons name="alarm-light" size={24} color={COLORS.high.icon} />
            <Text style={styles.severityText}>Cao</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Xác Nhận */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Xác Nhận</Text>}
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Ionicons name="star" size={16} color="#fbc02d" />
          <Text style={styles.footerText}> Nhận 50 điểm khi gửi báo cáo</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal Chọn Loại Vi Phạm */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList data={VIOLATION_TYPES} keyExtractor={item => item.id} renderItem={renderModalItem} />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Bản đồ (WebView) */}
      <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
        <View style={{flex: 1, backgroundColor: '#fff'}}>
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                style={{flex: 1}}
                onMessage={handleWebViewMessage}
            />
            <View style={styles.mapActions}>
                <TouchableOpacity style={styles.mapCloseBtn} onPress={() => setMapVisible(false)}>
                    <Text style={{color: '#d32f2f', fontWeight: 'bold'}}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapConfirmBtn} onPress={confirmMapLocation}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Xác nhận vị trí</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: '500' },
  content: { padding: 20 },
  label: { fontSize: 16, marginBottom: 8, marginTop: 15, fontWeight: '500', color: '#333' },
  
  inputContainer: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  inputText: { fontSize: 14, color: '#333' },
  
  textAreaContainer: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, height: 100, padding: 10,
  },
  textArea: { fontSize: 14, color: '#333', height: '100%' },
  
  uploadBox: {
    height: 150, borderWidth: 1.5, borderColor: '#ccc', borderStyle: 'dashed',
    borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9'
  },
  previewImage: { width: '100%', height: '100%', borderRadius: 8 },
  uploadPlaceholder: { alignItems: 'center' },
  
  // Location Card Style
  locationCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 10 },
  locationInfo: { flexDirection: 'row', alignItems: 'center' },
  locationIconBg: {
      // Không cần nền tròn trong thiết kế mới nhất, chỉ icon
  },
  locationTitle: { fontWeight: '500', fontSize: 14 },
  locationAddress: { color: '#666', fontSize: 12, marginTop: 2 },
  
  // Map Button Style
  mapButton: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 25, paddingVertical: 10,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', marginBottom: 5
  },
  mapButtonText: { marginLeft: 8, fontWeight: '500', color: '#333' },

  // Severity Styles
  severityContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  severityBox: { 
      width: '30%', aspectRatio: 1, borderRadius: 12, 
      justifyContent: 'center', alignItems: 'center',
      // Mặc định không có border, border sẽ được thêm khi active
  },
  severityText: { marginTop: 8, fontWeight: '600', fontSize: 13, color: '#333' },
  
  submitButton: {
    backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 15, marginTop: 30,
    alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  footerText: { color: '#888', fontSize: 12 },
  
  // Modal & Map Actions
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' },
  modalItemText: { fontSize: 16, color: '#333' },
  
  mapActions: { 
      height: 80, flexDirection: 'row', alignItems: 'center', 
      justifyContent: 'space-around', borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' 
  },
  mapCloseBtn: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8, borderWidth: 1, borderColor: '#d32f2f' },
  mapConfirmBtn: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8, backgroundColor: COLORS.primary }
});

export default CreateReportScreen;