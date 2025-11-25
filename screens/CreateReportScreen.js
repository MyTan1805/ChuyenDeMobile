import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert, Modal, FlatList 
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

// Import Firebase
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../config/firebaseConfig';

const COLORS = {
  primary: '#88c088',
  bg: '#ffffff',
  text: '#333333',
  border: '#e0e0e0',
  low: { bg: '#fffde7', border: '#fff59d', text: '#fbc02d', icon: '#fbc02d' },
  medium: { bg: '#fff3e0', border: '#ffcc80', text: '#f57c00', icon: '#f57c00' },
  high: { bg: '#ffebee', border: '#ef9a9a', text: '#d32f2f', icon: '#d32f2f' },
};

const VIOLATION_TYPES = [
  { id: '1', label: 'Rác thải bừa bãi' },
  { id: '2', label: 'Ô nhiễm không khí / Khói bụi' },
  { id: '3', label: 'Ô nhiễm nguồn nước' },
  { id: '4', label: 'Tiếng ồn quá mức' },
  { id: '5', label: 'Chặt phá cây xanh trái phép' },
  { id: '6', label: 'Khác' },
];

const CreateReportScreen = () => {
  // State Data
  const [violationType, setViolationType] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Đang lấy vị trí...');
  const [severity, setSeverity] = useState('medium');
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // 1. Lấy vị trí
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddress('Không có quyền truy cập vị trí');
        return;
      }
      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        // Trong thực tế, bạn sẽ gọi API Google Maps Geocoding ở đây để lấy tên đường
        setAddress(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`); 
      } catch (error) {
        setAddress('Không thể lấy vị trí');
      }
    })();
  }, []);

  // 2. Chọn ảnh
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8, // Giảm chất lượng chút để upload nhanh hơn
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Hàm hỗ trợ upload ảnh (Blob)
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

  // 3. Gửi báo cáo (Logic chính)
  const handleSubmit = async () => {
    if (!description || !violationType) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn loại vi phạm và nhập mô tả.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      
      // Bước 1: Upload ảnh nếu có
      if (imageUri) {
        imageUrl = await uploadImageAsync(imageUri);
      }

      // Bước 2: Tạo data object
      const reportData = {
        violationType,
        description,
        severity,
        imageUrl: imageUrl || '',
        location: location ? {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          address: address
        } : null,
        status: 'pending', // Trạng thái mặc định: Đang chờ xử lý
        createdAt: serverTimestamp(),
        userId: 'guest_user_123', // Hardcode tạm, sau này lấy từ Auth
      };

      // Bước 3: Lưu vào Firestore
      await addDoc(collection(db, 'reports'), reportData);

      Alert.alert("Thành công", "Cảm ơn bạn đã chung tay bảo vệ môi trường! (+50 điểm)", [
        { text: "OK", onPress: resetForm }
      ]);

    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Không thể gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setViolationType('');
    setDescription('');
    setImageUri(null);
    setSeverity('medium');
  };

  // UI Component con: 1 dòng trong Modal
  const renderModalItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.modalItem}
      onPress={() => {
        setViolationType(item.label);
        setModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>{item.label}</Text>
      {violationType === item.label && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo báo cáo</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Dropdown Loại Vi Phạm */}
        <Text style={styles.label}>Loại Vi Phạm</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => setModalVisible(true)}>
          <Text style={[styles.inputText, !violationType && { color: '#999' }]}>
            {violationType || 'Chọn loại vi phạm'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {/* Input Mô tả */}
        <Text style={styles.label}>Mô tả</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Mô tả chi tiết vi phạm môi trường..."
            multiline={true}
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Bằng chứng (Ảnh) */}
        <Text style={styles.label}>Bằng chứng (Ảnh/Video)</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <FontAwesome5 name="camera" size={32} color="#ccc" />
              <Text style={{color: '#999', marginTop: 8, fontSize: 12}}>Chạm để chụp/chọn ảnh</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Vị trí */}
        <Text style={styles.label}>Vị trí</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationInfo}>
            <Ionicons name="location-sharp" size={24} color="black" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.locationTitle}>Vị trí hiện tại</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>{address}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.mapButton}>
          <MaterialIcons name="map" size={20} color="#333" />
          <Text style={styles.mapButtonText}>Chọn từ Bản đồ</Text>
        </TouchableOpacity>

        {/* Mức Độ Nghiêm Trọng */}
        <Text style={styles.label}>Mức Độ Nghiêm Trọng</Text>
        <View style={styles.severityContainer}>
          {[
            { id: 'low', label: 'Thấp', icon: 'warning', theme: COLORS.low },
            { id: 'medium', label: 'Trung bình', icon: 'alert-circle', theme: COLORS.medium },
            { id: 'high', label: 'Cao', icon: 'alarm', theme: COLORS.high }
          ].map((item) => {
            const isSelected = severity === item.id;
            return (
              <TouchableOpacity 
                key={item.id}
                style={[
                  styles.severityBox, 
                  { 
                    backgroundColor: item.theme.bg,
                    borderColor: isSelected ? item.theme.icon : 'transparent',
                    borderWidth: isSelected ? 2 : 0
                  }
                ]}
                onPress={() => setSeverity(item.id)}
              >
                <Ionicons name={item.icon} size={24} color={item.theme.icon} />
                <Text style={[styles.severityText, { color: item.theme.text }]}>{item.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Nút Xác Nhận */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{loading ? 'Đang gửi...' : 'Xác Nhận'}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Ionicons name="star" size={16} color="#fbc02d" />
          <Text style={styles.footerText}> Nhận 50 điểm khi gửi báo cáo</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal Chọn Loại Vi Phạm */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn loại vi phạm</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={VIOLATION_TYPES}
              keyExtractor={item => item.id}
              renderItem={renderModalItem}
            />
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
    borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', overflow: 'hidden'
  },
  previewImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { alignItems: 'center' },
  locationCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 10 },
  locationInfo: { flexDirection: 'row', alignItems: 'center' },
  locationTitle: { fontWeight: '500', fontSize: 14 },
  locationAddress: { color: '#666', fontSize: 12, marginTop: 2 },
  mapButton: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 25, paddingVertical: 10,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  mapButtonText: { marginLeft: 8, fontWeight: '500', color: '#333' },
  severityContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  severityBox: { width: '30%', aspectRatio: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  severityText: { marginTop: 8, fontWeight: '600', fontSize: 13 },
  submitButton: {
    backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 15, marginTop: 30,
    alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footerNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  footerText: { color: '#888', fontSize: 12 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' },
  modalItemText: { fontSize: 16, color: '#333' }
});

export default CreateReportScreen;