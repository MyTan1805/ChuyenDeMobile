import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockActions = [
    { id: 1, text: 'Tắt đèn khi ra khỏi phòng', points: 10, completed: false },
    { id: 2, text: 'Sử dụng túi vải khi mua sắm', points: 15, completed: false },
    { id: 3, text: 'Phân loại rác tại nhà', points: 20, completed: true },
    { id: 4, text: 'Trồng một cây xanh mới', points: 50, completed: false },
];

const DailyActions = () => {
    const [actions, setActions] = useState(mockActions);

    const toggleAction = (id) => {
        const newActions = actions.map(a => a.id === id ? { ...a, completed: !a.completed } : a);
        setActions(newActions);
    };

    const completedCount = actions.filter(a => a.completed).length;
    const progress = Math.round((completedCount / actions.length) * 100);

    return (
        <View style={styles.card}>
            {/* Header Progress */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Tiến độ</Text>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.headerText}>{progress}% hoàn thành</Text>
            </View>

            {/* Danh sách hành động */}
            {actions.map((action) => (
                <TouchableOpacity 
                    key={action.id} 
                    style={styles.actionItem}
                    activeOpacity={0.7}
                    onPress={() => toggleAction(action.id)}
                >
                    {/* Checkbox */}
                    <MaterialCommunityIcons 
                        name={action.completed ? "checkbox-marked" : "checkbox-blank-outline"} 
                        size={24} 
                        color={action.completed ? "#2E7D32" : "#CCC"} 
                        style={styles.checkboxIcon}
                    />
                    
                    <Text style={[
                        styles.actionText, 
                        action.completed && styles.textCompleted // Gạch ngang nếu xong
                    ]}>
                        {action.text}
                    </Text>
                    
                    <Text style={styles.points}>{action.points} điểm</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    card: { 
        backgroundColor: '#F5F5F5', // Màu nền xám của khối
        borderRadius: 20, 
        padding: 20,
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20 
    },
    headerText: { 
        fontSize: 12, 
        color: '#666', 
        fontWeight: '600' 
    },
    progressBarBg: { 
        flex: 1, 
        height: 10, 
        backgroundColor: '#FFF', // Nền trắng cho thanh bar
        borderRadius: 5, 
        marginHorizontal: 10,
        overflow: 'hidden' 
    },
    progressBarFill: { 
        height: '100%', 
        backgroundColor: '#5E60CE', // Màu tím xanh (Gradient giả lập)
        borderRadius: 5 
    },
    actionItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 18 
    },
    checkboxIcon: {
        marginRight: 12
    },
    actionText: { 
        flex: 1, 
        fontSize: 14, 
        color: '#333',
        fontWeight: '500'
    },
    textCompleted: {
        textDecorationLine: 'line-through',
        color: '#999'
    },
    points: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: '#555' 
    },
});

export default DailyActions;