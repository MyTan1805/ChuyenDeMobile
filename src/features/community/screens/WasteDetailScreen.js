import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ImageBackground } from 'react-native';
<<<<<<< HEAD
import CustomHeader from '@/components/CustomHeader';
import CategorySelector from '@/components/CategorySelector';
import { Ionicons } from '@expo/vector-icons';

// ✅ 1. THÊM KHO ẢNH MINH HỌA
const CATEGORY_ILLUSTRATIONS = {
    'huuco': 'https://images.unsplash.com/photo-1536703219213-0223580c76b2?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
    'nhua': 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
    'kimloai': 'https://i.pinimg.com/1200x/e0/f0/12/e0f0129d3242c186b999c4da4c58b4a5.jpg', 
    'giay': 'https://images.unsplash.com/photo-1654372066379-d8a1c70f7363?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
    'dientu': 'https://images.unsplash.com/photo-1582748298043-0c0d31aa506e?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
    'thuytinh': 'https://images.unsplash.com/photo-1614480858386-d2c746e2c8e3?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
    'yte': 'https://images.unsplash.com/photo-1543709533-c032159da7b0?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 
    'default': 'https://images.unsplash.com/photo-1602262442764-c14f8db98045?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
};

const WasteDetailScreen = ({ route, navigation }) => {
    const { selectedCategory, allCategories = [] } = route.params;
    const [currentItem, setCurrentItem] = useState(selectedCategory);

    const categoryNames = allCategories.length > 0 ? allCategories.map(cat => cat.name) : [];
=======
// --- SỬA CÁC DÒNG IMPORT DƯỚI ĐÂY ---
import CustomHeader from '@/components/CustomHeader';       // Dùng @/components
import CategorySelector from '@/components/CategorySelector'; // Dùng @/components
// -------------------------------------
import { Ionicons } from '@expo/vector-icons';

// ... (Phần code còn lại của WasteDetailScreen giữ nguyên)
const WasteDetailScreen = ({ route, navigation }) => {
    const { selectedCategory, allCategories } = route.params;
    const [currentItem, setCurrentItem] = useState(selectedCategory);

    const categoryNames = allCategories.map(cat => cat.name);
>>>>>>> dev/Bao

    const handleSelectCategory = (name) => {
        const found = allCategories.find(cat => cat.name === name);
        if (found) setCurrentItem(found);
    };

<<<<<<< HEAD
    // ✅ 2. HÀM CHỌN ẢNH THÔNG MINH
    const getDisplayImage = () => {
        // Ưu tiên ảnh chụp thật
        if (currentItem.image && (currentItem.image.startsWith('file://') || currentItem.image.startsWith('content://'))) {
            return currentItem.image;
        }

        // Tìm ảnh trong DB (khớp ID)
        const catId = (currentItem.name || currentItem.itemName || '').toLowerCase().trim();
        const dbItem = allCategories.find(cat => cat.id === catId || cat.name === currentItem.name);
        if (dbItem && dbItem.image) return dbItem.image;

        // Dùng ảnh minh họa
        return CATEGORY_ILLUSTRATIONS[catId] || CATEGORY_ILLUSTRATIONS['default'];
    };

    const displayData = {
        title: currentItem.title || currentItem.itemName || currentItem.name,
        // Gọi hàm chọn ảnh
        image: getDisplayImage(),
        steps: currentItem.steps || null, 
        rawInstructions: currentItem.instructions || null, 
        locations: currentItem.locations || [] 
    };

    const parseAiInstructions = (text) => {
        if (!text) return [];
        return text.split(/[.\n•-]+/).filter(step => step.trim().length > 3);
    };

    const InstructionStep = ({ number, title, content }) => (
        <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
                <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{number}</Text>
                </View>
                <Text style={styles.stepTitle}>{title || `Bước ${number}`}</Text>
            </View>
            <Text style={styles.stepContent}>{content.trim()}</Text>
        </View>
    );
=======
    const locationCount = currentItem.locations ? currentItem.locations.length : 0;

    const InstructionStep = ({ number, stepData }) => {
        if (!stepData) return null;
        return (
            <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                    <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>{number}</Text>
                    </View>
                    <Text style={styles.stepTitle}>{stepData.title}</Text>
                </View>
                <Text style={styles.stepContent}>{stepData.content}</Text>
            </View>
        );
    };
>>>>>>> dev/Bao

    const LocationItem = ({ item }) => (
        <TouchableOpacity style={styles.locationCard} activeOpacity={0.7}>
            <View style={styles.locationLeft}>
<<<<<<< HEAD
                <Ionicons name="location" size={24} color="#D32F2F" style={{ marginRight: 12 }} />
=======
                <Ionicons name="location" size={24} color="black" style={{ marginRight: 12 }} />
>>>>>>> dev/Bao
                <View>
                    <Text style={styles.locationName}>{item.name}</Text>
                    <Text style={styles.locationDistance}>{item.distance}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>
    );

<<<<<<< HEAD
    const aiSteps = displayData.rawInstructions ? parseAiInstructions(displayData.rawInstructions) : [];

    return (
        <View style={styles.container}>
            <CustomHeader title={displayData.title} showBackButton={true} />

            {categoryNames.length > 0 && (
                <View style={styles.selectorContainer}>
                    <CategorySelector 
                        categories={categoryNames}
                        selectedCategory={currentItem.name}
                        onSelectCategory={handleSelectCategory}
                    />
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image 
                    source={{ uri: displayData.image }} 
                    style={styles.heroImage}
                    resizeMode={currentItem.image && currentItem.image.startsWith('file') ? "cover" : "contain"} 
                />

                <View style={styles.contentContainer}>
                    <Text style={styles.sectionHeader}>Hướng dẫn xử lý</Text>

                    {displayData.steps ? (
                        <>
                            {displayData.steps.step1 && <InstructionStep number="1" title={displayData.steps.step1.title} content={displayData.steps.step1.content} />}
                            {displayData.steps.step2 && <InstructionStep number="2" title={displayData.steps.step2.title} content={displayData.steps.step2.content} />}
                            {displayData.steps.step3 && <InstructionStep number="3" title={displayData.steps.step3.title} content={displayData.steps.step3.content} />}
                        </>
                    ) : aiSteps.length > 0 ? (
                        aiSteps.map((stepContent, index) => (
                            <InstructionStep 
                                key={index} 
                                number={index + 1} 
                                title={`Bước ${index + 1}`} 
                                content={stepContent} 
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Chưa có hướng dẫn cụ thể.</Text>
=======
    return (
        <View style={styles.container}>
            <CustomHeader title={currentItem.title} showBackButton={true} />

            <View style={styles.selectorContainer}>
                <CategorySelector 
                    categories={categoryNames}
                    selectedCategory={currentItem.name}
                    onSelectCategory={handleSelectCategory}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <Image 
                    source={{ uri: currentItem.image }} 
                    style={styles.heroImage}
                    resizeMode="cover" 
                />

                <View style={styles.contentContainer}>
                    
                    {currentItem.steps && (
                        <>
                            <InstructionStep number="1" stepData={currentItem.steps.step1} />
                            <InstructionStep number="2" stepData={currentItem.steps.step2} />
                            <InstructionStep number="3" stepData={currentItem.steps.step3} />
                        </>
>>>>>>> dev/Bao
                    )}

                    <View style={styles.mapSection}>
                        <ImageBackground 
                            source={{ uri: 'https://media.wired.com/photos/59269cd37034dc5f91bec0f1/master/pass/GoogleMapTA.jpg' }} 
                            style={styles.mapBackground}
                            imageStyle={{ borderRadius: 16 }}
                            resizeMode="cover"
                        >
                            <View style={styles.mapOverlay}>
                                <View style={styles.mapTextContainer}>
<<<<<<< HEAD
                                    <Text style={styles.mapTitle}>Điểm thu gom</Text>
                                    <Text style={styles.mapSubtitle}>{displayData.locations.length} điểm gần nhất</Text>
                                </View>
=======
                                    <Text style={styles.mapTitle}>Xem bản đồ</Text>
                                    <Text style={styles.mapSubtitle}>{locationCount} điểm gần nhất</Text>
                                </View>

>>>>>>> dev/Bao
                                <TouchableOpacity style={styles.mapButton} activeOpacity={0.8}>
                                    <Text style={styles.mapButtonText}>Mở bản đồ</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </View>

<<<<<<< HEAD
                    <Text style={styles.sectionHeader}>Danh sách địa điểm</Text>
                    
                    {displayData.locations.length > 0 ? (
                        displayData.locations.map((loc, index) => (
=======
                    <Text style={styles.sectionHeader}>Điểm thu gom gần nhất</Text>
                    
                    {currentItem.locations && currentItem.locations.length > 0 ? (
                        currentItem.locations.map((loc, index) => (
>>>>>>> dev/Bao
                            <LocationItem key={index} item={loc} />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Chưa có dữ liệu điểm thu gom.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    selectorContainer: { backgroundColor: '#fff', paddingBottom: 10 },
    scrollContent: { paddingBottom: 40 },
<<<<<<< HEAD
    heroImage: { width: '100%', height: 250, marginBottom: 20, backgroundColor: '#fff' },
=======
    heroImage: { width: '100%', height: 220, marginBottom: 20 },
>>>>>>> dev/Bao
    contentContainer: { paddingHorizontal: 16 },
    stepCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 2,
    },
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    stepNumberBadge: {
<<<<<<< HEAD
        width: 28, height: 28, borderRadius: 14, backgroundColor: '#2F847C',
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    stepNumberText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 14 },
    stepTitle: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#2F847C' },
    stepContent: { fontSize: 15, fontFamily: 'Nunito-Regular', color: '#444', lineHeight: 24, paddingLeft: 38 },
    mapSection: {
        marginTop: 10, marginBottom: 20, borderRadius: 16, overflow: 'hidden',
        height: 150, backgroundColor: '#ccc',
    },
    mapBackground: { width: '100%', height: '100%', flex: 1, justifyContent: 'flex-end' },
    mapOverlay: { 
        padding: 16, backgroundColor: 'rgba(0,0,0,0.4)', 
        height: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end'
    },
    mapTextContainer: { marginBottom: 5 },
    mapTitle: { color: 'white', fontSize: 18, fontFamily: 'Nunito-Bold' },
    mapSubtitle: { color: '#eee', fontSize: 13, fontFamily: 'Nunito-Regular' },
    mapButton: { backgroundColor: 'white', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15 },
    mapButtonText: { color: '#333', fontSize: 14, fontFamily: 'Nunito-Bold' },
    sectionHeader: { fontSize: 18, fontFamily: 'Nunito-Bold', color: '#000', marginBottom: 15, marginTop: 10 },
    locationCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
    locationLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    locationName: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#333', marginBottom: 4 },
    locationDistance: { fontSize: 13, fontFamily: 'Nunito-Regular', color: '#666' },
    emptyText: { fontStyle: 'italic', color: '#888', textAlign: 'center', marginTop: 10, marginBottom: 20 }
=======
        width: 24, height: 24, borderRadius: 12, backgroundColor: '#2F847C',
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    stepNumberText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 12 },
    stepTitle: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#2F847C' },
    stepContent: { fontSize: 15, fontFamily: 'Nunito-Regular', color: '#444', lineHeight: 22, paddingLeft: 34 },

    mapSection: {
        marginTop: 10, marginBottom: 20, borderRadius: 16, overflow: 'hidden',
        height: 180, backgroundColor: '#ccc',
    },
    mapBackground: { width: '100%', height: '100%', flex: 1, justifyContent: 'flex-end' },
    mapOverlay: { padding: 16, backgroundColor: 'rgba(0,0,0,0.3)', height: '100%', justifyContent: 'flex-end' },
    mapTextContainer: { marginBottom: 10 },
    mapTitle: { color: 'white', fontSize: 16, fontFamily: 'Nunito-Bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 },
    mapSubtitle: { color: '#fff', fontSize: 12, fontFamily: 'Nunito-Regular', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 },
    mapButton: { backgroundColor: 'white', borderRadius: 30, paddingVertical: 12, alignItems: 'center', width: '100%' },
    mapButtonText: { color: 'black', fontSize: 16, fontFamily: 'Nunito-Bold' },

    sectionHeader: { fontSize: 18, fontFamily: 'Nunito-Bold', color: '#000', marginBottom: 15 },
    locationCard: { backgroundColor: '#E0E0E0', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    locationLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    locationName: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#000', marginBottom: 4 },
    locationDistance: { fontSize: 14, fontFamily: 'Nunito-Regular', color: '#555' },
    emptyText: { fontStyle: 'italic', color: '#888', textAlign: 'center', marginTop: 10 }
>>>>>>> dev/Bao
});

export default WasteDetailScreen;