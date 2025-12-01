// src/features/community/screens/GreenTipsListScreen.js

import React, { useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Image, Dimensions, ImageBackground, ScrollView
} from 'react-native';
import CustomHeader from '@/components/CustomHeader';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// --- DỮ LIỆU THỰC TẾ CHI TIẾT (REALISTIC & DETAILED DATA) ---
const MOCK_TIPS_DATA = [
    {
        id: '1',
        title: 'Thay thế túi nilon bằng túi vải canvas',
        description: 'Túi nilon mất hàng trăm năm để phân hủy. Hãy mang theo túi vải cá nhân khi đi chợ hoặc siêu thị.',
        content: `Tại sao chúng ta cần thay đổi?\nTúi nilon là một trong những thủ phạm chính gây ô nhiễm trắng. Trung bình một chiếc túi nilon chỉ được sử dụng trong khoảng 20 phút nhưng mất từ 500 đến 1000 năm để phân hủy hoàn toàn. Trong quá trình đó, chúng phân rã thành các hạt vi nhựa, xâm nhập vào nguồn nước và chuỗi thức ăn của con người.\n\nGiải pháp túi vải Canvas:\n1. Độ bền cao: Một chiếc túi vải có thể chịu tải trọng lớn và sử dụng được trong nhiều năm.\n2. Tiết kiệm chi phí: Bạn sẽ không phải tốn tiền mua túi nilon mỗi khi đi siêu thị (ở các nước phát triển).\n3. Tính thẩm mỹ: Túi vải hiện nay được thiết kế rất thời trang, phù hợp để đi làm, đi chơi.\n\nHành động ngay:\nHãy để sẵn 1-2 chiếc túi vải trong cốp xe máy hoặc ba lô của bạn để không bao giờ quên khi cần dùng nhé!`,
        image: 'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?q=80&w=2070&auto=format&fit=crop', // Hình túi vải đi chợ thực tế
        category: 'waste',
        tagName: 'Giảm rác thải',
        readTime: '4 phút'
    },
    {
        id: '2',
        title: 'Tận dụng nước vo gạo tưới cây',
        description: 'Nước vo gạo chứa nhiều vitamin và khoáng chất rất tốt cho cây trồng. Đừng đổ đi lãng phí!',
        content: `Nguồn dinh dưỡng tự nhiên:\nNước vo gạo chứa nhiều tinh bột, Vitamin B1, và các khoáng chất thiết yếu như Kali, Phốt pho, Magie. Đây là loại "thần dược" tự nhiên giúp cây trồng phát triển bộ rễ khỏe mạnh và lá xanh mướt mà không cần dùng phân bón hóa học.\n\nCách thực hiện đúng:\n1. Lấy nước vo: Nên lấy nước vo lần 2 hoặc 3 để hạn chế tạp chất bẩn quá nhiều.\n2. Ủ chua (Khuyên dùng): Để nước vo gạo qua đêm cho lên men nhẹ (có vị chua) sẽ kích thích vi sinh vật có lợi trong đất phát triển tốt hơn.\n3. Tưới gốc: Tưới trực tiếp vào gốc cây, hạn chế tưới lên lá để tránh nấm bệnh.\n\nLưu ý: Không nên tưới nước vo gạo quá đặc hàng ngày, hãy pha loãng hoặc tưới xen kẽ với nước sạch.`,
        image: 'https://images.unsplash.com/photo-1611735341450-74d61e66bbad?q=80&w=2070&auto=format&fit=crop', // Hình tưới cây
        category: 'water',
        tagName: 'Tiết kiệm nước',
        readTime: '3 phút'
    },
    {
        id: '3',
        title: 'Chuyển sang sử dụng bóng đèn LED',
        description: 'Đèn LED tiêu thụ ít điện năng hơn 75% và tuổi thọ cao gấp 25 lần so với đèn sợi đốt.',
        content: `Cuộc cách mạng chiếu sáng:\nViệc chuyển đổi từ đèn sợi đốt hoặc đèn huỳnh quang sang đèn LED không chỉ là xu hướng mà là một bài toán kinh tế thông minh.\n\nLợi ích vượt trội:\n- Hiệu suất cao: Đèn LED chuyển hóa 95% điện năng thành ánh sáng, chỉ 5% thành nhiệt năng (ngược lại với đèn sợi đốt).\n- Tuổi thọ: Một bóng đèn LED chất lượng có thể chiếu sáng tới 50.000 giờ.\n- An toàn: Không chứa thủy ngân như đèn huỳnh quang, giảm thiểu rác thải độc hại ra môi trường.\n\nLời khuyên:\nHãy bắt đầu thay thế các bóng đèn ở những vị trí sử dụng nhiều nhất trong nhà như phòng khách và bếp để thấy hiệu quả tiết kiệm điện rõ rệt ngay tháng đầu tiên.`,
        image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=2035&auto=format&fit=crop', // Hình bóng đèn hiện đại
        category: 'energy',
        tagName: 'Năng lượng',
        readTime: '5 phút'
    },
    {
        id: '4',
        title: 'Ủ phân hữu cơ (Compost) tại nhà',
        description: 'Biến rác thải nhà bếp thành "vàng đen" cho khu vườn của bạn.',
        content: `Compost là gì?\nĐây là quá trình phân hủy các chất hữu cơ (vỏ trái cây, rau thừa, bã cà phê...) thành phân bón tự nhiên giàu dinh dưỡng giống như đất mùn.\n\nQuy tắc Nâu và Xanh:\nĐể thùng ủ không có mùi hôi và phân hủy nhanh, bạn cần cân bằng tỷ lệ:\n- Rác Xanh (Cung cấp Đạm): Vỏ rau củ, trái cây, bã trà, cỏ tươi.\n- Rác Nâu (Cung cấp Carbon): Lá khô, giấy báo cũ, bìa carton, mùn cưa.\n\nTỷ lệ vàng thường là 1 phần Xanh : 2 hoặc 3 phần Nâu. Việc này giúp giảm lượng rác thải sinh hoạt ra bãi chôn lấp tới 50%, đồng thời bạn có nguồn phân bón sạch tuyệt đối cho rau nhà trồng.`,
        image: 'https://images.unsplash.com/photo-1581578014528-d6526f4378f5?q=80&w=2070&auto=format&fit=crop', // Hình ủ phân/đất
        category: 'waste',
        tagName: 'Tái chế',
        readTime: '6 phút'
    },
    {
        id: '5',
        title: 'Sửa chữa ngay các vòi nước bị rò rỉ',
        description: 'Một vòi nước nhỏ giọt có thể lãng phí tới 20 lít nước mỗi ngày.',
        content: `Những con số biết nói:\nBạn có biết một vòi nước bị rò rỉ với tốc độ 1 giọt/giây có thể lãng phí hơn 10.000 lít nước mỗi năm? Con số này đủ để cung cấp nước uống cho một người trong vài năm.\n\nNguyên nhân và cách xử lý:\n- Gioăng cao su bị mòn: Đây là nguyên nhân phổ biến nhất. Bạn chỉ cần mua một miếng gioăng mới với giá vài nghìn đồng và tự thay thế tại nhà.\n- Cặn bẩn bám: Tháo đầu vòi và vệ sinh lưới lọc.\n\nHành động nhỏ này không chỉ giúp giảm hóa đơn tiền nước mà còn thể hiện trách nhiệm bảo vệ tài nguyên nước ngọt đang ngày càng khan hiếm.`,
        image: 'https://images.unsplash.com/photo-1546502208-81d149d52bd7?q=80&w=2073&auto=format&fit=crop', // Hình vòi nước nhỏ giọt
        category: 'water',
        tagName: 'Nước sạch',
        readTime: '3 phút'
    },
    {
        id: '6',
        title: 'Rút phích cắm khi không sử dụng',
        description: 'Thiết bị điện tử vẫn tiêu thụ điện ngay cả khi đã tắt (Phantom Load).',
        content: `Kẻ trộm điện năng thầm lặng:\nNhiều người lầm tưởng tắt TV bằng điều khiển (Remote) là đã ngắt điện hoàn toàn. Thực tế, thiết bị chỉ chuyển sang chế độ chờ (Standby) và vẫn tiêu thụ khoảng 5-10% điện năng so với khi hoạt động.\n\nCác thiết bị tiêu thụ điện ngầm lớn nhất:\n1. Hộp truyền hình cáp / TV box.\n2. Máy tính để bàn (PC) và màn hình.\n3. Cục sạc điện thoại (khi không sạc nhưng vẫn cắm ổ điện).\n4. Lò vi sóng (đèn hiển thị giờ).\n\nGiải pháp:\nSử dụng ổ cắm có công tắc tổng. Khi không dùng, bạn chỉ cần gạt một công tắc để ngắt điện toàn bộ các thiết bị liên quan, vừa tiện lợi vừa an toàn chống cháy nổ.`,
        image: 'https://images.unsplash.com/photo-1563261763-8a3fc106649f?q=80&w=2070&auto=format&fit=crop', // Hình ổ cắm điện
        category: 'energy',
        tagName: 'Điện năng',
        readTime: '4 phút'
    },
    {
        id: '7',
        title: 'Nói không với ống hút nhựa',
        description: 'Ống hút nhựa là rác thải phổ biến nhất đại dương. Hãy chọn giải pháp thay thế.',
        content: `Tác động môi trường:\nỐng hút nhựa quá nhẹ nên thường bị gió cuốn bay hoặc lọt qua các hệ thống lọc rác, cuối cùng trôi ra biển. Chúng gây tổn thương nghiêm trọng cho sinh vật biển (như rùa biển) khi nuốt phải.\n\nCác lựa chọn thay thế xanh:\n- Ống hút Tre/Cỏ: Tự nhiên, phân hủy hoàn toàn, giá thành rẻ.\n- Ống hút Inox/Thủy tinh: Bền, dễ vệ sinh, tái sử dụng vĩnh viễn, mang lại cảm giác sang trọng.\n- Ống hút Gạo: Có thể ăn được, an toàn tuyệt đối.\n\nHãy tập thói quen nói "Không lấy ống hút" khi gọi đồ uống (No straw, please) để giảm thiểu rác thải nhựa dùng một lần.`,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=2070&auto=format&fit=crop', // Hình ống hút tre/kim loại
        category: 'waste',
        tagName: 'Sống xanh',
        readTime: '3 phút'
    },
    {
        id: '8',
        title: 'Tận dụng ánh sáng tự nhiên',
        description: 'Mở cửa sổ đón nắng gió giúp không gian thoáng đãng và diệt khuẩn.',
        content: `Lợi ích kép cho sức khỏe và túi tiền:\nÁnh sáng mặt trời tự nhiên không chỉ giúp bạn tiết kiệm tiền điện chiếu sáng mà còn mang lại nhiều lợi ích sức khỏe không ngờ.\n\nTại sao nên mở cửa sổ?\n1. Diệt khuẩn: Tia UV trong ánh nắng có khả năng tiêu diệt nấm mốc và vi khuẩn trong không khí.\n2. Tăng cường Vitamin D: Giúp xương chắc khỏe và cải thiện tâm trạng.\n3. Điều hòa không khí: Gió trời giúp đẩy khí CO2 tồn đọng trong phòng ra ngoài, mang lại sự tỉnh táo khi làm việc.\n\nThiết kế không gian:\nBố trí bàn làm việc gần cửa sổ, sử dụng rèm cửa sáng màu để khuếch tán ánh sáng tốt hơn vào sâu trong phòng.`,
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop', // Hình cửa sổ nhiều nắng
        category: 'energy',
        tagName: 'Thiên nhiên',
        readTime: '4 phút'
    }
];

