import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity, RefreshControl, Alert 
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Import Firebase
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

const STATUS_CONFIG = {
  'pending': { label: 'Chờ duyệt', color: '#F39C12', bg: '#FEF5E7' },
  'approved': { label: 'Đã duyệt', color: '#27AE60', bg: '#E9F7EF' },
  'rejected': { label: 'Từ chối', color: '#C0392B', bg: '#FDEDEC' },
};

const AdminReportListScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, orderBy('createdAt', 'desc'));

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
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'Vừa xong';
    return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
  };

  // --- HÀM XUẤT BÁO CÁO PDF (DÀNH CHO ADMIN) ---
  const handleExportAdminPDF = async () => {
    if (reports.length === 0) {
        Alert.alert("Thông báo", "Không có dữ liệu để xuất.");
        return;
    }
    setLoadingPdf(true);
    try {
        let tableRows = reports.map((item, idx) => {
            const dateStr = formatTime(item.createdAt);
            const statusText = STATUS_CONFIG[item.status]?.label || 'N/A';
            const statusColor = STATUS_CONFIG[item.status]?.color || '#333';

            return `
                <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td>${item.violationType || 'Không rõ'}</td>
                    <td>${item.description || ''}</td>
                    <td>${item.location?.address || 'Không có địa chỉ'}</td>
                    <td style="text-align: center;">${dateStr}</td>
                    <td style="color: ${statusColor}; font-weight: bold; text-align: center;">${statusText}</td>
                </tr>
            `;
        }).join('');

        const htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica'; padding: 20px; }
                    h1 { color: #2C3E50; text-align: center; margin-bottom: 5px; }
                    h3 { text-align: center; color: #555; margin-top: 0; }
                    .summary { margin: 20px 0; padding: 15px; background-color: #f4f6f8; border-radius: 8px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background-color: #2C3E50; color: white; text-align: center; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>BÁO CÁO VI PHẠM MÔI TRƯỜNG</h1>
                <h3>Danh sách tổng hợp (Dành cho Quản trị viên)</h3>
                
                <div class="summary">
                    <p><strong>Ngày xuất:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Tổng số lượng:</strong> ${reports.length} báo cáo</p>
                    <p><strong>Người xuất:</strong> Admin</p>
                </div>

                <table>
                    <tr>
                        <th style="width: 5%">STT</th>
                        <th style="width: 15%">Loại vi phạm</th>
                        <th style="width: 25%">Mô tả</th>
                        <th style="width: 25%">Địa điểm</th>
                        <th style="width: 15%">Ngày gửi</th>
                        <th style="width: 15%">Trạng thái</th>
                    </tr>
                    ${tableRows}
                </table>
                
                <p style="margin-top: 30px; text-align: center; font-size: 10px; color: #888;">
                    Báo cáo được trích xuất tự động từ hệ thống EcoMate.
                </p>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });

    } catch (error) {
        console.error("Lỗi xuất PDF Admin:", error);
        Alert.alert("Lỗi", "Không thể tạo file PDF.");
    } finally {
        setLoadingPdf(false);
    }
  };

  const handlePressReport = (report) => {
    navigation.navigate('ReportDetail', { reportData: report });
  };

  const renderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG['pending'];

    // [SỬA LỖI]: Kiểm tra an toàn trước khi cắt chuỗi userId
    const userDisplay = (item.userId && typeof item.userId === 'string') 
        ? `User: ${item.userId.substring(0, 8)}...` 
        : 'Khách (Guest)';

    return (
      <TouchableOpacity style={styles.card} onPress={() => handlePressReport(item)} activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} /> : <View style={styles.placeholderImage}><Ionicons name="image-outline" size={24} color="#ccc" /></View>}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.violationTitle} numberOfLines={1}>{item.violationType || "Báo cáo"}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>{formatTime(item.createdAt)}</Text>
          <View style={styles.userRow}>
             <Ionicons name="person-circle-outline" size={14} color="#7f8c8d" />
             {/* Hiển thị userDisplay đã xử lý an toàn */}
             <Text style={styles.userText} numberOfLines={1}>{userDisplay}</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color="#7f8c8d" />
            <Text style={styles.locationText} numberOfLines={1}>{item.location?.address || 'Chưa xác định vị trí'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Nút xuất báo cáo PDF nằm ở đầu danh sách */}
      {reports.length > 0 && (
          <View style={styles.headerAction}>
              <TouchableOpacity 
                  style={styles.exportBtn} 
                  onPress={handleExportAdminPDF}
                  disabled={loadingPdf}
              >
                  {loadingPdf ? (
                      <ActivityIndicator size="small" color="#fff" />
                  ) : (
                      <View style={{flexDirection:'row', alignItems:'center'}}>
                          <FontAwesome5 name="file-pdf" size={16} color="#fff" style={{marginRight: 8}} />
                          <Text style={styles.exportBtnText}>Xuất danh sách PDF</Text>
                      </View>
                  )}
              </TouchableOpacity>
              <Text style={styles.totalText}>Tổng: {reports.length}</Text>
          </View>
      )}

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#2C3E50" /></View>
      ) : reports.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="file-tray-outline" size={64} color="#ddd" />
          <Text style={styles.emptyText}>Không có báo cáo nào</Text>
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
  listContent: { padding: 16, paddingBottom: 30 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
  
  // Header Action (Nút xuất PDF)
  headerAction: { 
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
      paddingHorizontal: 16, paddingTop: 15, paddingBottom: 5 
  },
  exportBtn: { 
      backgroundColor: '#C0392B', flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 15, 
      borderRadius: 8, elevation: 2 
  },
  exportBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  totalText: { color: '#7F8C8D', fontSize: 13, fontWeight: '600' },

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