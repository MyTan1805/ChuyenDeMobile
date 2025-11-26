// src/features/community/screens/EcoLibraryScreen.js

import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, TouchableOpacity, 
    Image, Linking, ActivityIndicator, SafeAreaView, Dimensions, ScrollView 
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { database } from '@/config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

const { width } = Dimensions.get('window');

const EcoLibraryScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('all'); // all, article, video, infographic
    const [libraryData, setLibraryData] = useState({ articles: [], videos: [], infographics: [] });
    const [loading, setLoading] = useState(true);

    // --- 1. Fetch dữ liệu từ Firebase ---
    useEffect(() => {
        const libRef = ref(database, 'eco_library');
        const unsubscribe = onValue(libRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Chuyển Object thành Array
                const articles = data.articles ? Object.values(data.articles).map(i => ({...i, type: 'article'})) : [];
                const videos = data.videos ? Object.values(data.videos).map(i => ({...i, type: 'video'})) : [];
                const infographics = data.infographics ? Object.values(data.infographics).map(i => ({...i, type: 'infographic'})) : [];
                
                setLibraryData({ articles, videos, infographics });
            }
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // --- 2. Lọc dữ liệu theo Tab ---
    const getFilteredData = () => {
        const { articles, videos, infographics } = libraryData;
        if (activeTab === 'article') return articles;
        if (activeTab === 'video') return videos;
        if (activeTab === 'infographic') return infographics;
        // Mặc định 'all': Trộn tất cả và sắp xếp ngẫu nhiên (hoặc theo ngày nếu có)
        return [...articles, ...videos, ...infographics].sort(() => Math.random() - 0.5);
    };

    // --- 3. Render Item cho từng loại ---
    
    // Card Bài viết
    const renderArticle = (item) => (
        <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.9}
            // --- SỬA DÒNG NÀY: Thêm sự kiện onPress ---
            onPress={() => navigation.navigate('ArticleDetail', { article: item })}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardContent}>
                <View style={styles.tagRow}>
                    <View style={[styles.tag, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={[styles.tagText, { color: '#2E7D32' }]}>BÀI VIẾT</Text>
                    </View>
                    <Text style={styles.dateText}>{item.readTime} đọc</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
            </View>
        </TouchableOpacity>
    );

    // Card Video (Mở YouTube)
    const renderVideo = (item) => (
        <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.9}
            onPress={() => Linking.openURL(item.videoUrl)}
        >
            <View style={styles.videoWrapper}>
                <Image source={{ uri: item.thumbnail }} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                </View>
                <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={[styles.tag, { backgroundColor: '#FFEBEE', alignSelf: 'flex-start', marginBottom: 6 }]}>
                    <Text style={[styles.tagText, { color: '#C62828' }]}>VIDEO</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );

    // Card Infographic
    const renderInfographic = (item) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <Image source={{ uri: item.image }} style={[styles.cardImage, { height: 250 }]} resizeMode="contain" backgroundColor="#f0f0f0" />
            <View style={styles.cardContent}>
                <View style={[styles.tag, { backgroundColor: '#E3F2FD', alignSelf: 'flex-start', marginBottom: 6 }]}>
                    <Text style={[styles.tagText, { color: '#1565C0' }]}>INFOGRAPHIC</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => {
        if (item.type === 'article') return renderArticle(item);
        if (item.type === 'video') return renderVideo(item);
        if (item.type === 'infographic') return renderInfographic(item);
        return null;
    };

    // --- 4. Component Tabs ---
    const TabButton = ({ id, label, icon }) => (
        <TouchableOpacity 
            style={[styles.tabBtn, activeTab === id && styles.activeTabBtn]}
            onPress={() => setActiveTab(id)}
        >
            <Ionicons name={icon} size={18} color={activeTab === id ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === id && styles.activeTabText]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Thư viện xanh" showBackButton={true} />
            
            {/* Filter Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    <TabButton id="all" label="Tất cả" icon="grid-outline" />
                    <TabButton id="article" label="Bài viết" icon="document-text-outline" />
                    <TabButton id="video" label="Video" icon="play-circle-outline" />
                    <TabButton id="infographic" label="Infographic" icon="image-outline" />
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2F847C" />
                </View>
            ) : (
                <FlatList
                    data={getFilteredData()}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Chưa có nội dung cho mục này.</Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    // Tabs
    tabContainer: { paddingVertical: 12, backgroundColor: '#fff', marginBottom: 8 },
    tabBtn: { 
        flexDirection: 'row', alignItems: 'center', 
        paddingVertical: 8, paddingHorizontal: 16, 
        borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10 
    },
    activeTabBtn: { backgroundColor: '#2F847C' },
    tabText: { marginLeft: 6, fontSize: 14, fontFamily: 'Nunito-Bold', color: '#666' },
    activeTabText: { color: '#fff' },

    // List & Card
    listContent: { padding: 16, paddingBottom: 40 },
    card: { 
        backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, 
        overflow: 'hidden', elevation: 3,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4,
    },
    cardImage: { width: '100%', height: 180 },
    cardContent: { padding: 12 },
    
    cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#333', marginBottom: 4 },
    cardSummary: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#666', lineHeight: 20 },
    
    tagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    tagText: { fontSize: 10, fontFamily: 'Nunito-Bold' },
    dateText: { fontSize: 12, color: '#999', fontFamily: 'Nunito-Regular' },

    // Video Specific
    videoWrapper: { position: 'relative' },
    playOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(0,0,0,0.2)', 
        justifyContent: 'center', alignItems: 'center' 
    },
    durationBadge: { 
        position: 'absolute', bottom: 8, right: 8, 
        backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 
    },
    durationText: { color: '#fff', fontSize: 12, fontFamily: 'Nunito-Bold' },

    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontFamily: 'Nunito-Regular' }
});

export default EcoLibraryScreen;