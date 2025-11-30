import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

const CreateQuizScreen = ({ navigation }) => {
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [correctOption, setCorrectOption] = useState('');  

  const handleCreateQuiz = async () => {
    if (!question || !optionA || !optionB || !optionC || !correctOption) {
        Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ câu hỏi và đáp án");
        return;
    }

    try {
        await addDoc(collection(db, 'quizzes'), {
            question,
            options: { A: optionA, B: optionB, C: optionC },
            correctAnswer: correctOption.toUpperCase(),
            createdAt: serverTimestamp()
        });
        Alert.alert("Thành công", "Đã tạo câu hỏi mới!");
        setQuestion(''); setOptionA(''); setOptionB(''); setOptionC(''); setCorrectOption('');
    } catch (error) {
        Alert.alert("Lỗi", error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding: 20}}>
        <Text style={styles.label}>Câu hỏi:</Text>
        <TextInput style={styles.input} value={question} onChangeText={setQuestion} placeholder="Nhập nội dung câu hỏi..." multiline />

        <Text style={styles.label}>Đáp án A:</Text>
        <TextInput style={styles.input} value={optionA} onChangeText={setOptionA} placeholder="Nhập đáp án A" />

        <Text style={styles.label}>Đáp án B:</Text>
        <TextInput style={styles.input} value={optionB} onChangeText={setOptionB} placeholder="Nhập đáp án B" />

        <Text style={styles.label}>Đáp án C:</Text>
        <TextInput style={styles.input} value={optionC} onChangeText={setOptionC} placeholder="Nhập đáp án C" />

        <Text style={styles.label}>Đáp án đúng (A/B/C):</Text>
        <TextInput style={styles.input} value={correctOption} onChangeText={setCorrectOption} placeholder="Ví dụ: A" maxLength={1} autoCapitalize="characters" />

        <TouchableOpacity style={styles.btn} onPress={handleCreateQuiz}>
            <Text style={styles.btnText}>Tạo Quiz</Text>
        </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  btn: { backgroundColor: '#9B59B6', padding: 15, borderRadius: 8, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default CreateQuizScreen;