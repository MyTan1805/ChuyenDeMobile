import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    Image, Dimensions, ActivityIndicator 
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
=======
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
// --- SỬA CÁC DÒNG IMPORT DƯỚI ĐÂY ---
import CustomHeader from '@/components/CustomHeader'; // Dùng @/components
import { Ionicons } from '@expo/vector-icons';
import { database } from '@/config/firebaseConfig'; // Dùng @/config
import { ref, onValue } from 'firebase/database';
// -------------------------------------
>>>>>>> dev/Bao

const { width } = Dimensions.get('window');

const WasteClassificationScreen = ({ navigation }) => {
<<<<<<< HEAD
=======
    // ... (Phần code logic bên dưới giữ nguyên)
>>>>>>> dev/Bao
    const [wasteCategories, setWasteCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const wasteRef = ref(database, 'waste_categories');
        const unsubscribe = onValue(wasteRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
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

        return () => unsubscribe();
    }, []);

    const handleCategoryPress = (category) => {
<<<<<<< HEAD
        navigation.navigate('WasteDetail', {
            selectedCategory: category,
            allCategories: wasteCategories
=======
        navigation.navigate('WasteDetail', { 
            selectedCategory: category,
            allCategories: wasteCategories 
>>>>>>> dev/Bao
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
<<<<<<< HEAD
                        <Image
                            source={{ uri: 'https://img.freepik.com/premium-vector/young-volunteer-children-collecting-garbage-environmentalism-plastic-awareness-concept_204997-67.jpg' }}
=======
                        <Image 
                            source={{ uri: 'https://img.freepik.com/premium-vector/young-volunteer-children-collecting-garbage-environmentalism-plastic-awareness-concept_204997-67.jpg' }} 
>>>>>>> dev/Bao
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                    </View>

<<<<<<< HEAD
                    <TouchableOpacity 
                        style={styles.searchBarBtn}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('WasteSearch', { 
                            existingData: wasteCategories 
                        })} 
                    >
                        <View style={styles.searchLeft}>
                            <Ionicons name="search" size={20} color="#2F847C" />
                            <Text style={styles.searchPlaceholder}>Nhập tên rác hoặc chụp ảnh...</Text>
                        </View>
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    {/* ------------------------------------------------ */}

                    <Text style={styles.instructionText}>Hoặc chọn danh mục có sẵn:</Text>

                    <View style={styles.gridContainer}>
                        {wasteCategories.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.card, { backgroundColor: item.color || '#E0F2F1' }]} // Fallback màu
                                onPress={() => handleCategoryPress(item)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name={item.icon || 'leaf'} size={36} color="#333" />
=======
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
>>>>>>> dev/Bao
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
<<<<<<< HEAD
    
    bannerContainer: { width: '100%', height: 180, marginBottom: 15, padding: 16 },
    bannerImage: { width: '100%', height: '100%', borderRadius: 16 },

    searchBarBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        marginHorizontal: 16,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    searchLeft: { flexDirection: 'row', alignItems: 'center' },
    searchPlaceholder: { 
        marginLeft: 10, fontFamily: 'Nunito-Regular', fontSize: 15, color: '#888' 
    },
    cameraIcon: {
        backgroundColor: '#2F847C',
        padding: 8,
        borderRadius: 8,
    },

    instructionText: {
        marginLeft: 16, fontSize: 16, fontFamily: 'Nunito-Bold', color: '#333', marginBottom: 10
=======
    bannerContainer: { width: '100%', height: 180, marginBottom: 10, padding: 16 },
    bannerImage: { width: '100%', height: '100%', borderRadius: 16 },
    instructionText: { 
        textAlign: 'center', fontSize: 16, fontFamily: 'Nunito-Bold', color: '#555', marginBottom: 10 
>>>>>>> dev/Bao
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