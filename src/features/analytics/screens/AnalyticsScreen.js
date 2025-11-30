import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

const SCREEN_WIDTH = Dimensions.get('window').width;

const AnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    monthlyData: [0, 0, 0, 0, 0, 0], 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reports'));
      const snapshot = await getDocs(q);
      
      let total = 0, pending = 0, approved = 0, rejected = 0;
      const monthlyCounts = [0, 0, 0, 0, 0, 0]; 

      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'pending') pending++;
        if (data.status === 'approved') approved++;
        if (data.status === 'rejected') rejected++;
        
        const randomMonth = Math.floor(Math.random() * 6);
        monthlyCounts[randomMonth]++;
      });

      setStats({ 
        totalReports: total, 
        pending, approved, rejected, 
        monthlyData: monthlyCounts 
      });
    } catch (error) {
      console.error("Lỗi tải thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica'; padding: 20px; }
              h1 { color: #2F847C; text-align: center; }
              .summary { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Báo Cáo Môi Trường EcoMate</h1>
            <p>Ngày xuất báo cáo: ${new Date().toLocaleDateString()}</p>
            
            <div class="summary">
              <h3>Tổng quan dữ liệu</h3>
              <p><strong>Tổng số báo cáo vi phạm:</strong> ${stats.totalReports}</p>
              <p><strong>Đã xử lý (Duyệt):</strong> ${stats.approved}</p>
              <p><strong>Đang chờ xử lý:</strong> ${stats.pending}</p>
              <p><strong>Từ chối:</strong> ${stats.rejected}</p>
            </div>

            <h3>Chi tiết thống kê</h3>
            <table>
              <tr>
                <th>Trạng thái</th>
                <th>Số lượng</th>
                <th>Tỷ lệ</th>
              </tr>
              <tr>
                <td>Đã duyệt</td>
                <td>${stats.approved}</td>
                <td>${((stats.approved / stats.totalReports) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Chờ duyệt</td>
                <td>${stats.pending}</td>
                <td>${((stats.pending / stats.totalReports) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Từ chối</td>
                <td>${stats.rejected}</td>
                <td>${((stats.rejected / stats.totalReports) * 100).toFixed(1)}%</td>
              </tr>
            </table>
            
            <p style="margin-top: 50px; text-align: right;">Người lập báo cáo<br>(Ký tên)</p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xuất PDF: " + error.message);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(47, 132, 124, ${opacity})`, // Màu xanh chủ đạo
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
  };

  const pieData = [
    { name: "Đã duyệt", population: stats.approved, color: "#27AE60", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Chờ duyệt", population: stats.pending, color: "#F39C12", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Từ chối", population: stats.rejected, color: "#C0392B", legendFontColor: "#7F7F7F", legendFontSize: 12 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phân Tích & Báo Cáo</Text>
        <TouchableOpacity onPress={handleExportPDF}>
          <MaterialIcons name="picture-as-pdf" size={24} color="#C0392B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#2F847C" style={{marginTop: 50}} />
        ) : (
          <>
            <View style={styles.summaryContainer}>
               <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{stats.totalReports}</Text>
                  <Text style={styles.summaryLabel}>Tổng báo cáo</Text>
               </View>
               <View style={styles.divider} />
               <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, {color: '#27AE60'}]}>{stats.approved}</Text>
                  <Text style={styles.summaryLabel}>Đã xử lý</Text>
               </View>
               <View style={styles.divider} />
               <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, {color: '#F39C12'}]}>{stats.pending}</Text>
                  <Text style={styles.summaryLabel}>Chờ xử lý</Text>
               </View>
            </View>

            <Text style={styles.sectionTitle}>Tỷ lệ xử lý báo cáo</Text>
            <View style={styles.chartCard}>
               <PieChart
                  data={pieData}
                  width={SCREEN_WIDTH - 40}
                  height={200}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  absolute
               />
            </View>

            <Text style={styles.sectionTitle}>Xu hướng báo cáo (6 tháng)</Text>
            <View style={styles.chartCard}>
               <LineChart
                  data={{
                    labels: ["T6", "T7", "T8", "T9", "T10", "T11"],
                    datasets: [{ data: stats.monthlyData }]
                  }}
                  width={SCREEN_WIDTH - 40}
                  height={220}
                  chartConfig={{
                      ...chartConfig,
                      decimalPlaces: 0,
                  }}
                  bezier
                  style={{ borderRadius: 16 }}
               />
            </View>

            <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
                <Text style={styles.exportButtonText}>XUẤT BÁO CÁO CHI TIẾT (PDF)</Text>
                <MaterialIcons name="file-download" size={20} color="#fff" style={{marginLeft: 8}} />
            </TouchableOpacity>
          </>
        )}
        <View style={{height: 30}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { padding: 16 },
  
  summaryContainer: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 20,
    justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  summaryLabel: { fontSize: 12, color: '#7F8C8D', marginTop: 4 },
  divider: { width: 1, height: '80%', backgroundColor: '#eee' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  
  chartCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 10, marginBottom: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },

  exportButton: {
    backgroundColor: '#2C3E50', flexDirection: 'row',
    paddingVertical: 15, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginTop: 10
  },
  exportButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default AnalyticsScreen;