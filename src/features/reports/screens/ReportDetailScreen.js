import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

// Firebase
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebaseConfig';

// --- CẤU HÌNH DANH SÁCH ADMIN ---
const ADMIN_IDS = [
    "rMWE0wFBdnVGWYoxYbNo3uhLxJ73", 
    "HÃY_DÁN_UID_CỦA_BẠN_VÀO_ĐÂY",   
    "UID_ADMIN_KHÁC_NẾU_CÓ"          
];

const { width } = Dimensions.get('window');

const ReportDetailScreen = ({ route, navigation }) => {
  const { reportData } = route.params || {}; 
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(reportData?.status || 'pending');

  if (!reportData) return null;

  const isUserAdmin = ADMIN_IDS.includes(auth?.currentUser?.uid);

  // Xử lý Duyệt (Approve)
  const handleApprove = async () => {
    setLoading(true);
    try {
      const reportRef = doc(db, 'reports', reportData.id);
      await updateDoc(reportRef, { 
        status: 'approved',
        adminComment: 'Đã duyệt bởi Admin.'
      });
      setCurrentStatus('approved');
      Alert.alert("Thành công", "Đã duyệt báo cáo và cộng điểm cho người dùng.");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể duyệt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Từ chối (Reject)
  const handleReject = async () => {
    setLoading(true);
    try {
      const reportRef = doc(db, 'reports', reportData.id);
      await updateDoc(reportRef, { status: 'rejected' });
      setCurrentStatus('rejected');
      Alert.alert("Đã từ chối", "Báo cáo này không hợp lệ.");
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Map HTML
  const mapHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>body { margin: 0; padding: 0; } #map { width: 100%; height: 100%; }</style></head><body><div id="map"></div><script>var lat = ${reportData.location?.lat || 10.762};var lng = ${reportData.location?.lng || 106.660};var map = L.map('map', {zoomControl: false, dragging: false, scrollWheelZoom: false}).setView([lat, lng], 15);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; OpenStreetMap'}).addTo(map);L.marker([lat, lng]).addTo(map);</script></body></html>`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết báo cáo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ảnh */}
        <View style={styles.imageContainer}>
          {reportData.imageUrl ? (
            // [SỬA LỖI 1]: Đổi resizeMode="cover" thành "contain" để hiển thị toàn bộ ảnh
            <Image source={{ uri: reportData.imageUrl }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={40} color="#ccc" />
              <Text style={{color:'#999'}}>Không có ảnh</Text>
            </View>
          )}
        </View>

        {/* Thông tin (Di chuyển badge xuống dưới ảnh) */}
        <View style={styles.infoSection}>
            {/* Badge trạng thái */}
            <View style={[
                styles.statusBadge, 
                currentStatus === 'approved' ? {backgroundColor:'#27AE60'} : 
                currentStatus === 'rejected' ? {backgroundColor:'#C0392B'} : {backgroundColor:'#F39C12'}
            ]}>
                <Text style={styles.statusText}>
                    {currentStatus === 'approved' ? 'Đã duyệt (+Điểm)' : 
                     currentStatus === 'rejected' ? 'Bị từ chối' : 'Đang chờ duyệt'}
                </Text>
            </View>

            <Text style={styles.title}>{reportData.violationType}</Text>
            <Text style={styles.date}>{reportData.createdAt?.seconds ? new Date(reportData.createdAt.seconds * 1000).toLocaleString() : 'Vừa xong'}</Text>
            
            <View style={styles.row}>
                <Ionicons name="person-circle-outline" size={20} color="#666" />
                <Text style={styles.rowText}>Người gửi ID: {reportData.userId}</Text>
            </View>

            <View style={styles.row}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.rowText}>{reportData.location?.address || 'Không có địa chỉ'}</Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{reportData.description}</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Vị trí</Text>
            <View style={styles.mapBox}>
                <WebView source={{ html: mapHtml }} style={{ flex: 1 }} scrollEnabled={false} />
            </View>
        </View>
        <View style={{height: 80}} /> 
      </ScrollView>

      {/* --- THANH ADMIN --- */}
      {isUserAdmin && currentStatus === 'pending' && (
        <View style={styles.adminBar}>
            <Text style={styles.adminTitle}>
                Admin: {auth.currentUser?.email || "Admin"}
            </Text>
            <View style={styles.adminButtons}>
                <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={handleReject} disabled={loading}>
                    <Text style={styles.btnText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={handleApprove} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff"/> : <Text style={[styles.btnText, {color: '#fff'}]}>Duyệt (+Điểm)</Text>}
                </TouchableOpacity>
            </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15,
    backgroundColor: '#2F847C',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  // [SỬA LỖI 1]: Thay đổi chiều cao imageContainer và background
  imageContainer: { width: '100%', height: 300, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  noImage: { width: '100%', height: 300, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  // [SỬA LỖI 1]: Di chuyển badge ra khỏi imageContainer
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10
  },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  infoSection: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  date: { fontSize: 13, color: '#999', marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowText: { fontSize: 14, color: '#555', marginLeft: 8 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  description: { fontSize: 15, color: '#444', lineHeight: 22 },
  mapBox: { height: 200, width: '100%', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', marginTop: 5 },
  
  // Admin Bar
  adminBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', padding: 15, elevation: 20 },
  adminTitle: { fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 'bold' },
  adminButtons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnReject: { backgroundColor: '#FFEBEE' },
  btnApprove: { backgroundColor: '#27AE60' },
  btnText: { fontWeight: 'bold', fontSize: 14, color: '#333' },
});

export default ReportDetailScreen;