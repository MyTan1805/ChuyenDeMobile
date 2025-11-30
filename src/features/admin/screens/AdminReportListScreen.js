import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity, RefreshControl 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Import Firebase
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

// Cấu hình hiển thị trạng thái
const STATUS_CONFIG = {
  'pending': { label: 'Chờ duyệt', color: '#F39C12', bg: '#FEF5E7' },
  'approved': { label: 'Đã duyệt', color: '#27AE60', bg: '#E9F7EF' },
  'rejected': { label: 'Từ chối', color: '#C0392B', bg: '#FDEDEC' },
};

const AdminReportListScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const reportsRef = collection(db, 'reports');
    
    // --- QUERY ADMIN: Lấy TẤT CẢ báo cáo, mới nhất lên đầu ---
    const q = query(
      reportsRef, 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(list);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Lỗi tải danh sách Admin:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    // Kiểm tra an toàn cho timestamp
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    // Nếu date không hợp lệ
    if (isNaN(date.getTime())) return 'Vừa xong';
    
    return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
  };

  const handlePressReport = (report) => {
    // Chuyển sang màn hình chi tiết (ReportDetail)
    // Màn hình này đã được tích hợp logic Admin duyệt bài
    navigation.navigate('ReportDetail', { reportData: report });
  };

  const renderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG['pending'];
    
    // [FIX LỖI] Kiểm tra an toàn trước khi cắt chuỗi userId
    const userIdDisplay = item.userId && typeof item.userId === 'string' 
        ? item.userId.substring(0, 8) + '...' 
        : 'Khách (Không ID)';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handlePressReport(item)}
        activeOpacity={0.7}
      >
        {/* Ảnh thumbnail */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={24} color="#ccc" />
            </View>
          )}
        </View>

        {/* Nội dung */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.violationTitle} numberOfLines={1}>{item.violationType || "Báo cáo"}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          
          <Text style={styles.dateText}>{formatTime(item.createdAt)}</Text>
          
          {/* Hiển thị User ID an toàn */}
          <View style={styles.userRow}>
             <Ionicons name="person-circle-outline" size={14} color="#7f8c8d" />
             <Text style={styles.userText} numberOfLines={1}>
               User: {userIdDisplay}
             </Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color="#7f8c8d" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location?.address || 'Chưa xác định vị trí'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2C3E50" />
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="file-tray-outline" size={64} color="#ddd" />
          <Text style={styles.emptyText}>Không có báo cáo nào trong hệ thống</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
  
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    flexDirection: 'row', overflow: 'hidden', height: 110,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  imageContainer: { width: 100, height: '100%', backgroundColor: '#f0f0f0' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  cardContent: { flex: 1, padding: 10, justifyContent: 'center' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  violationTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 8 },
  
  statusBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  
  dateText: { fontSize: 11, color: '#95a5a6', marginBottom: 2 },
  
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  userText: { fontSize: 11, color: '#7f8c8d', marginLeft: 4 },

  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 11, color: '#7f8c8d', marginLeft: 4, flex: 1 },
});

export default AdminReportListScreen;