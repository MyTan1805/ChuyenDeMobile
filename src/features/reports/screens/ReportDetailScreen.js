// src/features/reports/screens/ReportDetailScreen.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ReportDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { report } = route.params;

    const getSeverityInfo = (sev) => {
        switch (sev) {
            case 'low': return { label: 'Thấp', color: '#FBC02D' };
            case 'medium': return { label: 'Vừa', color: '#F57C00' };
            case 'high': return { label: 'Cao', color: '#D32F2F' };
            default: return { label: 'Thường', color: '#666' };
        }
    };
    const severityInfo = getSeverityInfo(report.severity);

    return (
        <View style={styles.container}>
            <CustomHeader title="Chi tiết báo cáo" showBackButton={true} />
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.statusHeader}>
                    <Text style={styles.date}>{report.time}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: report.status === 'pending' ? '#FFF3E0' : '#E8F5E9' }]}>
                        <Text style={[styles.statusText, { color: report.status === 'pending' ? '#EF6C00' : '#2E7D32' }]}>
                            {report.status === 'pending' ? 'Đang xử lý' : 'Đã tiếp nhận'}
                        </Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Loại vi phạm</Text>
                    <Text style={styles.title}>{report.title || report.name}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Mô tả chi tiết</Text>
                    <Text style={styles.desc}>{report.description}</Text>
                </View>

                {report.images && report.images.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.label}>Hình ảnh bằng chứng</Text>
                        <Image source={{ uri: report.images[0] }} style={styles.image} resizeMode="cover" />
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.label}>Vị trí</Text>
                    <View style={styles.row}>
                        <Ionicons name="location" size={20} color="#2F847C" />
                        <Text style={styles.locationText}>{report.location}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Mức độ nghiêm trọng</Text>
                    <View style={[styles.sevBadge, { backgroundColor: severityInfo.color }]}>
                        <Text style={styles.sevText}>{severityInfo.label}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    content: { padding: 20 },
    statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    date: { color: '#666', fontSize: 14 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statusText: { fontFamily: 'Nunito-Bold', fontSize: 12 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
    label: { fontSize: 12, color: '#999', fontFamily: 'Nunito-Bold', marginBottom: 6, textTransform: 'uppercase' },
    title: { fontSize: 18, fontFamily: 'Nunito-Bold', color: '#333' },
    desc: { fontSize: 16, fontFamily: 'Nunito-Regular', color: '#444', lineHeight: 24 },
    image: { width: '100%', height: 200, borderRadius: 8 },
    row: { flexDirection: 'row', alignItems: 'center' },
    locationText: { marginLeft: 8, fontSize: 16, color: '#333' },
    sevBadge: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    sevText: { color: 'white', fontFamily: 'Nunito-Bold' }
});

export default ReportDetailScreen;