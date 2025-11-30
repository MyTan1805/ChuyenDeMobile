import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import các màn hình Admin (Đường dẫn đi từ src/navigation -> ra src -> vào features/admin/screens)
import AdminDashboardScreen from '../features/admin/screens/AdminDashboardScreen';
import AdminReportListScreen from '../features/admin/screens/AdminReportListScreen';
import CreateQuizScreen from '../features/admin/screens/CreateQuizScreen';

const AdminStack = createStackNavigator();

const AdminNavigator = ({ navigation }) => {
  return (
    <AdminStack.Navigator 
        screenOptions={{ 
            headerShown: true,
            headerStyle: { backgroundColor: '#2C3E50' }, // Màu nền header tối
            headerTintColor: '#fff', // Màu chữ trắng
            headerTitleStyle: { fontWeight: 'bold' },
            headerLeft: () => (
                // Nút Back chung cho toàn bộ Admin Stack
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
        name="CreateQuiz" 
        component={CreateQuizScreen} 
        options={{ title: 'Tạo Quiz Mới' }}
      />
    </AdminStack.Navigator>
  );
};

export default AdminNavigator;