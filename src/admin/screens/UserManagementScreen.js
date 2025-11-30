import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

const UserManagementScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
      setLoading(false);
    }, (error) => {
      console.error("Lỗi tải user:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Hàm xóa người dùng (Chỉ xóa trên Firestore, không xóa Auth vì cần Admin SDK)
  const handleDeleteUser = (userId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa người dùng này khỏi danh sách?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              Alert.alert("Thành công", "Đã xóa người dùng.");
            } catch (error) {
              Alert.alert("Lỗi", error.message);
            }
          }
        }
      ]
    );
  };

  // Hàm đổi quyền (Ví dụ: Ban/Unban hoặc Cấp quyền)
  // Ở đây tôi demo chức năng khóa tài khoản (isBanned)
  const handleToggleBan = async (user) => {
    const newStatus = !user.isBanned;
    try {
      await updateDoc(doc(db, 'users', user.id), { isBanned: newStatus });
      Alert.alert("Thành công", `Đã ${newStatus ? 'khóa' : 'mở khóa'} tài khoản ${user.displayName || 'này'}.`);
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
        ) : (
            <View style={styles.avatarPlaceholder}><Ionicons name="person" size={20} color="#ccc" /></View>
        )}
        <View style={{flex: 1, marginLeft: 12}}>
            <Text style={styles.name}>{item.displayName || "Chưa đặt tên"}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.subInfo}>Điểm: {item.stats?.points || 0} • Vai trò: {item.role || 'User'}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {/* Nút Khóa/Mở khóa */}
        <TouchableOpacity 
            style={[styles.actionBtn, {backgroundColor: item.isBanned ? '#27AE60' : '#F39C12'}]}
            onPress={() => handleToggleBan(item)}
        >
            <MaterialIcons name={item.isBanned ? "lock-open" : "lock-outline"} size={20} color="#fff" />
        </TouchableOpacity>
        
        {/* Nút Xóa */}
        <TouchableOpacity 
            style={[styles.actionBtn, {backgroundColor: '#C0392B'}]}
            onPress={() => handleDeleteUser(item.id)}
        >
            <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
        <View style={styles.header}>
             {/* Nếu bạn dùng AdminNavigator có header riêng thì có thể bỏ header custom này */}
             {/* Nhưng để đồng bộ style, ta có thể giữ lại */}
        </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2C3E50" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có người dùng nào.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  listContent: { padding: 15 },
  header: { height: 10 }, // Spacer nếu cần
  emptyText: { textAlign: 'center', marginTop: 20, color: '#7F8C8D' },
  
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, padding: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  
  name: { fontWeight: 'bold', fontSize: 16, color: '#2C3E50' },
  email: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  subInfo: { fontSize: 11, color: '#95A5A6', marginTop: 4 },

  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});

export default UserManagementScreen;