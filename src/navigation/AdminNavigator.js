import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import các màn hình Admin
import AdminDashboardScreen from '../admin/screens/AdminDashboardScreen';
import AdminReportListScreen from '../admin/screens/AdminReportListScreen';
import CreateQuizScreen from '../admin/screens/CreateQuizScreen';
import UserManagementScreen from '../admin/screens/UserManagementScreen';

// Tái sử dụng màn hình
import ReportDetailScreen from '../features/reports/screens/ReportDetailScreen';
import AnalyticsScreen from '../features/analytics/screens/AnalyticsScreen'; // [MỚI]

const AdminStack = createStackNavigator();

const AdminNavigator = ({ navigation }) => {
  return (
    <AdminStack.Navigator 
        screenOptions={{ 
            headerShown: true,
            headerStyle: { backgroundColor: '#2C3E50' }, 
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            )
        }}
    >
      <AdminStack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        options={{ title: 'Quản Trị Viên' }}
      />
      <AdminStack.Screen 
        name="AdminReportList" 
        component={AdminReportListScreen} 
        options={{ title: 'Duyệt Báo Cáo' }}
      />
      <AdminStack.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{ title: 'Quản Lý Người Dùng' }}
      />
      
      {/* [MỚI] Đăng ký Analytics */}
      <AdminStack.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ title: 'Thống Kê Dữ Liệu' }}
      />

      <AdminStack.Screen 
        name="ReportDetail" 
        component={ReportDetailScreen} 
        options={{ title: 'Chi Tiết & Xét Duyệt' }}
      />
      <AdminStack.Screen 
        name="CreateQuiz" 
        component={CreateQuizScreen} 
        options={{ title: 'Tạo Quiz Mới' }}
      />
    </AdminStack.Navigator>
  );
};

export default AdminNavigator;