import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const AdminDashboardScreen = ({ navigation }) => {
  
  const renderMenuOption = (title, icon, color, route) => (
    <TouchableOpacity 
        style={styles.optionCard} 
        onPress={() => navigation.navigate(route)}
        activeOpacity={0.8}
    >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <MaterialIcons name={icon} size={32} color={color} />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionSub}>Nhấn để quản lý</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Xin chào, Admin!</Text>
        <Text style={styles.subText}>Chọn tác vụ bạn muốn thực hiện</Text>
      </View>

      <View style={styles.menuContainer}>
        {/* 1. Duyệt Báo Cáo */}
        {renderMenuOption('Duyệt Báo Cáo Vi Phạm', 'assignment-turned-in', '#E67E22', 'AdminReportList')}

        {/* 2. [MỚI] Phân tích dữ liệu */}
        {renderMenuOption('Phân Tích & Thống Kê', 'analytics', '#27AE60', 'Analytics')}

        {/* 3. Quản lý người dùng */}
        {renderMenuOption('Quản Lý Người Dùng', 'people', '#3498DB', 'UserManagement')}

        {/* 4. Tạo Quiz */}
        {renderMenuOption('Tạo Quiz Mới', 'quiz', '#9B59B6', 'CreateQuiz')}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  header: { padding: 20, backgroundColor: '#fff', marginBottom: 10 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
  subText: { fontSize: 14, color: '#7F8C8D', marginTop: 5 },
  
  menuContainer: { padding: 15 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  optionSub: { fontSize: 12, color: '#999', marginTop: 2 },
});

export default AdminDashboardScreen;