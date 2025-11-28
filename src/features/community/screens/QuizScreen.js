// src/features/community/screens/QuizScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    Modal, Image, ActivityIndicator, Alert
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import AppButton from '@/components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/store/userStore'; // Import Store

// TRUYỀN route VÀO COMPONENT
const QuizScreen = ({ route }) => { 
    const navigation = useNavigation();

    // Lấy hàm cộng điểm từ Store
    const addPointsToUser = useUserStore((state) => state.addPointsToUser);

    const initialQuestions = route.params?.questions || [];
    const quizTitle = route.params?.quizTitle || "Trắc nghiệm";
    const pointsPerQuestion = route.params?.pointsPerQuestion || 10; 

    // States quản lý game
    const [quizData, setQuizData] = useState(initialQuestions); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentOptionSelected, setCurrentOptionSelected] = useState(null);
    const [correctOption, setCorrectOption] = useState(null);
    const [isOptionsDisabled, setIsOptionsDisabled] = useState(false);
    const [score, setScore] = useState(0);
    const [showNextButton, setShowNextButton] = useState(false);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [totalPointsEarned, setTotalPointsEarned] = useState(0); 

    // Biến trạng thái để lưu trữ dữ liệu của câu hỏi ĐÃ TRẢ LỜI
    const [answeredQuestion, setAnsweredQuestion] = useState(null); 

    useEffect(() => {
        if (initialQuestions.length === 0) {
            Alert.alert("Lỗi", "Không tìm thấy bộ câu hỏi.");
            navigation.goBack();
        } else {
            // Đảm bảo trạng thái được reset khi load bộ câu hỏi mới
            const shuffledQuestions = [...initialQuestions].sort(() => 0.5 - Math.random());
            setQuizData(shuffledQuestions); 
            setCurrentQuestionIndex(0);
            setScore(0);
            setTotalPointsEarned(0); 
            setCurrentOptionSelected(null);
            setCorrectOption(null);
            setIsOptionsDisabled(false);
            setShowNextButton(false);
            setAnsweredQuestion(null); // Reset
        }
    }, [initialQuestions]);


    if (quizData.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <CustomHeader title={quizTitle} showBackButton={true} />
                <Text style={styles.loadingText}>Đang chuẩn bị câu hỏi...</Text>
            </View>
        );
    }
    
    // Lấy câu hỏi hiện tại
    const currentQuestion = quizData[currentQuestionIndex];
    const progress = (currentQuestionIndex + 1) / quizData.length;

    // SỬ DỤNG BIẾN NÀY ĐỂ RENDER PHẦN GIẢI THÍCH VÀ ĐÁP ÁN ĐÚNG
    const questionToDisplay = answeredQuestion || currentQuestion;


    const validateAnswer = (selectedOption) => {
        // Nếu đã bị disable, không làm gì
        if (isOptionsDisabled) return;

        // B1: Lưu câu hỏi hiện tại vào answeredQuestion
        setAnsweredQuestion(currentQuestion);

        let correct_option = currentQuestion.correctAnswer;
        setCurrentOptionSelected(selectedOption);
        setCorrectOption(correct_option);
        setIsOptionsDisabled(true);

        if (selectedOption === correct_option) {
            // Cộng điểm tạm thời (chưa lưu vào DB)
            setScore(score + 1);
            setTotalPointsEarned(prev => prev + pointsPerQuestion); 
        }
        
        setShowNextButton(true);
    };

    const handleNext = async () => {
        if (currentQuestionIndex === quizData.length - 1) {
            
            // LOGIC LƯU ĐIỂM KHI HOÀN THÀNH
            if (totalPointsEarned > 0) {
                 await addPointsToUser(totalPointsEarned);
                 console.log(`Đã cộng ${totalPointsEarned} điểm cho người dùng.`);
            }
            // ---------------------------------------------
            
            setShowScoreModal(true);
        } else {
            // Chuyển sang câu hỏi tiếp theo
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            
            // RESET CÁC TRẠNG THÁI
            setCurrentOptionSelected(null);
            setCorrectOption(null);
            setIsOptionsDisabled(false);
            setShowNextButton(false);
            setAnsweredQuestion(null); // ĐẶT LẠI answeredQuestion để hiển thị câu hỏi mới
        }
    };

    const restartQuiz = () => {
        setShowScoreModal(false);
        // Quay lại màn hình chọn bộ câu hỏi
        navigation.goBack();
    };


    // Component hiển thị tùy chọn đáp án
    const renderOptions = () => {
        return (
            <View>
                {questionToDisplay.options.map((option, index) => {
                    const isSelected = option === currentOptionSelected;
                    const isCorrect = option === correctOption;
                    
                    let backgroundColor = '#fff';
                    let borderColor = '#E0E0E0';
                    let iconName = null;

                    if (isOptionsDisabled) {
                        if (isSelected && isCorrect) {
                            backgroundColor = '#C8E6C9'; 
                            borderColor = '#4CAF50';
                            iconName = "checkmark-circle";
                        } else if (isSelected && !isCorrect) {
                            backgroundColor = '#FFCDD2'; 
                            borderColor = '#F44336';
                            iconName = "close-circle";
                        } else if (isCorrect) {
                            backgroundColor = '#C8E6C9';
                            borderColor = '#4CAF50';
                            iconName = "checkmark-circle";
                        }
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => validateAnswer(option)}
                            disabled={isOptionsDisabled}
                            style={[
                                styles.optionContainer,
                                { backgroundColor, borderColor }
                            ]}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                            {iconName && (
                                <Ionicons 
                                    name={iconName} 
                                    size={24} 
                                    color={iconName === "checkmark-circle" ? "#4CAF50" : "#F44336"} 
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader title={quizTitle} showBackButton={true} /> 
            {/* Thay title cứng bằng title bộ quiz */}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.questionCounter}>
                    Câu hỏi {currentQuestionIndex + 1}/{quizData.length}
                </Text>

                {/* Question Section */}
                <View style={styles.questionContainer}>
                    {/* Luôn hiển thị câu hỏi hiện tại */}
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                </View>

                {/* Options Section */}
                {renderOptions()}

                {/* Explanation Section (hiện sau khi trả lời) */}
                {/* Đảm bảo chỉ hiện giải thích khi đã chọn đáp án và có dữ liệu câu trả lời */}
                {isOptionsDisabled && answeredQuestion && ( 
                    <View style={styles.explanationContainer}>
                        <View style={styles.explanationHeader}>
                            <Ionicons name="bulb" size={20} color="#FFA000" />
                            <Text style={styles.explanationTitle}>Giải thích:</Text>
                        </View>
                        <Text style={styles.explanationText}>{answeredQuestion.explanation}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Next Button Footer */}
            {showNextButton && (
                <View style={styles.footer}>
                    <AppButton 
                        title={currentQuestionIndex === quizData.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
                        onPress={handleNext}
                        style={{ width: '100%' }}
                    />
                </View>
            )}

            {/* Result Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showScoreModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Image 
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/742/742751.png' }} 
                            style={{ width: 120, height: 120, marginBottom: 20 }}
                        />
                        <Text style={styles.modalTitle}>Kết quả</Text>
                        
                        <View style={styles.scoreBoard}>
                            <Text style={[styles.scoreText, { color: score > quizData.length/2 ? '#4CAF50' : '#F44336' }]}>
                                {score}/{quizData.length}
                            </Text>
                            <Text style={styles.scoreLabel}>Câu đúng</Text>
                        </View>
                        
                        {/* HIỂN THỊ ĐIỂM THƯỞNG */}
                        {totalPointsEarned > 0 && (
                            <View style={styles.rewardBox}>
                                <Ionicons name="sparkles" size={24} color="#FF9800" />
                                <Text style={styles.rewardText}>+ {totalPointsEarned} điểm thưởng</Text>
                            </View>
                        )}
                        {/* END HIỂN THỊ ĐIỂM THƯỞNG */}


                        <Text style={styles.congratsText}>
                            {score === quizData.length ? "Xuất sắc! Bạn là chuyên gia môi trường!" : 
                             score > quizData.length/2 ? "Làm tốt lắm! Hãy tiếp tục phát huy." : 
                             "Hãy cố gắng hơn lần sau nhé!"}
                        </Text>

                        <AppButton 
                            title="Chọn bộ khác" 
                            onPress={restartQuiz} // Quay lại màn hình Collection
                            type="secondary"
                            style={{ width: '100%', marginBottom: 10 }}
                        />
                        <AppButton 
                            title="Về trang Cộng đồng" 
                            onPress={() => {
                                setShowScoreModal(false);
                                navigation.pop(2); // Quay lại CommunityMain
                            }}
                            style={{ width: '100%' }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ... (Styles được giữ nguyên)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
    loadingText: { marginTop: 10, fontFamily: 'Nunito-Regular', color: '#555' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    
    // Progress Bar
    progressBarContainer: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginBottom: 10,
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2F847C',
        borderRadius: 4
    },
    questionCounter: {
        fontSize: 14,
        fontFamily: 'Nunito-Bold',
        color: '#888',
        marginBottom: 10
    },

    // Question
    questionContainer: { marginVertical: 15 },
    questionText: {
        fontSize: 22,
        fontFamily: 'Nunito-Bold',
        color: '#333',
        lineHeight: 30
    },

    // Options
    optionContainer: {
        borderWidth: 2,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        flex: 1
    },

    // Explanation
    explanationContainer: {
        marginTop: 20,
        backgroundColor: '#FFF8E1',
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FFA000'
    },
    explanationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    explanationTitle: { fontFamily: 'Nunito-Bold', color: '#FFA000', marginLeft: 5 },
    explanationText: { fontFamily: 'Nunito-Regular', color: '#555', fontStyle: 'italic' },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        elevation: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        elevation: 5
    },
    modalTitle: { fontSize: 28, fontFamily: 'Nunito-Bold', color: '#333', marginBottom: 15 },
    scoreBoard: {
        alignItems: 'center',
        marginBottom: 20
    },
    scoreText: { fontSize: 48, fontFamily: 'LilitaOne-Regular' }, 
    scoreLabel: { fontSize: 16, fontFamily: 'Nunito-Regular', color: '#888' },
    congratsText: {
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        color: '#555',
        textAlign: 'center',
        marginBottom: 30
    },
    // Reward Box Style
    rewardBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFDE7',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFECB3',
    },
    rewardText: {
        marginLeft: 8,
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
        color: '#FF9800',
    }
});

export default QuizScreen;