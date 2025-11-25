import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { AQI_SCALE } from '../../../constants/aqiScale';

// Import Components
import CustomHeader from '../../../components/CustomHeader';
import { AqiBarChart } from '../components/AqiCharts'; 
import { fetchAqiHistory } from '../api/aqiApi'; 

const AqiDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { aqiData, locationName } = route.params || {};
    
    const [activeTab, setActiveTab] = useState('24h');
    const [chartData, setChartData] = useState(null);
    const [loadingChart, setLoadingChart] = useState(false);

    // Loading State
    if (!aqiData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang tải dữ liệu...</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: 'blue' }}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { aqi, components, coord } = aqiData;
    const pm25 = components.pm2_5;
    const scaleInfo = AQI_SCALE[aqi] || AQI_SCALE[1]; 

    const displayData = {
        score: pm25.toFixed(0), 
        status: scaleInfo.label, 
        color: scaleInfo.color,
        warning: `Nồng độ PM2.5 là ${pm25} μg/m³. ${scaleInfo.advice}`
    };

    // --- HÀM XỬ LÝ DỮ LIỆU BIỂU ĐỒ (ĐÃ SỬA LOGIC 30 NGÀY) ---
    const processHistoryData = (list, tab) => {
        let labels = [];
        let dataPoints = [];
        
        // 1. Logic cho 24 Giờ (Lấy mỗi 4 tiếng 1 lần)
        if (tab === '24h') {
            const recent = list.slice(-24); // Lấy 24 tiếng cuối
            for (let i = 0; i < recent.length; i += 4) { 
                const item = recent[i];
                const date = new Date(item.dt * 1000);
                labels.push(`${date.getHours()}h`);
                dataPoints.push(item.components.pm2_5);
            }
        } 
        // 2. Logic cho 7 Ngày (Lấy mỗi ngày 1 lần)
        else if (tab === '7d') {
             const recent = list.slice(-168); // 7 ngày * 24h = 168
             for (let i = 0; i < recent.length; i += 24) { // Bước nhảy 24h
                const item = recent[i];
                const date = new Date(item.dt * 1000);
                // Lấy thứ (T2, T3...)
                const day = date.toLocaleDateString('vi-VN', { weekday: 'narrow' }); // T, H, B...
                labels.push(day); // Hoặc dùng weekday: 'short' nếu muốn Mon, Tue
                dataPoints.push(item.components.pm2_5);
             }
        }
        // 3. Logic cho 30 Ngày (SỬA MỚI: Lấy mỗi ngày 1 lần)
        else { 
            const recent = list.slice(-720); // 30 ngày * 24h = 720
            for (let i = 0; i < recent.length; i += 24) { // Bước nhảy 24h (mỗi ngày 1 điểm)
                const item = recent[i];
                const date = new Date(item.dt * 1000);
                
                // Để nhãn không bị dày đặc quá, ta chỉ hiện ngày chẵn hoặc cách 5 ngày
                // Nhưng ta cứ push data vào, thư viện chart sẽ tự lo việc hiển thị nếu có thể
                // Format: Ngày/Tháng (vd: 15/2)
                const dayStr = `${date.getDate()}/${date.getMonth() + 1}`;
                
                // Chỉ hiển thị nhãn cho mỗi 5 ngày để đỡ rối mắt, các ngày khác để trống
                if (i % (24 * 5) === 0) {
                    labels.push(dayStr);
                } else {
                    labels.push(""); // Nhãn trống nhưng vẫn có cột
                }

                dataPoints.push(item.components.pm2_5);
            }
        }

        return {
            labels: labels,
            datasets: [{ data: dataPoints }]
        };
    };

    useEffect(() => {
        const getHistory = async () => {
            if (!coord) return;
            setLoadingChart(true);
            
            try {
                const now = Math.floor(Date.now() / 1000);
                let start = now;
                
                switch (activeTab) {
                    case '24h': start = now - (24 * 3600); break;
                    case '7d': start = now - (7 * 24 * 3600); break;
                    case '30d': start = now - (30 * 24 * 3600); break;
                }

                const data = await fetchAqiHistory(coord.lat, coord.lon, start, now);
                
                if (data && data.list) {
                    const finalChartData = processHistoryData(data.list, activeTab);
                    setChartData(finalChartData);
                }
            } catch (error) {
                console.error("Chart Error:", error);
            } finally {
                setLoadingChart(false);
            }
        };

        getHistory();
    }, [activeTab, coord]);

    // --- Component Render (Giữ nguyên như cũ) ---
    const renderMainCard = () => (
        <View style={styles.card}>
            <Text style={styles.locationTitle}>{locationName}</Text>
            <View style={styles.mainCardTop}>
                <View style={[styles.scoreBox, { backgroundColor: displayData.color }]}>
                    <Text style={styles.scoreText}>{displayData.score}</Text>
                    <Text style={styles.scoreLabel}>PM2.5</Text>
                </View>
                <Text style={[styles.statusText, { color: displayData.color }]}>{displayData.status}</Text>
                <View style={styles.faceIcon}>
                    {aqi <= 2 ? <FontAwesome5 name="smile" size={40} color={displayData.color} /> :
                     aqi === 3 ? <FontAwesome5 name="meh" size={40} color={displayData.color} /> :
                     <FontAwesome5 name="frown" size={40} color={displayData.color} />}
                </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.pollutantContainer}>
                <Text style={styles.pollutantLabel}>Chất gây ô nhiễm chính:</Text>
                <Text style={styles.pollutantValue}>PM2.5</Text>
            </View>
            <View style={styles.subPollutants}>
                <Text style={styles.subPollutantText}>CO: {components.co}</Text>
                <Text style={styles.subPollutantText}>NO2: {components.no2}</Text>
                <Text style={styles.subPollutantText}>O3: {components.o3}</Text>
            </View>
        </View>
    );

    const renderRecommendations = () => (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Khuyến nghị về sức khỏe</Text>
            <View style={styles.recItem}>
                <View style={styles.recIconBox}><MaterialCommunityIcons name="face-mask" size={20} color="#555" /></View>
                <Text style={styles.recText}>{aqi >= 3 ? "Nên đeo khẩu trang khi ra ngoài." : "Không khí tốt, không cần khẩu trang."}</Text>
            </View>
            <View style={styles.recItem}>
                 <View style={styles.recIconBox}><MaterialCommunityIcons name="run" size={20} color="#555" /></View>
                <Text style={styles.recText}>{aqi >= 3 ? "Hạn chế vận động mạnh ngoài trời." : "Thoải mái tập thể dục ngoài trời."}</Text>
            </View>
        </View>
    );

    const renderWarning = () => (
        <View style={[styles.warningCard, { backgroundColor: aqi >= 3 ? '#FFEBEE' : '#E8F5E9' }]}>
            <Ionicons name={aqi >= 3 ? "alert-circle" : "checkmark-circle"} size={28} color={aqi >= 3 ? "#D32F2F" : "#388E3C"} style={{ marginRight: 10 }}/>
            <Text style={[styles.warningText, { color: aqi >= 3 ? "#D32F2F" : "#388E3C" }]}>{displayData.warning}</Text>
        </View>
    );

    const renderHistory = () => (
        <View style={[styles.card, { minHeight: 320 }]}>
            <Text style={styles.sectionTitle}>Lịch sử</Text>
            <View style={styles.tabContainer}>
                {[{ key: '24h', title: '24 giờ' }, { key: '7d', title: '7 ngày' }, { key: '30d', title: '30 ngày' }].map((tab) => (
                    <TouchableOpacity key={tab.key} style={[styles.tabItem, activeTab === tab.key && styles.activeTabItem]} onPress={() => setActiveTab(tab.key)}>
                        <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {loadingChart ? (
                 <ActivityIndicator size="small" color="#333" style={{marginTop: 50}}/>
            ) : chartData ? (
                <View style={{ marginTop: 15 }}>
                    {/* Truyen vao activeTab de component Chart biet ma dieu chinh do rong cot */}
                    <AqiBarChart data={chartData} /> 
                </View>
            ) : <Text>Không có dữ liệu</Text>}
            <Text style={styles.chartNote}>Số liệu PM2.5 trung bình (μg/m³)</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <CustomHeader useLogo={true} showBackButton={true} showNotificationButton={true} />
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {renderMainCard()}
                {renderRecommendations()}
                {renderWarning()}
                {renderHistory()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    contentContainer: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    locationTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 15 },
    mainCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    scoreBox: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center', minWidth: 75 },
    scoreText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    scoreLabel: { fontSize: 10, color: '#fff', fontWeight: '600' },
    statusText: { fontSize: 28, fontWeight: 'bold', flex: 1, textAlign: 'center' },
    faceIcon: { width: 45, alignItems: 'center' },
    divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 15 },
    pollutantContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pollutantLabel: { fontSize: 16, color: '#555' },
    pollutantValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    subPollutants: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
    subPollutantText: { fontSize: 12, color: '#888' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    recItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    recIconBox: { width: 40, height: 40, backgroundColor: '#F5F5F5', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    recText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 20 },
    warningCard: { borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    warningText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, padding: 4, marginBottom: 15 },
    tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    activeTabItem: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    tabText: { fontSize: 13, color: '#888', fontWeight: '500' },
    activeTabText: { color: '#333', fontWeight: 'bold' },
    chartNote: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 15, fontStyle: 'italic' }
});

export default AqiDetailScreen;