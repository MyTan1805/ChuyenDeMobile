// src/features/community/screens/QuizCollectionScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { database } from '@/config/firebaseConfig';
import { ref, onValue } from 'firebase/database';

const QuizCollectionScreen = () => {
    const navigation = useNavigation();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy dữ liệu danh sách bộ quiz từ Firebase
    useEffect(() => {
        const collectionsRef = ref(database, 'quiz_collections');
        const unsubscribe = onValue(collectionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const collectionsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setCollections(collectionsArray);
            }
            setLoading(false);
        }, (error) => {
            console.error("Lỗi đọc dữ liệu Bộ Quiz:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSelectQuiz = (quizItem) => {
        // Chuyển đối tượng questions thành mảng để truyền đi
        const questionsObject = quizItem.questions;
        const questionsArray = Object.keys(questionsObject).map(key => ({
            id: key,
            ...questionsObject[key]
        }));
        
        // Điều hướng đến màn hình chơi Quiz, truyền theo bộ câu hỏi + điểm
        navigation.navigate('Quiz', { 
            questions: questionsArray, 
            quizTitle: quizItem.title,
            pointsPerQuestion: quizItem.pointsPerQuestion // <-- TRUYỀN ĐIỂM
        });
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2F847C" />
                <Text style={styles.loadingText}>Đang tải bộ câu hỏi...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader title="Chọn Bộ Câu Hỏi" showBackButton={true} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {collections.length === 0 ? (
                    <Text style={styles.emptyText}>Chưa có bộ câu hỏi nào được tạo.</Text>
                ) : (
                    collections.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.card}
                            onPress={() => handleSelectQuiz(item)} // Truyền toàn bộ item
                        >
                            <View style={styles.iconWrapper}>
                                <Ionicons name="documents-outline" size={30} color="#7B61FF" />
                            </View>
                            <View style={styles.textWrapper}>
                                <Text style={styles.quizTitle}>{item.title}</Text>
                                <Text style={styles.quizDescription}>{item.description}</Text>
                                <View style={styles.infoRow}>
                                    <Ionicons name="star" size={14} color="#FFD700" />
                                    <Text style={styles.quizLevel}>Cấp độ: {item.level}</Text>
                                    <Text style={styles.quizLevel}> | </Text>
                                    <Ionicons name="help-circle" size={14} color="#555" />
                                    <Text style={styles.quizLevel}>{Object.keys(item.questions).length} câu</Text>
                                    
                                    {/* HIỂN THỊ ĐIỂM THƯỞNG MỚI */}
                                    {item.pointsPerQuestion && (
                                        <>
                                            <Text style={styles.quizLevel}> | </Text>
                                            <Ionicons name="gift" size={14} color="#FF9800" />
                                            <Text style={styles.quizLevel}>{item.pointsPerQuestion} điểm/câu</Text>
                                        </>
                                    )}
                                    {/* END HIỂN THỊ ĐIỂM THƯỞNG MỚI */}
                                </View>
                            </View>
                            <Ionicons name="play-circle" size={36} color="#4CAF50" />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    loadingText: { marginTop: 10, fontFamily: 'Nunito-Regular', color: '#555' },
    scrollContent: { padding: 20 },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontFamily: 'Nunito-Regular',
        color: '#888'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8EAF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    quizTitle: {
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
        color: '#333',
        marginBottom: 4,
    },
    quizDescription: {
        fontSize: 14,
        fontFamily: 'Nunito-Regular',
        color: '#666',
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quizLevel: {
        fontSize: 12,
        fontFamily: 'Nunito-Regular',
        color: '#555',
        marginLeft: 4,
    }
});

export default QuizCollectionScreen;