import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert, Modal, FlatList, Dimensions 
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Sử dụng WebView thay vì MapView để dùng OpenStreetMap miễn phí
import { WebView } from 'react-native-webview';

// Firebase Imports
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Import file config
import { db, storage } from 'src/config/firebaseConfig'; 

const COLORS = {
  primary: '#81C784', 
  bg: '#ffffff',
  text: '#333333',
  border: '#e0e0e0',
  low: { bg: '#FFF9C4', icon: '#FBC02D', label: '#F57F17' },     
  medium: { bg: '#FFE0B2', icon: '#F57C00', label: '#E65100' },  
  high: { bg: '#FFCDD2', icon: '#D32F2F', label: '#B71C1C' },    
};

const VIOLATION_TYPES = [
  { id: '1', label: 'Rác thải bừa bãi' },
  { id: '2', label: 'Ô nhiễm không khí / Khói bụi' },
  { id: '3', label: 'Ô nhiễm nguồn nước' },
  { id: '4', label: 'Tiếng ồn quá mức' },
  { id: '5', label: 'Chặt phá cây xanh trái phép' },
  { id: '6', label: 'Khác' },
];

const { width, height } = Dimensions.get('window');

const CreateReportScreen = ({ navigation }) => {
  // --- STATE ---
  const [violationType, setViolationType] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null); 
  const [address, setAddress] = useState('Đang định vị...');
  const [severity, setSeverity] = useState('low'); 
  
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); 
  const [mapVisible, setMapVisible] = useState(false);    

  const [tempCoordinate, setTempCoordinate] = useState(null);
  
  // Ref để điều khiển WebView
  const webViewRef = useRef(null);

  // 1. Hàm lấy vị trí (Cập nhật: Lấy nhanh + Lấy chính xác)
  const getCurrentLocation = async () => {
    setAddress('Đang định vị...');
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setAddress('Vui lòng cấp quyền vị trí');
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền vị trí để xác định địa điểm.');
      return;
    }

    try {
      let lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown) {
         updateLocationState(lastKnown.coords);
      }

      let current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      updateLocationState(current.coords);
      
    } catch (error) {
      console.log("Lỗi lấy vị trí:", error);
      if (!location) setAddress('Không thể lấy vị trí. Nhấn làm mới để thử lại.');
    }
  };

  const updateLocationState = (coords) => {
      const { latitude, longitude } = coords;
      setLocation({ latitude, longitude });
      setTempCoordinate({ latitude, longitude }); 
      reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const addr = addresses[0];
        const addressText = [addr.streetNumber, addr.street, addr.subregion, addr.region]
          .filter(Boolean)
          .join(', ');
        setAddress(addressText || `Toạ độ: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (e) {
      setAddress(`Khu vực ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

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

  // 3. Gửi báo cáo
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
      Alert.alert("Thành công", "Cảm ơn bạn đã gửi báo cáo! (+50 điểm)", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.latitude && data.longitude) {
      setTempCoordinate(data);
    }
  };

  const handleConfirmMapLocation = () => {
    if (tempCoordinate) {
      setLocation(tempCoordinate);
      reverseGeocode(tempCoordinate.latitude, tempCoordinate.longitude);
      setMapVisible(false);
    }
  };

  // --- HÀM XỬ LÝ NÚT "VỊ TRÍ CỦA TÔI" TRÊN BẢN ĐỒ ---
  const handleLocateMeOnMap = async () => {
    // 1. Lấy vị trí GPS mới nhất
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    try {
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = current.coords;

      // 2. Cập nhật state tạm
      setTempCoordinate({ latitude, longitude });

      // 3. Gửi lệnh vào WebView để di chuyển bản đồ (Inject JS)
      const injectScript = `
        window.updateMapCenter(${latitude}, ${longitude});
        true;
      `;
      webViewRef.current.injectJavaScript(injectScript);

    } catch (error) {
      Alert.alert("Lỗi", "Không thể xác định vị trí của bạn.");
    }
  };

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

          // Hàm này được gọi từ React Native khi bấm nút "Vị trí của tôi"
          window.updateMapCenter = function(newLat, newLng) {
            var newLatLng = new L.LatLng(newLat, newLng);
            map.setView(newLatLng, 16); // Zoom gần hơn chút
            if (marker) map.removeLayer(marker);
            marker = L.marker(newLatLng).addTo(map);
            // Gửi ngược lại tọa độ về app để cập nhật state
            window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: newLat, longitude: newLng }));
          };
        </script>
      </body>
    </html>
  `;

  const renderModalItem = ({ item }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => { setViolationType(item.label); setModalVisible(false); }}>
      <Text style={styles.modalItemText}>{item.label}</Text>
      {violationType === item.label && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo báo cáo</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Loại Vi Phạm</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setModalVisible(true)}>
          <Text style={[styles.inputText, !violationType && { color: '#999' }]}>{violationType || 'Chọn loại vi phạm'}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Text style={styles.label}>Mô tả</Text>
        <View style={styles.textAreaContainer}>
          <TextInput style={styles.textArea} placeholder="Mô tả chi tiết..." multiline numberOfLines={4} value={description} onChangeText={setDescription} textAlignVertical="top" />
        </View>

        <Text style={styles.label}>Bằng chứng</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" /> : <FontAwesome5 name="camera" size={32} color="#999" />}
        </TouchableOpacity>

        <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center', marginTop: 20, marginBottom: 10}}>
           <Text style={styles.labelNoMargin}>Vị trí hiện tại</Text>
           <TouchableOpacity onPress={getCurrentLocation}><Ionicons name="refresh-circle" size={24} color={COLORS.primary} /></TouchableOpacity>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationInfoBox}>
            <View style={styles.locationIconWrapper}><Ionicons name="location-sharp" size={24} color="#000" /></View>
            <View style={styles.locationTexts}>
              <Text style={styles.locationTitle}>Vị trí đã chọn</Text>
              <Text style={styles.locationAddress} numberOfLines={2}>{address}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.mapButton} onPress={() => setMapVisible(true)}>
          <Ionicons name="map-outline" size={20} color="#333" />
          <Text style={styles.mapButtonText}>Chọn từ Bản đồ (Mới)</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Mức Độ Nghiêm Trọng</Text>
        <View style={styles.severityContainer}>
          {['low', 'medium', 'high'].map(level => (
            <TouchableOpacity 
              key={level}
              style={[styles.severityBox, { backgroundColor: COLORS[level].bg, borderWidth: severity === level ? 2 : 0, borderColor: severity === level ? COLORS[level].label : 'transparent' }]}
              onPress={() => setSeverity(level)}
            >
              {level === 'low' && <Ionicons name="warning" size={24} color={COLORS[level].label} />}
              {level === 'medium' && <MaterialCommunityIcons name="cards-diamond" size={24} color={COLORS[level].label} />}
              {level === 'high' && <MaterialCommunityIcons name="alarm-light" size={24} color={COLORS[level].label} />}
              <Text style={[styles.severityText, { color: '#333' }]}>{level === 'low' ? 'Thấp' : level === 'medium' ? 'Trung bình' : 'Cao'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Xác Nhận</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal Dropdown */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <FlatList data={VIOLATION_TYPES} keyExtractor={item => item.id} renderItem={renderModalItem} />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Map */}
      <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef} // Gắn ref vào đây
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.map}
            onMessage={handleWebViewMessage}
          />
          
          {/* NÚT VỊ TRÍ CỦA TÔI */}
          <TouchableOpacity style={styles.myLocationButton} onPress={handleLocateMeOnMap}>
            <MaterialIcons name="my-location" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.mapActions}>
            <TouchableOpacity style={styles.mapCloseBtn} onPress={() => setMapVisible(false)}>
              <Text style={{color: '#d32f2f', fontWeight: 'bold'}}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapConfirmBtn} onPress={handleConfirmMapLocation}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: '500', color: '#000' },
  content: { padding: 20 },
  label: { fontSize: 16, marginBottom: 10, marginTop: 20, fontWeight: '400', color: '#333' },
  labelNoMargin: { fontSize: 16, fontWeight: '400', color: '#333' },
  inputContainer: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  inputText: { fontSize: 14, color: '#333' },
  textAreaContainer: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, height: 100, padding: 10, backgroundColor: '#fff' },
  textArea: { fontSize: 14, color: '#333', height: '100%' },
  uploadBox: { height: 150, borderWidth: 1.5, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  previewImage: { width: '100%', height: '100%', borderRadius: 8 },
  locationContainer: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  locationInfoBox: { flexDirection: 'row', alignItems: 'center' },
  locationIconWrapper: { marginRight: 12 },
  locationTexts: { flex: 1 },
  locationTitle: { fontWeight: '600', fontSize: 14, color: '#000' },
  locationAddress: { color: '#777', fontSize: 13, marginTop: 2 },
  mapButton: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 25, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  mapButtonText: { marginLeft: 8, fontWeight: '500', color: '#333', fontSize: 14 },
  severityContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  severityBox: { width: '30%', aspectRatio: 1, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  severityText: { marginTop: 8, fontWeight: '500', fontSize: 13 },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, marginTop: 30, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 5 },
  modalItem: { paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' },
  modalItemText: { fontSize: 16, color: '#333' },
  
  // MAP STYLES
  mapContainer: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  mapActions: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  mapCloseBtn: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, borderWidth: 1, borderColor: '#d32f2f' },
  mapConfirmBtn: { paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, backgroundColor: COLORS.primary },
  
  // Style cho nút Vị trí của tôi
  myLocationButton: {
    position: 'absolute',
    bottom: 100, // Nằm trên thanh action bar
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});

export default CreateReportScreen;