import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import các màn hình Admin
import AdminDashboardScreen from '@/features/admin/screens/AdminDashboardScreen';
import AdminReportListScreen from '@/features/admin/screens/AdminReportListScreen';
import CreateQuizScreen from '@/features/admin/screens/CreateQuizScreen';
import UserManagementScreen from '@/features/admin/screens/UserManagementScreen';

const AdminStack = createStackNavigator();

const AdminNavigator = () => {
  return (
    <AdminStack.Navigator 
        screenOptions={{ 
            headerShown: true,
            headerStyle: { backgroundColor: '#2C3E50' }, // Màu tối cho Admin
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' }
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
        name="CreateQuiz" 
        component={CreateQuizScreen} 
        options={{ title: 'Tạo Quiz Mới' }}
      />
      <AdminStack.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{ title: 'Quản Lý Người Dùng' }}
      />
    </AdminStack.Navigator>
  );
};

export default AdminNavigator;