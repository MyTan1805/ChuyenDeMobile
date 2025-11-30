import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Dimensions, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

// Firebase
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebaseConfig';

const { width, height } = Dimensions.get('window');

const ReportDetailScreen = ({ route, navigation }) => {
  const { reportData } = route.params || {}; 
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(reportData?.status || 'pending');
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  if (!reportData) return null;

  // [MỚI] Kiểm tra quyền Admin từ Firestore
  useEffect(() => {
    const checkAdminRole = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                setIsUserAdmin(true);
            }
        } catch (error) {
            console.log("Lỗi check admin:", error);
        }
    };
    checkAdminRole();
  }, []);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const reportRef = doc(db, 'reports', reportData.id);
      await updateDoc(reportRef, { status: 'approved', adminComment: 'Đã duyệt bởi Admin.' });
      setCurrentStatus('approved');
      Alert.alert("Thành công", "Đã duyệt báo cáo.");
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const reportRef = doc(db, 'reports', reportData.id);
      await updateDoc(reportRef, { status: 'rejected' });
      setCurrentStatus('rejected');
      Alert.alert("Đã từ chối", "Báo cáo không hợp lệ.");
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setLoading(false);
    }
  };

  const mapHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"/><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>body{margin:0;padding:0}#map{width:100%;height:100%}</style></head><body><div id="map"></div><script>var lat=${reportData.location?.lat||10.762},lng=${reportData.location?.lng||106.660},map=L.map('map',{zoomControl:!1,dragging:!1,scrollWheelZoom:!1}).setView([lat,lng],15);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap'}).addTo(map);L.marker([lat,lng]).addTo(map);</script></body></html>`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết báo cáo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => setFullImageVisible(true)} activeOpacity={0.9}>
            <View style={styles.imageContainer}>
            {reportData.imageUrl ? (
                <Image source={{ uri: reportData.imageUrl }} style={styles.image} resizeMode="contain" />
            ) : (
                <View style={styles.noImage}><Ionicons name="image-outline" size={40} color="#ccc" /></View>
            )}
            </View>
            <View style={styles.statusOverlay}>
                <View style={[styles.statusBadge, currentStatus === 'approved' ? {backgroundColor:'#27AE60'} : currentStatus === 'rejected' ? {backgroundColor:'#C0392B'} : {backgroundColor:'#F39C12'}]}>
                    <Text style={styles.statusText}>{currentStatus === 'approved' ? 'Đã duyệt' : currentStatus === 'rejected' ? 'Bị từ chối' : 'Đang chờ duyệt'}</Text>
                </View>
            </View>
        </TouchableOpacity>

        <View style={styles.infoSection}>
            <Text style={styles.title}>{reportData.violationType}</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Mô tả</Text><Text style={styles.description}>{reportData.description}</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Vị trí</Text><View style={styles.mapBox}><WebView source={{ html: mapHtml }} style={{ flex: 1 }} scrollEnabled={false} /></View>
        </View>
        <View style={{height: 80}} /> 
      </ScrollView>

      {/* Admin Actions */}
      {isUserAdmin && currentStatus === 'pending' && (
        <View style={styles.adminBar}>
            <Text style={styles.adminTitle}>Xét duyệt:</Text>
            <View style={styles.adminButtons}>
                <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={handleReject} disabled={loading}><Text style={styles.btnText}>Từ chối</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={handleApprove} disabled={loading}>{loading ? <ActivityIndicator color="#fff"/> : <Text style={[styles.btnText, {color: '#fff'}]}>Duyệt</Text>}</TouchableOpacity>
            </View>
        </View>
      )}

      <Modal visible={fullImageVisible} transparent={true} onRequestClose={() => setFullImageVisible(false)}>
          <View style={styles.fullImageContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setFullImageVisible(false)}>
                  <Ionicons name="close-circle" size={40} color="#fff" />
              </TouchableOpacity>
              {reportData.imageUrl && (
                  <Image source={{ uri: reportData.imageUrl }} style={styles.fullImage} resizeMode="contain" />
              )}
          </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#2F847C' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  imageContainer: { width: '100%', height: 400, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  noImage: { width: '100%', height: '100%', backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  statusOverlay: { position: 'absolute', bottom: 10, right: 10 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, elevation: 5 },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  infoSection: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  description: { fontSize: 15, color: '#444', lineHeight: 22 },
  mapBox: { height: 200, width: '100%', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', marginTop: 5 },
  adminBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', padding: 15, elevation: 20 },
  adminTitle: { fontSize: 12, color: '#999', marginBottom: 8, fontWeight: 'bold' }, adminButtons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, btnReject: { backgroundColor: '#FFEBEE' }, btnApprove: { backgroundColor: '#27AE60' }, btnText: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  fullImageContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width, height: height },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 999 }
});

export default ReportDetailScreen;