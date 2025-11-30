import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert, Modal, FlatList, Dimensions 
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'; // Thêm getDoc
import { db, storage, auth } from '../../../config/firebaseConfig'; 

// [XÓA] Không cần mảng ADMIN_IDS cứng nữa
// const ADMIN_IDS = ["..."]; 

const COLORS = {
  primary: '#81C784', 
  bg: '#ffffff', text: '#333', border: '#e0e0e0',
  low: { bg: '#FFF9C4', icon: '#FBC02D', label: '#F57F17' },     
  medium: { bg: '#FFE0B2', icon: '#F57C00', label: '#E65100' },  
  high: { bg: '#FFCDD2', icon: '#D32F2F', label: '#B71C1C' },    
};

const VIOLATION_TYPES = [
  { id: '1', label: 'Rác thải bừa bãi' }, { id: '2', label: 'Ô nhiễm không khí / Khói bụi' },
  { id: '3', label: 'Ô nhiễm nguồn nước' }, { id: '4', label: 'Tiếng ồn quá mức' },
  { id: '5', label: 'Chặt phá cây xanh trái phép' }, { id: '6', label: 'Khác' },
];

const CreateReportScreen = ({ route, navigation }) => {
  const { reportData } = route.params || {}; 
  const isViewMode = !!reportData; 
  
  // State lưu quyền Admin (mặc định là false)
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const [violationType, setViolationType] = useState(reportData?.violationType || '');
  const [description, setDescription] = useState(reportData?.description || '');
  const [imageUri, setImageUri] = useState(reportData?.imageUrl || null);
  
  const [currentLocation, setCurrentLocation] = useState(
      reportData?.location ? { latitude: reportData.location.lat, longitude: reportData.location.lng } : null
  ); 
  const [address, setAddress] = useState(reportData?.location?.address || 'Đang định vị...');
  const [tempCoordinate, setTempCoordinate] = useState(null);

  const [severity, setSeverity] = useState(reportData?.severity || 'low'); 
  const [currentStatus, setCurrentStatus] = useState(reportData?.status || 'pending');

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); 
  const [mapVisible, setMapVisible] = useState(false);    

  const webViewRef = useRef(null);

  // [MỚI] Hàm kiểm tra quyền Admin từ Database (Dynamic Role)
  useEffect(() => {
    const checkAdminRole = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            // Đọc thông tin user từ Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                // Kiểm tra field 'role'
                if (userData.role === 'admin') {
                    setIsUserAdmin(true);
                    console.log("Đã xác nhận quyền Admin cho:", user.uid);
                }
            }
        } catch (error) {
            console.log("Lỗi kiểm tra quyền admin:", error);
        }
    };

    if (db) checkAdminRole();
  }, []);

  useEffect(() => {
    if (!db) Alert.alert("Lỗi Cấu Hình", "Không tìm thấy kết nối Database.");
    if (!isViewMode) getCurrentLocation();
  }, []);

  // ... (Giữ nguyên toàn bộ phần còn lại của file: getCurrentLocation, pickImage, handleSubmit, render...)
  // (Phần dưới này không thay đổi gì so với file trước, chỉ cần thay logic check Admin ở trên)

  const getCurrentLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setAddress('Chưa cấp quyền vị trí'); return; }
        let lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown && lastKnown.coords) updateLocationState(lastKnown.coords);
        const locationPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));
        try {
            const current = await Promise.race([locationPromise, timeoutPromise]);
            if (current && current.coords) updateLocationState(current.coords);
        } catch (err) {
            if (!currentLocation && !lastKnown) {
                setAddress("Không tìm thấy GPS. Vui lòng chọn trên bản đồ.");
                const fallback = { latitude: 10.762622, longitude: 106.660172 };
                setCurrentLocation(fallback); setTempCoordinate(fallback);
            }
        }
      } catch (error) { setAddress('Lỗi định vị. Hãy thử chọn từ bản đồ.'); }
  };

  const updateLocationState = (coords) => {
    if (!coords) return;
    const { latitude, longitude } = coords;
    if (!currentLocation || Math.abs(currentLocation.latitude - latitude) > 0.0001) {
      setCurrentLocation({ latitude, longitude }); setTempCoordinate({ latitude, longitude });
      if(!isViewMode) reverseGeocode(latitude, longitude);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const addressText = [addr.streetNumber, addr.street, addr.subregion, addr.region].filter(Boolean).join(', ');
        setAddress(addressText || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (e) { setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`); }
  };

  const pickImage = async () => {
    if (isViewMode) return; 
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, 
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri) => {
    if (uri.startsWith('http')) return uri;
    try {
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
    } catch (err) {
      throw new Error(`Lỗi upload ảnh: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!description || !violationType) { Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ thông tin."); return; }
    setLoading(true);
    try {
      let imageUrl = null;
      if (imageUri) imageUrl = await uploadImageAsync(imageUri);
      const userId = auth?.currentUser?.uid || 'guest_user';
      const data = {
        violationType, description, severity, imageUrl: imageUrl || '',
        location: currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude, address } : null,
        status: 'pending', createdAt: serverTimestamp(), userId: userId, 
      };
      await addDoc(collection(db, 'reports'), data);
      Alert.alert("THÀNH CÔNG", "Đãr gửi báo cáo!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error) { Alert.alert("Lỗi", error.message); } finally { setLoading(false); }
  };

  const handleAdminAction = async (action) => {
    setLoading(true);
    try {
        const reportRef = doc(db, 'reports', reportData.id);
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        await updateDoc(reportRef, { 
            status: newStatus,
            adminComment: action === 'approve' ? 'Đã duyệt.' : 'Từ chối.'
        });
        setCurrentStatus(newStatus);
        Alert.alert("Thành công", `Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} báo cáo.`);
    } catch (error) {
        // Handle permission error gracefully
        if (error.code === 'permission-denied') {
            Alert.alert("Lỗi Quyền", "Tài khoản của bạn chưa được cấp quyền Admin trên server.");
        } else {
            Alert.alert("Lỗi", error.message);
        }
    } finally {
        setLoading(false);
    }
  };

  const formatReportDate = () => {
      if (!reportData?.createdAt) return 'Vừa xong';
      if (reportData.createdAt.seconds) return new Date(reportData.createdAt.seconds * 1000).toLocaleString();
      try { return new Date(reportData.createdAt).toLocaleString(); } catch (e) { return 'Ngày không xác định'; }
  };

  const handleWebViewMessage = (event) => { try { const data = JSON.parse(event.nativeEvent.data); if (data.latitude) setTempCoordinate(data); } catch (e) {} };
  const handleConfirmMapLocation = () => { if (tempCoordinate) { setCurrentLocation(tempCoordinate); reverseGeocode(tempCoordinate.latitude, tempCoordinate.longitude); setMapVisible(false); } };
  const handleLocateMeOnMap = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    try {
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (current && current.coords) {
        const { latitude, longitude } = current.coords;
        setTempCoordinate({ latitude, longitude });
        if(webViewRef.current) webViewRef.current.injectJavaScript(`window.updateMapCenter(${latitude}, ${longitude}); true;`);
      }
    } catch (error) {}
  };
  const mapHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>body { margin: 0; padding: 0; } #map { width: 100%; height: 100vh; }</style></head><body><div id="map"></div><script>var lat = ${currentLocation ? currentLocation.latitude : 10.762};var lng = ${currentLocation ? currentLocation.longitude : 106.660};var map = L.map('map', {zoomControl: false}).setView([lat, lng], 15);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap'}).addTo(map);var marker = L.marker([lat, lng]).addTo(map);map.on('click', function(e) {if (marker) map.removeLayer(marker);marker = L.marker(e.latlng).addTo(map);window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: e.latlng.lat, longitude: e.latlng.lng }));});window.updateMapCenter = function(newLat, newLng) {var newLatLng = new L.LatLng(newLat, newLng);map.setView(newLatLng, 16);if (marker) map.removeLayer(marker);marker = L.marker(newLatLng).addTo(map);window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: newLat, longitude: newLng }));};</script></body></html>`;
  
  const renderModalItem = ({ item }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => { setViolationType(item.label); setModalVisible(false); }}>
      <Text style={styles.modalItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isViewMode ? "Chi tiết báo cáo" : "Tạo báo cáo"}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isViewMode && <Text style={styles.dateLabel}>{formatReportDate()}</Text>}
        <Text style={styles.label}>Loại Vi Phạm</Text>
        <TouchableOpacity style={[styles.inputContainer, isViewMode && styles.readOnly]} onPress={() => !isViewMode && setModalVisible(true)} disabled={isViewMode}>
          <Text style={[styles.inputText, !violationType && { color: '#999' }]}>{violationType || 'Chọn loại vi phạm'}</Text>
          {!isViewMode && <Ionicons name="chevron-down" size={20} color="#666" />}
        </TouchableOpacity>
        <Text style={styles.label}>Mô tả</Text>
        <View style={[styles.textAreaContainer, isViewMode && styles.readOnly]}>
          <TextInput style={styles.textArea} placeholder="Mô tả chi tiết..." multiline numberOfLines={4} value={description} onChangeText={setDescription} textAlignVertical="top" editable={!isViewMode} />
        </View>
        <Text style={styles.label}>Bằng chứng</Text>
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage} disabled={isViewMode}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <View style={{alignItems:'center'}}><FontAwesome5 name="camera" size={32} color="#999" />{!isViewMode && <Text style={{color:'#999', fontSize:12, marginTop:5}}>Chạm để chọn ảnh</Text>}</View>
            )}
             {isViewMode && (
                <View style={[styles.statusBadge, currentStatus === 'approved' ? {backgroundColor:'#27AE60'} : currentStatus === 'rejected' ? {backgroundColor:'#C0392B'} : {backgroundColor:'#F39C12'}]}>
                    <Text style={styles.statusText}>{currentStatus === 'approved' ? 'Đã duyệt' : currentStatus === 'rejected' ? 'Từ chối' : 'Đang chờ'}</Text>
                </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'center', marginBottom: 10}}>
           <Text style={styles.labelNoMargin}>Vị trí</Text>
        </View>
        <View style={styles.locationContainer}>
          <View style={styles.locationInfoBox}>
            <View style={styles.locationIconWrapper}><Ionicons name="location-sharp" size={24} color="#000" /></View>
            <View style={styles.locationTexts}><Text style={styles.locationTitle}>Địa chỉ</Text><Text style={styles.locationAddress} numberOfLines={2}>{address}</Text></View>
          </View>
        </View>
        <TouchableOpacity style={styles.mapButton} onPress={() => setMapVisible(true)}>
          <Ionicons name="map-outline" size={20} color="#333" /><Text style={styles.mapButtonText}>{isViewMode ? "Xem trên bản đồ" : "Chọn từ bản đồ"}</Text>
        </TouchableOpacity>
        <Text style={styles.label}>Mức Độ Nghiêm Trọng</Text>
        <View style={styles.severityContainer}>
          {['low', 'medium', 'high'].map(level => (
            <TouchableOpacity key={level} style={[styles.severityBox, { backgroundColor: COLORS[level].bg, borderWidth: severity === level ? 2 : 0, borderColor: severity === level ? COLORS[level].label : 'transparent' }]} onPress={() => !isViewMode && setSeverity(level)} disabled={isViewMode}>
              {level === 'low' && <Ionicons name="warning" size={24} color={COLORS.low.label} />}
              {level === 'medium' && <MaterialCommunityIcons name="cards-diamond" size={24} color={COLORS.medium.label} />}
              {level === 'high' && <MaterialCommunityIcons name="alarm-light" size={24} color={COLORS.high.label} />}
              <Text style={[styles.severityText, { color: '#333' }]}>{level === 'low' ? 'Thấp' : level === 'medium' ? 'TB' : 'Cao'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!isViewMode && (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Xác Nhận</Text>}
            </TouchableOpacity>
        )}
        {isViewMode && isUserAdmin && currentStatus === 'pending' && (
            <View style={styles.adminActions}>
                <TouchableOpacity style={[styles.adminBtn, {backgroundColor:'#FFEBEE'}]} onPress={() => handleAdminAction('reject')}><Text style={{color:'#D32F2F', fontWeight:'bold'}}>Từ chối</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.adminBtn, {backgroundColor:'#E8F5E9'}]} onPress={() => handleAdminAction('approve')}><Text style={{color:'#27AE60', fontWeight:'bold'}}>Duyệt (+Điểm)</Text></TouchableOpacity>
            </View>
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}><FlatList data={VIOLATION_TYPES} keyExtractor={item => item.id} renderItem={renderModalItem} /></View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
        <View style={{flex: 1, backgroundColor: '#fff'}}>
            <WebView ref={webViewRef} originWhitelist={['*']} source={{ html: mapHtml }} style={{flex: 1}} onMessage={handleWebViewMessage} />
            {!isViewMode && (<View style={styles.mapActions}><TouchableOpacity style={styles.mapConfirmBtn} onPress={handleConfirmMapLocation}><Text style={{color:'#fff', fontWeight:'bold'}}>Xác nhận vị trí</Text></TouchableOpacity></View>)}
            {isViewMode && (<TouchableOpacity style={styles.mapCloseBtnFloating} onPress={() => setMapVisible(false)}><Ionicons name="close" size={24} color="#333"/></TouchableOpacity>)}
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
  label: { fontSize: 16, marginBottom: 8, marginTop: 15, fontWeight: '500', color: '#333' },
  dateLabel: { fontSize: 13, color: '#888', textAlign: 'right', marginBottom: 5 },
  labelNoMargin: { fontSize: 16, fontWeight: '400', color: '#333' },
  inputContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  inputText: { fontSize: 14, color: '#333' },
  textAreaContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, height: 100, padding: 10, backgroundColor: '#fff' },
  textArea: { fontSize: 14, color: '#333', height: '100%' },
  readOnly: { backgroundColor: '#F5F5F5', borderColor: '#ddd' },
  uploadContainer: { height: 250, marginBottom: 10, marginTop: 5 },
  uploadBox: { flex: 1, borderWidth: 1.5, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  statusBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  locationContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  locationInfoBox: { flexDirection: 'row', alignItems: 'center' },
  locationIconWrapper: { marginRight: 12 },
  locationTexts: { flex: 1 },
  locationTitle: { fontWeight: '600', fontSize: 14, color: '#000' },
  locationAddress: { color: '#777', fontSize: 13, marginTop: 2 },
  mapButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 25, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', marginBottom: 5 },
  mapButtonText: { marginLeft: 8, fontWeight: '500', color: '#333', fontSize: 14 },
  severityContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  severityBox: { width: '30%', aspectRatio: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  severityText: { marginTop: 8, fontWeight: '600', fontSize: 13, color: '#333' },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 15, marginTop: 30, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  adminActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, gap: 15 },
  adminBtn: { flex: 1, paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemText: { fontSize: 16, color: '#333' },
  mapActions: { height: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  mapConfirmBtn: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8, backgroundColor: COLORS.primary },
  mapCloseBtnFloating: { position: 'absolute', top: 40, right: 20, backgroundColor: '#fff', padding: 8, borderRadius: 20, elevation: 5 }
});

export default CreateReportScreen;