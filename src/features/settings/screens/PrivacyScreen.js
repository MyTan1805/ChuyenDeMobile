import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import CustomHeader from '@/components/CustomHeader';

const PrivacyScreen = () => {
    return (
        <View style={styles.container}>
            <CustomHeader title="Chính sách bảo mật" showBackButton={true} />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.intro}>
                    Chào mừng bạn đến với EcoMate. Chúng tôi cam kết bảo vệ thông tin cá nhân và quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
                </Text>

                <Text style={styles.sectionTitle}>1. Thông tin chúng tôi thu thập</Text>
                <Text style={styles.paragraph}>
                    Để cung cấp dịch vụ tốt nhất, chúng tôi có thể thu thập các loại thông tin sau:
                    {'\n'}• <Text style={styles.bold}>Thông tin cá nhân:</Text> Tên hiển thị, địa chỉ email, số điện thoại và ảnh đại diện khi bạn đăng ký tài khoản.
                    {'\n'}• <Text style={styles.bold}>Dữ liệu vị trí:</Text> Chúng tôi thu thập vị trí địa lý (GPS) của bạn để cung cấp các tính năng như chỉ số chất lượng không khí (AQI) tại địa phương và gợi ý các sự kiện cộng đồng gần bạn.
                    {'\n'}• <Text style={styles.bold}>Nội dung người dùng:</Text> Các bài đăng, hình ảnh báo cáo vi phạm, bình luận và tin nhắn bạn chia sẻ trên nền tảng.
                </Text>

                <Text style={styles.sectionTitle}>2. Cách chúng tôi sử dụng thông tin</Text>
                <Text style={styles.paragraph}>
                    Thông tin của bạn được sử dụng cho các mục đích sau:
                    {'\n'}• <Text style={styles.bold}>Cung cấp dịch vụ:</Text> Xác thực tài khoản, hiển thị thông tin môi trường chính xác theo vị trí.
                    {'\n'}• <Text style={styles.bold}>Cải thiện trải nghiệm:</Text> Cá nhân hóa nội dung, đề xuất các chiến dịch xanh phù hợp.
                    {'\n'}• <Text style={styles.bold}>Liên lạc:</Text> Gửi thông báo về các cập nhật quan trọng, cảnh báo thời tiết hoặc thay đổi chính sách.
                    {'\n'}• <Text style={styles.bold}>An toàn:</Text> Phát hiện và ngăn chặn các hành vi gian lận hoặc lạm dụng nền tảng.
                </Text>

                <Text style={styles.sectionTitle}>3. Chia sẻ dữ liệu</Text>
                <Text style={styles.paragraph}>
                    Chúng tôi cam kết <Text style={styles.bold}>không bán</Text> dữ liệu cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp:
                    {'\n'}• Khi có sự đồng ý của bạn.
                    {'\n'}• Với các đối tác cung cấp dịch vụ hạ tầng (như Google Cloud, Firebase) để vận hành ứng dụng.
                    {'\n'}• Khi có yêu cầu hợp pháp từ cơ quan chức năng.
                </Text>

                <Text style={styles.sectionTitle}>4. Quyền truy cập thiết bị</Text>
                <Text style={styles.paragraph}>
                    Ứng dụng có thể yêu cầu quyền truy cập vào một số tính năng trên thiết bị của bạn:
                    {'\n'}• <Text style={styles.bold}>Camera & Thư viện ảnh:</Text> Để bạn có thể chụp và tải lên hình ảnh cho bài viết hoặc báo cáo môi trường.
                    {'\n'}• <Text style={styles.bold}>Vị trí:</Text> Để xác định tọa độ báo cáo và lấy dữ liệu AQI.
                    {'\n'}• <Text style={styles.bold}>Thông báo:</Text> Để gửi tin tức và nhắc nhở.
                </Text>

                <Text style={styles.sectionTitle}>5. Bảo mật dữ liệu</Text>
                <Text style={styles.paragraph}>
                    EcoMate áp dụng các biện pháp bảo mật kỹ thuật tiêu chuẩn (như mã hóa SSL) để bảo vệ thông tin của bạn khỏi truy cập trái phép. Tuy nhiên, không có phương thức truyền tải nào qua Internet là an toàn tuyệt đối 100%.
                </Text>

                <Text style={styles.sectionTitle}>6. Quyền của người dùng</Text>
                <Text style={styles.paragraph}>
                    Bạn có quyền:
                    {'\n'}• Truy cập và chỉnh sửa thông tin cá nhân trong phần Cài đặt.
                    {'\n'}• Yêu cầu xóa tài khoản và dữ liệu cá nhân vĩnh viễn.
                    {'\n'}• Tắt chia sẻ vị trí hoặc thông báo bất cứ lúc nào.
                </Text>

                <Text style={styles.sectionTitle}>7. Thay đổi chính sách</Text>
                <Text style={styles.paragraph}>
                    Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo trên ứng dụng. Việc bạn tiếp tục sử dụng EcoMate đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
                </Text>

                <Text style={styles.footer}>
                    Cập nhật lần cuối: 26/11/2025
                </Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    intro: {
        fontFamily: 'Nunito-Regular',
        fontSize: 15,
        color: '#555',
        marginBottom: 20,
        lineHeight: 22,
        fontStyle: 'italic'
    },
    sectionTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 18,
        color: '#2F847C', // Màu thương hiệu
        marginTop: 15,
        marginBottom: 8
    },
    paragraph: {
        fontFamily: 'Nunito-Regular',
        fontSize: 15,
        color: '#333',
        lineHeight: 24,
        marginBottom: 10,
        textAlign: 'justify'
    },
    bold: {
        fontFamily: 'Nunito-Bold',
        color: '#000'
    },
    footer: {
        marginTop: 30,
        textAlign: 'center',
        fontFamily: 'Nunito-Regular',
        fontSize: 13,
        color: '#999'
    }
});

export default PrivacyScreen;