// src/features/community/screens/QuizCollectionScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { database } from '@/config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { useUserStore } from '@/store/userStore'; // <-- IMPORT USER STORE

const QuizCollectionScreen = () => {
    const navigation = useNavigation();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Lấy quizResults từ userProfile
    const quizResults = useUserStore(state => state.userProfile?.quizResults || {});

    // Lấy dữ liệu danh sách bộ quiz từ Firebase (GIỮ NGUYÊN)
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
        const questionsObject = quizItem.questions;
        const questionsArray = Object.keys(questionsObject).map(key => ({
            id: key,
            ...questionsObject[key]
        }));
        
        navigation.navigate('Quiz', { 
            questions: questionsArray, 
            quizTitle: quizItem.title,
            pointsPerQuestion: quizItem.pointsPerQuestion,
            quizId: quizItem.id 
        });
    };

    const renderQuizCard = (item) => {
        const totalQuestions = Object.keys(item.questions).length;
        const result = quizResults[item.id]; // Lấy kỷ lục của quiz này
        const hasCompleted = !!result;
        const bestScore = result?.correctCount || 0;
        const canImprove = bestScore < totalQuestions;

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.card, hasCompleted && styles.cardCompleted]}
                onPress={() => handleSelectQuiz(item)}
                activeOpacity={0.8}
            >
                <View style={styles.iconWrapper}>
                    <Ionicons 
                        name={hasCompleted ? "trophy" : "documents-outline"} 
                        size={30} 
                        color={hasCompleted ? "#FFD700" : "#7B61FF"} 
                    />
                </View>
                <View style={styles.textWrapper}>
                    <Text style={styles.quizTitle}>{item.title}</Text>
                    <Text style={styles.quizDescription}>{item.description}</Text>
                    
                    {/* HIỂN THỊ KỶ LỤC CÂU ĐÚNG */}
                    {hasCompleted && (
                        <View style={styles.resultRow}>
                            <Ionicons name="checkmark-done-circle" size={14} color="#4CAF50" />
                            <Text style={styles.resultText}>Kỷ lục: {bestScore}/{totalQuestions} câu</Text>
                            {canImprove && (
                                <Text style={styles.improveText}> (Có thể cải thiện)</Text>
                            )}
                        </View>
                    )}
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.quizLevel}>Cấp độ: {item.level}</Text>
                        <Text style={styles.quizLevel}> | </Text>
                        <Ionicons name="help-circle" size={14} color="#555" />
                        <Text style={styles.quizLevel}>{totalQuestions} câu</Text>
                        
                        {item.pointsPerQuestion && (
                            <>
                                <Text style={styles.quizLevel}> | </Text>
                                <Ionicons name="gift" size={14} color="#FF9800" />
                                <Text style={styles.quizLevel}>{item.pointsPerQuestion} đ/câu</Text>
                            </>
                        )}
                    </View>
                </View>
                <Ionicons name="play-circle" size={36} color="#4CAF50" />
            </TouchableOpacity>
        );
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
                    collections.map((item) => renderQuizCard(item))
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
    // STYLE MỚI: Thẻ đã hoàn thành (nhạt hơn)
    cardCompleted: {
        backgroundColor: '#E8E8E8', 
        opacity: 0.95
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
        marginTop: 4,
    },
    // STYLE MỚI CHO KỶ LỤC
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    resultText: {
        fontSize: 14,
        fontFamily: 'Nunito-Bold',
        color: '#4CAF50',
        marginLeft: 6,
    },
    improveText: {
        fontSize: 12,
        fontFamily: 'Nunito-Regular',
        color: '#FF9800',
        marginLeft: 5
    },
    // END STYLE MỚI
    quizLevel: {
        fontSize: 12,
        fontFamily: 'Nunito-Regular',
        color: '#555',
        marginLeft: 4,
    }
});

export default QuizCollectionScreen;