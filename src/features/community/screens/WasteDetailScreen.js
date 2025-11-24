import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ImageBackground } from 'react-native';
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

    const handleSelectCategory = (name) => {
        const found = allCategories.find(cat => cat.name === name);
        if (found) setCurrentItem(found);
    };

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

    const LocationItem = ({ item }) => (
        <TouchableOpacity style={styles.locationCard} activeOpacity={0.7}>
            <View style={styles.locationLeft}>
                <Ionicons name="location" size={24} color="black" style={{ marginRight: 12 }} />
                <View>
                    <Text style={styles.locationName}>{item.name}</Text>
                    <Text style={styles.locationDistance}>{item.distance}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>
    );

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
                                    <Text style={styles.mapTitle}>Xem bản đồ</Text>
                                    <Text style={styles.mapSubtitle}>{locationCount} điểm gần nhất</Text>
                                </View>

                                <TouchableOpacity style={styles.mapButton} activeOpacity={0.8}>
                                    <Text style={styles.mapButtonText}>Mở bản đồ</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </View>

                    <Text style={styles.sectionHeader}>Điểm thu gom gần nhất</Text>
                    
                    {currentItem.locations && currentItem.locations.length > 0 ? (
                        currentItem.locations.map((loc, index) => (
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
    heroImage: { width: '100%', height: 220, marginBottom: 20 },
    contentContainer: { paddingHorizontal: 16 },
    stepCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 2,
    },
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    stepNumberBadge: {
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
});

export default WasteDetailScreen;