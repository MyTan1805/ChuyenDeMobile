import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Constants } from 'expo-constants'; // Cần cài expo-constants nếu muốn lấy version động

const AboutScreen = () => {
    return (
        <View style={styles.container}>
            <CustomHeader title="Về ứng dụng" showBackButton={true} />
            <View style={styles.content}>
                <Text style={styles.logo}>EcoMate</Text>
                <Text style={styles.version}>Phiên bản 1.0.0</Text>

                <View style={styles.infoContainer}>
                    <Text style={styles.desc}>
                        EcoMate là ứng dụng mạng xã hội xanh, giúp cộng đồng chung tay bảo vệ môi trường qua các hoạt động tích điểm, báo cáo vi phạm và kết nối sự kiện.
                    </Text>
                    <Text style={styles.copyright}>© 2025 EcoMate Team.</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, alignItems: 'center', paddingTop: 50, paddingHorizontal: 20 },
    logo: { fontFamily: 'LogoFont', fontSize: 40, color: '#2F847C', marginBottom: 10 }, // Dùng font logo của bạn
    version: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#999', marginBottom: 40 },
    infoContainer: { alignItems: 'center' },
    desc: { fontFamily: 'Nunito-Regular', fontSize: 16, color: '#333', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
    copyright: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#999', position: 'absolute', bottom: -300 } // Đẩy xuống dưới
});

export default AboutScreen;