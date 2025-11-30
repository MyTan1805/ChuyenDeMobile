import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { shareContent } from '@/utils/shareUtils'; 
import { db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const ArticleDetailScreen = ({ route }) => {
    const { article: initialArticle, articleId } = route.params || {};
    const [article, setArticle] = useState(initialArticle || null);
    const [loading, setLoading] = useState(!initialArticle);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!article && articleId) {
                try {
                    const docRef = doc(db, 'articles', articleId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setArticle({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        console.log("Không tìm thấy bài viết trên Firestore");
                    }
                } catch (e) {
                    console.error("Lỗi tải bài viết:", e);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [articleId, article]);

    const handleShare = () => {
        if (!article) return;
        shareContent({
            title: article.title,
            message: `📚 Đọc bài viết hay: "${article.title}"`,
            path: `article/${article.id || 'unknown'}`
        });
    };

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} color="#2F847C" />;
    if (!article) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Không tìm thấy bài viết</Text>;

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomHeader
                title="Chi tiết bài viết"
                showBackButton={true}
                showSettingsButton={true}
                rightIconName="share-social-outline" 
                onSettingsPress={handleShare} 
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image source={{ uri: article.image }} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.contentContainer}>
                    <View style={styles.metaRow}>
                        <View style={styles.tag}><Text style={styles.tagText}>KIẾN THỨC</Text></View>
                        <Text style={styles.dateText}>{article.readTime || '5 phút'} đọc</Text>
                    </View>
                    <Text style={styles.title}>{article.title}</Text>
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryText}>{article.summary}</Text>
                    </View>
                    <Text style={styles.contentText}>{article.content}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingBottom: 40 },
    heroImage: { width: '100%', height: 250 },
    contentContainer: { padding: 20, backgroundColor: '#fff', marginTop: -25, borderRadius: 25 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    tag: { backgroundColor: '#E8F5E9', padding: 5, borderRadius: 5 },
    tagText: { color: '#2E7D32', fontWeight: 'bold' },
    dateText: { color: '#888' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
    summaryBox: { backgroundColor: '#F9F9F9', padding: 10, borderLeftWidth: 4, borderColor: '#2F847C', marginBottom: 20 },
    summaryText: { fontStyle: 'italic', color: '#555' },
    contentText: { lineHeight: 28, textAlign: 'justify' },
});

export default ArticleDetailScreen;