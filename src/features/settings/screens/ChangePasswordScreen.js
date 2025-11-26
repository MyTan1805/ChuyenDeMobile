import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { useUserStore } from '@/store/userStore';

const ChangePasswordScreen = ({ navigation }) => {
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [loading, setLoading] = useState(false);
    const { changeUserPassword } = useUserStore();

    const handleChange = async () => {
        if (newPass !== confirmPass) return Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
        if (newPass.length < 6) return Alert.alert("Lỗi", "Mật khẩu quá ngắn");

        setLoading(true);
        const result = await changeUserPassword(newPass);
        setLoading(false);

        if (result.success) {
            Alert.alert("Thành công", "Bạn đã đổi mật khẩu thành công", [
                { text: "Thoát", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Lỗi", "Vui lòng đăng nhập lại để đổi mật khẩu.");
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Đổi mật khẩu" showBackButton={true} />
            <View style={styles.content}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập mật khẩu mới"
                    secureTextEntry
                    value={newPass}
                    onChangeText={setNewPass}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu"
                    secureTextEntry
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                />

                <TouchableOpacity style={styles.button} onPress={handleChange} disabled={loading}>
                    {loading ? <ActivityIndicator color="#333" /> : <Text style={styles.buttonText}>Đổi mật khẩu</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20, paddingTop: 40 },
    input: { backgroundColor: '#E0E0E0', borderRadius: 10, padding: 15, marginBottom: 20, fontFamily: 'Nunito-Regular', fontSize: 16 },
    button: { backgroundColor: '#D9D9D9', padding: 15, borderRadius: 10, alignItems: 'center', width: 150, alignSelf: 'center' },
    buttonText: { fontFamily: 'Nunito-Bold', color: '#333', fontSize: 16 }
});

export default ChangePasswordScreen;