const CATEGORY_TABS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'waste', label: 'Giảm rác thải' },
    { id: 'water', label: 'Tiết kiệm nước' },
    { id: 'energy', label: 'Năng lượng' },
];

const GreenTipsListScreen = () => {
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState('all');

    // Logic lọc dữ liệu
    const displayedTips = selectedTab === 'all'
        ? MOCK_TIPS_DATA
        : MOCK_TIPS_DATA.filter(item => item.category === selectedTab);

    // Header của FlatList (Banner + Tabs)
    const ListHeader = () => (
        <View style={styles.headerContainer}>
            {/* 1. Dark Banner */}
            <View style={styles.bannerContainer}>
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop' }} // Ảnh lá cây tối màu
                    style={styles.bannerImage}
                    imageStyle={{ borderRadius: 20 }}
                >
                    <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerTitle}>Chào mừng đến với{'\n'}cuộc sống xanh!</Text>
                        <Text style={styles.bannerSubtitle}>Cùng nhau bảo vệ hành tinh xanh</Text>
                    </View>
                </ImageBackground>
            </View>

            {/* 2. Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
                {CATEGORY_TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tabItem, selectedTab === tab.id && styles.tabItemActive]}
                        onPress={() => setSelectedTab(tab.id)}
                    >
                        <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Mẹo Sống Xanh Mỗi Ngày</Text>
        </View>
    );

    // Render từng Card dọc
    const renderTipCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ArticleDetail', {
                article: {
                    id: item.id,
                    title: item.title,
                    content: item.content, // Sử dụng nội dung chi tiết thực tế
                    image: item.image,
                    category: item.tagName, // Dùng tagName để hiển thị cho đẹp
                    readTime: item.readTime, // Truyền thêm thời gian đọc
                    date: new Date().toLocaleDateString('vi-VN') // Giả lập ngày đăng
                }
            })}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.footerCard}>
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>{item.tagName}</Text>
                    </View>
                    <Text style={styles.readTimeText}>{item.readTime}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CustomHeader title="Sống Xanh" showBackButton={true} />
            <FlatList
                data={displayedTips}
                keyExtractor={item => item.id}
                renderItem={renderTipCard}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    listContent: { paddingBottom: 40 },
    headerContainer: { paddingHorizontal: 16, paddingTop: 16 },

    // Banner Styles
    bannerContainer: { height: 160, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
    bannerImage: { width: '100%', height: '100%', justifyContent: 'center' },
    bannerOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', flex: 1, justifyContent: 'center', paddingHorizontal: 20 }, // Giảm độ tối overlay một chút
    bannerTitle: { fontFamily: 'Nunito-Bold', fontSize: 22, color: '#fff', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
    bannerSubtitle: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#f0f0f0' },

    // Tabs Styles
    tabsScroll: { marginBottom: 20 },
    tabItem: {
        paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20,
        backgroundColor: '#F5F5F5', marginRight: 10,
        borderWidth: 1, borderColor: '#EEEEEE'
    },
    tabItemActive: { backgroundColor: '#2F847C', borderColor: '#2F847C' },
    tabText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#666' },
    tabTextActive: { color: '#fff' },

    // Section Title
    sectionTitle: { fontSize: 18, fontFamily: 'Nunito-Bold', color: '#333', marginBottom: 16 },

    // Card Styles (Vertical)
    card: {
        backgroundColor: '#fff', borderRadius: 16, marginBottom: 20,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08, shadowRadius: 6, marginHorizontal: 16,
        borderWidth: 1, borderColor: '#f0f0f0'
    },
    cardImage: { width: '100%', height: 180, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    cardContent: { padding: 16 },
    cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#2D3436', marginBottom: 8 },
    cardDesc: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#636E72', lineHeight: 22, marginBottom: 12 },
    tagContainer: {
        alignSelf: 'flex-start', backgroundColor: '#E8F5E9',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8
    },
    tagText: { fontSize: 12, color: '#2E7D32', fontFamily: 'Nunito-Bold' },
    footerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8
    },
    readTimeText: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'Nunito-Regular'
    }
});

export default GreenTipsListScreen;