import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Dimensions, SafeAreaView, StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; 
import { LineChart } from 'react-native-chart-kit'; 
import { AQI_SCALE } from '../../../constants/aqiScale';
import { fetchAqiHistory } from '../api/aqiApi'; 

const { width } = Dimensions.get('window');

const AqiDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { aqiData, locationName } = route.params || {};
    
    const [activeTab, setActiveTab] = useState('24h');
    const [chartData, setChartData] = useState(null);
    const [loadingChart, setLoadingChart] = useState(false);

    const getThemeColor = (aqi) => {
        switch(aqi) {
            case 1: return '#4CAF50'; 
            case 2: return '#FFC107'; 
            case 3: return '#cf9b4cff'; 
            case 4: return '#c96a63ff'; 
            default: return '#b45fc3ff';  
        }
    };

    const getGradientColors = (aqi) => {
        switch(aqi) {
            case 1: return ['#43A047', '#A5D6A7'];
            case 2: return ['#F9A825', '#FFF59D'];
            case 3: return ['#EF6C00', '#FFCC80'];
            case 4: return ['#C62828', '#EF9A9A'];
            default: return ['#6A1B9A', '#CE93D8'];
        }
    };

    if (!aqiData) return <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#2F847C"/></View>;

    const { aqi, components } = aqiData;
    const pm25 = components.pm2_5;
    const scaleInfo = AQI_SCALE[aqi] || AQI_SCALE[1]; 
    const themeColor = getThemeColor(aqi);
    const gradientColors = getGradientColors(aqi);

    const processHistoryData = (list, tab) => {
        let labels = [];
        let dataPoints = [];
        
        if (tab === '24h') {
            const recent = list.slice(-24); 
            for (let i = 0; i < recent.length; i += 4) { 
                const item = recent[i];
                const date = new Date(item.dt * 1000);
                labels.push(`${date.getHours()}h`);
                dataPoints.push(item.components.pm2_5);
            }
        } else if (tab === '7d') {
             const recent = list.slice(-168); 
             for (let i = 0; i < recent.length; i += 24) {  
                const item = recent[i];
                const date = new Date(item.dt * 1000);
                const day = date.toLocaleDateString('vi-VN', { weekday: 'narrow' }); // T2, T3...
                labels.push(day); 
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
            if (!aqiData.coord) return;
            setLoadingChart(true);
            try {
                const now = Math.floor(Date.now() / 1000);
                let start = now;
                switch (activeTab) {
                    case '24h': start = now - (24 * 3600); break;
                    case '7d': start = now - (7 * 24 * 3600); break;
                }
                const data = await fetchAqiHistory(aqiData.coord.lat, aqiData.coord.lon, start, now);
                if (data && data.list) {
                    setChartData(processHistoryData(data.list, activeTab));
                }
            } catch (error) { console.error("Chart Error:", error); } 
            finally { setLoadingChart(false); }
        };
        getHistory();
    }, [activeTab, aqiData]);

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        decimalPlaces: 0,
        color: (opacity = 1) => themeColor, 
        labelColor: (opacity = 1) => `rgba(0, 0, 0, 0.5)`,
        style: { borderRadius: 16 },
        propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: "#fff" 
        },
        propsForBackgroundLines: {
            strokeDasharray: "", 
            stroke: "#F0F0F0" 
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColor }]}>
            <StatusBar barStyle="light-content" backgroundColor={themeColor} />
            
            <SafeAreaView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{locationName}</Text>
                    <View style={{width: 40}} /> 
                </View>

                <View style={styles.mainInfo}>
                    <View style={styles.circleContainer}>
                        <View style={styles.circle}>
                            <Text style={styles.aqiNumber}>{pm25.toFixed(0)}</Text>
                            <Text style={styles.aqiLabel}>AQI</Text>
                        </View>
                        <View style={[styles.circlePulse, {borderColor: '#fff', opacity: 0.3}]} />
                    </View>
                    <Text style={styles.statusText}>{scaleInfo.label}</Text>
                    <Text style={styles.updateTime}>Cập nhật: {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
                </View>
            </SafeAreaView>

            <View style={styles.bottomSheet}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <Text style={styles.sectionTitle}>Chỉ số chi tiết</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>PM2.5</Text>
                            <Text style={[styles.gridValue, {color: themeColor}]}>{pm25.toFixed(1)}</Text>
                            <Text style={styles.gridUnit}>µg/m³</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>PM10</Text>
                            <Text style={[styles.gridValue, {color: themeColor}]}>{components.pm10.toFixed(1)}</Text>
                            <Text style={styles.gridUnit}>µg/m³</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>CO</Text>
                            <Text style={[styles.gridValue, {color: themeColor}]}>{components.co.toFixed(1)}</Text>
                            <Text style={styles.gridUnit}>µg/m³</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>NO2</Text>
                            <Text style={[styles.gridValue, {color: themeColor}]}>{components.no2.toFixed(1)}</Text>
                            <Text style={styles.gridUnit}>µg/m³</Text>
                        </View>
                    </View>

                    <View style={[styles.adviceCard, {backgroundColor: themeColor + '10', borderColor: themeColor + '40'}]}>
                        <Ionicons name="medkit-outline" size={24} color={themeColor} style={{marginRight: 12}}/>
                        <Text style={[styles.adviceText, {color: '#333'}]}>{scaleInfo.advice}</Text>
                    </View>

                    <View style={styles.chartHeaderRow}>
                        <Text style={styles.sectionTitle}>Xu hướng</Text>
                        <View style={styles.tabs}>
                            {['24h', '7d'].map(t => (
                                <TouchableOpacity 
                                    key={t} 
                                    style={[styles.tabBtn, activeTab === t && {backgroundColor: themeColor}]}
                                    onPress={() => setActiveTab(t)}
                                >
                                    <Text style={[styles.tabText, activeTab === t && {color: '#fff'}]}>{t.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    
                    <View style={styles.chartContainer}>
                        {loadingChart ? (
                            <ActivityIndicator color={themeColor} style={{marginTop: 50}} />
                        ) : chartData ? (
                            <LineChart
                                data={chartData}
                                width={width - 40} 
                                height={220}
                                chartConfig={chartConfig}
                                bezier  
                                style={{ borderRadius: 16 }}
                                withVerticalLines={false} 
                                withInnerLines={true}  
                                fromZero={true}
                            />
                        ) : (
                            <Text style={{textAlign:'center', marginTop: 30, color: '#999'}}>Không có dữ liệu</Text>
                        )}
                    </View>

                    <View style={{height: 40}} />
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 35 },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 18, fontFamily: 'Nunito-Bold', color: '#fff', flex: 1, textAlign: 'center' },

    mainInfo: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
    circleContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    circle: { 
        width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)', 
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center', alignItems: 'center', zIndex: 2
    },
    aqiNumber: { fontSize: 56, fontFamily: 'LilitaOne-Regular', color: '#fff', lineHeight: 60 },
    aqiLabel: { fontSize: 14, fontFamily: 'Nunito-Bold', color: 'rgba(255,255,255,0.9)' },
    circlePulse: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 1 },
    statusText: { fontSize: 28, fontFamily: 'Nunito-Bold', color: '#fff', textTransform: 'uppercase' },
    updateTime: { fontSize: 12, fontFamily: 'Nunito-Regular', color: 'rgba(255,255,255,0.8)', marginTop: 4 },

    bottomSheet: {
        flex: 1, backgroundColor: '#fff',
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        paddingTop: 25, paddingHorizontal: 20,
        elevation: 10, shadowColor: '#000', shadowOffset: {width: 0, height: -5}, shadowOpacity: 0.1, shadowRadius: 10
    },
    scrollContent: { paddingBottom: 20 },
    sectionTitle: { fontSize: 18, fontFamily: 'Nunito-Bold', color: '#333', marginBottom: 15 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    gridItem: { 
        width: '23%', backgroundColor: '#F8F9FA', borderRadius: 16, padding: 12, 
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#F0F0F0'
    },
    gridLabel: { fontSize: 12, color: '#888', marginBottom: 4, fontFamily: 'Nunito-Bold' },
    gridValue: { fontSize: 15, fontFamily: 'Nunito-Bold', marginBottom: 2 },
    gridUnit: { fontSize: 10, color: '#BBB' },

    adviceCard: { 
        flexDirection: 'row', alignItems: 'center', padding: 16, 
        borderRadius: 16, borderWidth: 1, marginBottom: 25 
    },
    adviceText: { flex: 1, fontSize: 14, fontFamily: 'Nunito-Regular', lineHeight: 22 },

    chartHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    tabs: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 20, padding: 3 },
    tabBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 18 },
    tabText: { fontSize: 12, fontFamily: 'Nunito-Bold', color: '#999' },
    chartContainer: { 
        alignItems: 'center', backgroundColor: '#fff', 
        borderRadius: 20, padding: 5,
        shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3
    }
});

export default AqiDetailScreen;