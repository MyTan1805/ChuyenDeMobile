import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Firebase Imports
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const STATUS_MAP = {
  'pending': { label: 'Đang chờ', color: '#fbc02d', bg: '#fffde7' },
  'processing': { label: 'Đang xử lý', color: '#1976d2', bg: '#e3f2fd' },
  'completed': { label: 'Đã xong', color: '#388e3c', bg: '#e8f5e9' },
  'rejected': { label: 'Từ chối', color: '#d32f2f', bg: '#ffebee' },
};

const ReportHistoryScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tạo query: Lấy báo cáo của user hiện tại, sắp xếp mới nhất lên đầu
    // Lưu ý: Cần userId giống hệt bên CreateReportScreen (đang hardcode là 'guest_user_123')
    const q = query(
      collection(db, 'reports'), 
      where('userId', '==', 'guest_user_123'),
      orderBy('createdAt', 'desc')
    );

    // Lắng nghe dữ liệu realtime
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(list);
      setLoading(false);
    }, (error) => {
      console.log("Lỗi fetch data:", error);
      setLoading(false);
    });

    // Hủy đăng ký khi thoát màn hình
    return () => unsubscribe();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    // Convert Firestore Timestamp to Date
    const date = timestamp.toDate(); 
    return `${date.getHours()}:${date.getMinutes()} - ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const renderItem = ({ item }) => {
    const statusInfo = STATUS_MAP[item.status] || STATUS_MAP['pending'];

    return (
      <View style={styles.card}>
        {/* Hình ảnh thumbnail */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={24} color="#ccc" />
            </View>
          )}
        </View>

        {/* Nội dung báo cáo */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.violationType}>{item.violationType}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.location?.address || 'Không có địa chỉ'}
              </Text>
            </View>
            <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#88c088" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử Báo cáo</Text>
      </View>

      {reports.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={64} color="#ddd" />
          <Text style={styles.emptyText}>Chưa có báo cáo nào</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
    elevation: 2
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  listContent: { padding: 15 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
  
  // Card Styles
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 15,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3,
  },
  imageContainer: { width: 90, height: '100%', backgroundColor: '#eee' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  cardContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  violationType: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1, marginRight: 5 },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  
  description: { fontSize: 13, color: '#666', marginVertical: 6 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  locationText: { fontSize: 11, color: '#888', marginLeft: 2 },
  timeText: { fontSize: 11, color: '#aaa' }
});

export default ReportHistoryScreen;