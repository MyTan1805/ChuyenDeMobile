// src/screens/WasteClassificationScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import CustomHeader from '../component/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { database } from '../config/firebaseConfig'; // Import Database
import { ref, onValue } from 'firebase/database'; // Import hàm của Firebase

const { width } = Dimensions.get('window');

const WasteClassificationScreen = ({ navigation }) => {
    const [wasteCategories, setWasteCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy dữ liệu từ Firebase
    useEffect(() => {
        const wasteRef = ref(database, 'waste_categories');
        const unsubscribe = onValue(wasteRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Chuyển object từ Firebase thành array để map
                const dataArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setWasteCategories(dataArray);
            }
            setLoading(false);
        }, (error) => {
            console.error("Lỗi đọc dữ liệu:", error);
            setLoading(false);
        });

        // Cleanup function khi component unmount
        return () => unsubscribe();
    }, []);

    const handleCategoryPress = (category) => {
        // Truyền cả danh sách (để làm tab) và category được chọn
        navigation.navigate('WasteDetail', { 
            selectedCategory: category,
            allCategories: wasteCategories 
        });
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Phân loại rác" showBackButton={true} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2F847C" />
                    <Text style={{marginTop: 10, fontFamily: 'Nunito-Regular'}}>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.bannerContainer}>
                        <Image 
                            source={{ uri: 'https://img.freepik.com/premium-vector/young-volunteer-children-collecting-garbage-environmentalism-plastic-awareness-concept_204997-67.jpg' }} 
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                    </View>

                    <Text style={styles.instructionText}>Bạn muốn tìm hiểu về loại rác nào?</Text>

                    <View style={styles.gridContainer}>
                        {wasteCategories.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.card, { backgroundColor: item.color }]}
                                onPress={() => handleCategoryPress(item)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name={item.icon} size={36} color="#333" />
                                <Text style={styles.cardText}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 20 },
    bannerContainer: { width: '100%', height: 180, marginBottom: 10, padding: 16 },
    bannerImage: { width: '100%', height: '100%', borderRadius: 16 },
    instructionText: { 
        textAlign: 'center', fontSize: 16, fontFamily: 'Nunito-Bold', color: '#555', marginBottom: 10 
    },
    gridContainer: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 10,
    },
    card: {
        width: (width - 48) / 2,
        height: 120, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
        marginBottom: 16, elevation: 3, shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    cardText: { marginTop: 8, fontSize: 16, fontFamily: 'Nunito-Bold', color: '#333' },
});

export default WasteClassificationScreen;