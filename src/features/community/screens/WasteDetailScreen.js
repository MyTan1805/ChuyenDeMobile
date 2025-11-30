// src/features/community/screens/WasteDetailScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import CategorySelector from '@/components/CategorySelector';
import { shareContent } from '@/utils/shareUtils'; // ✅ Import
import { database } from '@/config/firebaseConfig';
import { ref, get } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons'; // Thêm import icon

const WasteDetailScreen = ({ route, navigation }) => {
    const { selectedCategory, wasteId, allCategories: initialCats } = route.params || {};
    const [currentItem, setCurrentItem] = useState(selectedCategory || null);
    const [allCategories, setAllCategories] = useState(initialCats || []);
    const [loading, setLoading] = useState(!selectedCategory);

    // ✅ Logic tải dữ liệu từ Link
    useEffect(() => {
        const fetchData = async () => {
            if (!currentItem && wasteId) {
                try {
                    const snapshot = await get(ref(database, 'waste_categories'));
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
                        setAllCategories(arr);
                        const found = arr.find(i => i.id === wasteId || i.name === wasteId);
                        if (found) setCurrentItem(found);
                    }
                } catch (e) { console.error(e); }
                setLoading(false);
            }
        };
        fetchData();
    }, [wasteId]);

    const handleSelectCategory = (name) => {
        const found = allCategories.find(cat => cat.name === name);
        if (found) setCurrentItem(found);
    };

    // ✅ Hàm chia sẻ
    const handleShare = () => {
        if (!currentItem) return;
        shareContent({
            title: `Phân loại rác: ${currentItem.name}`,
            message: `♻️ Cách xử lý rác "${currentItem.name}" đúng cách!`,
            path: `waste/${currentItem.id || currentItem.name}`
        });
    };

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} color="#2F847C" />;
    if (!currentItem) return null;

    const categoryNames = allCategories.map(c => c.name);

    return (
        <View style={styles.container}>
            <CustomHeader
                title={currentItem.name}
                showBackButton={true}
                showSettingsButton={true}
                rightIconName="share-social-outline" // ✅ Icon Share
                onSettingsPress={handleShare} // ✅ Gọi hàm share
            />

            {categoryNames.length > 0 && (
                <CategorySelector
                    categories={categoryNames}
                    selectedCategory={currentItem.name}
                    onSelectCategory={handleSelectCategory}
                    style={{ backgroundColor: '#fff' }}
                />
            )}

            <ScrollView contentContainerStyle={styles.content}>
                <Image
                    source={{ uri: currentItem.image || 'https://via.placeholder.com/300' }}
                    style={styles.image}
                />

                {/* Hiển thị nội dung hướng dẫn (Giả lập) */}
                <View style={styles.contentContainer}>
                    <Text style={styles.sectionHeader}>Hướng dẫn xử lý</Text>
                    <Text style={styles.contentText}>{currentItem.instructions || "Đang cập nhật..."}</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    content: { padding: 20 },
    image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 20 },
    contentContainer: { paddingHorizontal: 5 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    contentText: { fontSize: 16, color: '#555', lineHeight: 24 }
});

export default WasteDetailScreen;