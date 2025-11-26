import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import CustomHeader from '@/components/CustomHeader';

const TermsScreen = () => {
    return (
        <View style={styles.container}>
            <CustomHeader title="Điều khoản dịch vụ" showBackButton={true} />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.intro}>
                    Chào mừng bạn đến với EcoMate. Vui lòng đọc kỹ các Điều khoản dịch vụ này trước khi sử dụng ứng dụng. Việc bạn truy cập và sử dụng EcoMate đồng nghĩa với việc bạn chấp nhận tuân thủ các điều khoản này.
                </Text>

                <Text style={styles.sectionTitle}>1. Tài khoản người dùng</Text>
                <Text style={styles.paragraph}>
                    • Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.
                    {'\n'}• Bạn cam kết cung cấp thông tin chính xác khi đăng ký.
                    {'\n'}• Bạn không được phép sử dụng tài khoản của người khác hoặc mạo danh bất kỳ cá nhân/tổ chức nào.
                </Text>

                <Text style={styles.sectionTitle}>2. Quy tắc ứng xử cộng đồng</Text>
                <Text style={styles.paragraph}>
                    EcoMate là một cộng đồng xanh, văn minh. Bạn cam kết <Text style={styles.bold}>KHÔNG</Text> thực hiện các hành vi sau:
                    {'\n'}• Đăng tải nội dung kích động thù địch, bạo lực, khiêu dâm hoặc vi phạm pháp luật.
                    {'\n'}• Spam tin nhắn, bình luận hoặc tạo các báo cáo môi trường giả mạo (spam reports).
                    {'\n'}• Quấy rối, đe dọa hoặc xâm phạm quyền riêng tư của người dùng khác.
                </Text>

                <Text style={styles.sectionTitle}>3. Quyền sở hữu nội dung</Text>
                <Text style={styles.paragraph}>
                    • <Text style={styles.bold}>Nội dung của bạn:</Text> Bạn giữ quyền sở hữu đối với các hình ảnh, bài viết bạn đăng tải. Tuy nhiên, bạn cấp cho EcoMate quyền sử dụng phi độc quyền để hiển thị và quảng bá trên nền tảng.
                    {'\n'}• <Text style={styles.bold}>Tài sản của EcoMate:</Text> Toàn bộ giao diện, logo, mã nguồn, và dữ liệu tổng hợp thuộc sở hữu trí tuệ của EcoMate Team.
                </Text>

                <Text style={styles.sectionTitle}>4. Tính chính xác của thông tin</Text>
                <Text style={styles.paragraph}>
                    • Các chỉ số môi trường (như AQI) và lịch thu gom rác được cung cấp dựa trên các nguồn dữ liệu công khai hoặc từ cộng đồng.
                    {'\n'}• Mặc dù chúng tôi nỗ lực để đảm bảo tính chính xác, EcoMate không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh do sự sai lệch của dữ liệu này so với thực tế.
                </Text>

                <Text style={styles.sectionTitle}>5. Chấm dứt sử dụng</Text>
                <Text style={styles.paragraph}>
                    Chúng tôi có quyền tạm khóa hoặc xóa vĩnh viễn tài khoản của bạn mà không cần báo trước nếu phát hiện bạn vi phạm nghiêm trọng các Điều khoản này (ví dụ: cố tình phá hoại dữ liệu bản đồ xanh, lừa đảo).
                </Text>

                <Text style={styles.sectionTitle}>6. Thay đổi điều khoản</Text>
                <Text style={styles.paragraph}>
                    EcoMate có thể cập nhật các điều khoản này bất cứ lúc nào để phù hợp với quy định pháp luật hoặc tính năng mới của ứng dụng. Chúng tôi sẽ thông báo cho bạn về những thay đổi quan trọng.
                </Text>

                <Text style={styles.sectionTitle}>7. Liên hệ</Text>
                <Text style={styles.paragraph}>
                    Nếu bạn có thắc mắc về các điều khoản này, vui lòng liên hệ với chúng tôi qua mục "Gửi phản hồi / Hỗ trợ" trong phần Cài đặt.
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
        color: '#2F847C', // Màu xanh thương hiệu
        marginTop: 15,
        marginBottom: 8
    },
    paragraph: {
        fontFamily: 'Nunito-Regular',
        fontSize: 15,
        color: '#333',
        lineHeight: 24,
        marginBottom: 10,
        textAlign: 'justify' // Căn đều 2 bên cho đẹp mắt
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

export default TermsScreen;