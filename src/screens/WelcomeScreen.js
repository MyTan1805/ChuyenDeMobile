import React from "react";
import {
    SafeAreaView,
    View,
    ImageBackground,
    Text,
    TouchableOpacity,
    StyleSheet
} from "react-native";

export default function WelcomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ImageBackground
                source={require('../../assets/header.jpg')}
                resizeMode="cover"
                style={styles.imageBackground}
            >
                <View style={styles.overlay} />
                <View style={styles.container}>
                    <Text style={styles.title}>
                        ECOMATE
                    </Text>

                    <View style={styles.bottomZone}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={styles.buttonText}>Đăng nhập</Text>
                        </TouchableOpacity>

                        <View style={styles.linkContainer}>
                            <Text style={styles.linkText}>
                                {"Chưa có tài khoản? "}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                                <Text style={[styles.linkText, styles.link]}>
                                    Đăng kí
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#000" },
    imageBackground: { flex: 1 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    container: {
        flex: 1,
        justifyContent: 'center', // Căn giữa tiêu đề
        alignItems: 'center',
    },
    title: {
        fontFamily: 'LilitaOne-Regular',
        fontSize: 60,
        color: "#FFFFFF",
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 3 },
        textShadowRadius: 5,
        position: 'absolute', // Đặt tiêu đề ở giữa
        top: '25%',
    },
    bottomZone: {
        position: 'absolute', // Đặt vùng nút ở dưới
        bottom: '15%',
        width: '100%',
        alignItems: 'center',
    },
    button: {
        backgroundColor: "#2F847C",
        borderRadius: 30,
        paddingVertical: 15,
        width: '85%',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    linkContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    linkText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontFamily: 'Inter-Regular',
    },
    link: {
        fontFamily: 'Inter-Bold',
        textDecorationLine: 'underline',
        color: "#46e49aff",
    }
});
