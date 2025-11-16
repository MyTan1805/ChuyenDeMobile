import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import CustomHeader from '../component/CustomHeader'; // Import header

const ProfileScreen = () => {
    const { logout } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <CustomHeader 
                title="Trang Cá Nhân"
                showBackButton={true}
            />
            <View style={styles.content}>
                <Text style={{ fontSize: 24, marginBottom: 20 }}>Nội dung hồ sơ</Text>
                <Button title="Đăng xuất" onPress={logout} color="#f44336" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default ProfileScreen;