import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ImageBackground } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import CategorySelector from '@/components/CategorySelector';
import { Ionicons } from '@expo/vector-icons';

// --- KHO ẢNH MINH HỌA ---
const CATEGORY_ILLUSTRATIONS = {
    'huuco': 'https://img.freepik.com/free-vector/organic-waste-recycling-concept-illustration_114360-8968.jpg', 
    'nhua': 'https://img.freepik.com/free-vector/plastic-pollution-concept-illustration_114360-14156.jpg', 
    'kimloai': 'https://img.freepik.com/free-vector/garbage-collection-sorting-concept_1284-17727.jpg', 
    'giay': 'https://img.freepik.com/free-vector/paper-waste-recycling-concept_23-2148602536.jpg', 
    'dientu': 'https://img.freepik.com/free-vector/electronic-waste-recycling-concept_23-2148590393.jpg', 
    'thuytinh': 'https://img.freepik.com/free-vector/glass-waste-concept-illustration_114360-8970.jpg', 
    'yte': 'https://img.freepik.com/free-vector/medical-waste-disposal-concept_23-2148636836.jpg', 
    'default': 'https://img.freepik.com/free-vector/people-sorting-trash-illustration_52683-24760.jpg' 
};

const WasteDetailScreen = ({ route, navigation }) => {
    const { selectedCategory, allCategories = [] } = route.params;
    const [currentItem, setCurrentItem] = useState(selectedCategory);

    const categoryNames = allCategories.length > 0 ? allCategories.map(cat => cat.name) : [];

    const handleSelectCategory = (name) => {
        const found = allCategories.find(cat => cat.name === name);
        if (found) setCurrentItem(found);
    };

    const getDisplayImage = () => {
        if (currentItem.image && (currentItem.image.startsWith('file://') || currentItem.image.startsWith('content://'))) {
            return currentItem.image;
        }
        const catId = (currentItem.name || currentItem.itemName || '').toLowerCase().trim();
        const dbItem = allCategories.find(cat => cat.id === catId || cat.name === currentItem.name);
        if (dbItem && dbItem.image) return dbItem.image;
        return CATEGORY_ILLUSTRATIONS[catId] || CATEGORY_ILLUSTRATIONS['default'];
    };

    const displayData = {
        title: currentItem.title || currentItem.itemName || currentItem.name,
        image: getDisplayImage(),
        steps: currentItem.steps || null, 
        rawInstructions: currentItem.instructions || null, 
        // Dữ liệu locations từ Firebase (đã có trong object currentItem)
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

    // Component hiển thị địa điểm (Có nút chỉ đường đơn giản)
    const LocationItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.locationCard} 
            activeOpacity={0.7}
            // ✅ THÊM SỰ KIỆN NÀY
            onPress={() => {
                navigation.navigate('EnvironmentalMap', { 
                    initialFilter: currentItem.id || 'all',
                    initialPoints: [item] // Chỉ truyền đúng 1 điểm này để bản đồ focus vào nó
                });
            }}
        >
            <View style={styles.locationLeft}>
                <View style={styles.locIconBg}>
                    <Ionicons name="location" size={24} color="#D32F2F" />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.locationName}>{item.name}</Text>
                    <Text style={styles.locationAddress} numberOfLines={2}>{item.address || "Địa chỉ đang cập nhật"}</Text>
                </View>
            </View>
            <View style={styles.directionBtn}>
                 <Ionicons name="navigate-circle-outline" size={28} color="#2F847C" />
            </View>
        </TouchableOpacity>
    );

    const aiSteps = displayData.rawInstructions ? parseAiInstructions(displayData.rawInstructions) : [];

    // HÀM MỞ BẢN ĐỒ (Truyền filter sang EnvironmentalMap)
    const handleOpenMap = () => {
        // Xác định loại rác để filter bản đồ
        // Ví dụ: currentItem.id là 'dientu' -> filter là 'e_waste' (cần map lại ID nếu chưa khớp)
        const filterId = currentItem.id || 'all'; 
        
        navigation.navigate('EnvironmentalMap', { 
            initialFilter: filterId, // Truyền filter sang
            initialPoints: displayData.locations // Truyền luôn danh sách điểm này sang để bản đồ ưu tiên hiển thị
        });
    };

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
                <Image source={{ uri: displayData.image }} style={styles.heroImage} resizeMode={currentItem.image && currentItem.image.startsWith('file') ? "cover" : "contain"} />

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
                            <InstructionStep key={index} number={index + 1} title={`Bước ${index + 1}`} content={stepContent} />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Chưa có hướng dẫn cụ thể.</Text>
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
                                    <Text style={styles.mapTitle}>Điểm thu gom gần nhất</Text>
                                    <Text style={styles.mapSubtitle}>
                                        {displayData.locations.length > 0 
                                            ? `Tìm thấy ${displayData.locations.length} điểm` 
                                            : "Chưa có dữ liệu điểm thu gom"}
                                    </Text>
                                </View>
                                {/* ✅ NÚT MỞ BẢN ĐỒ */}
                                <TouchableOpacity style={styles.mapButton} activeOpacity={0.8} onPress={handleOpenMap}>
                                    <Text style={styles.mapButtonText}>Mở bản đồ lớn</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </View>

                    <Text style={styles.sectionHeader}>Danh sách địa điểm</Text>
                    
                    {displayData.locations.length > 0 ? (
                        displayData.locations.map((loc, index) => (
                            <LocationItem key={index} item={loc} />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Hiện chưa có thông tin điểm thu gom cho loại rác này.</Text>
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
    heroImage: { width: '100%', height: 250, marginBottom: 20, backgroundColor: '#fff' },
    contentContainer: { paddingHorizontal: 16 },
    stepCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 2 },
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    stepNumberBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2F847C', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    stepNumberText: { color: '#fff', fontFamily: 'Nunito-Bold', fontSize: 14 },
    stepTitle: { fontSize: 16, fontFamily: 'Nunito-Bold', color: '#2F847C' },
    stepContent: { fontSize: 15, fontFamily: 'Nunito-Regular', color: '#444', lineHeight: 24, paddingLeft: 38 },
    mapSection: { marginTop: 10, marginBottom: 20, borderRadius: 16, overflow: 'hidden', height: 150, backgroundColor: '#ccc' },
    mapBackground: { width: '100%', height: '100%', flex: 1, justifyContent: 'flex-end' },
    mapOverlay: { padding: 16, backgroundColor: 'rgba(0,0,0,0.5)', height: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end' },
    mapTextContainer: { marginBottom: 5, flex: 1 },
    mapTitle: { color: 'white', fontSize: 18, fontFamily: 'Nunito-Bold' },
    mapSubtitle: { color: '#eee', fontSize: 13, fontFamily: 'Nunito-Regular' },
    mapButton: { backgroundColor: 'white', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 15 },
    mapButtonText: { color: '#333', fontSize: 14, fontFamily: 'Nunito-Bold' },
    sectionHeader: { fontSize: 18, fontFamily: 'Nunito-Bold', color: '#000', marginBottom: 15, marginTop: 10 },
    
    // Location Item Style mới
    locationCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
    locationLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    locIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    locationName: { fontSize: 15, fontFamily: 'Nunito-Bold', color: '#333', marginBottom: 2 },
    locationAddress: { fontSize: 12, fontFamily: 'Nunito-Regular', color: '#666' },
    directionBtn: { padding: 5 },
    
    emptyText: { fontStyle: 'italic', color: '#888', textAlign: 'center', marginTop: 10, marginBottom: 20 }
});

export default WasteDetailScreen;