import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Cấu hình giao diện biểu đồ
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0, // Không hiện số thập phân
  color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`, // Màu xanh lá chủ đạo
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#2E7D32',
  },
  barPercentage: 0.5, // Độ rộng của cột
};

// Dữ liệu giả lập (Mock data) - Sẽ thay bằng API Forecast sau này
const mockData = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [
    {
      data: [45, 52, 48, 60, 55, 30, 40], // Chỉ số PM2.5 giả lập
    },
  ],
};

export const AqiLineChart = () => {
  return (
    <View style={styles.container}>
      <LineChart
        data={mockData}
        width={screenWidth - 40} // Trừ padding 2 bên
        height={220}
        chartConfig={{
            ...chartConfig,
            // Tạo hiệu ứng đường cong mềm mại
            color: (opacity = 1) => `rgba(94, 96, 206, ${opacity})`, // Màu tím xanh
        }}
        bezier // Tạo đường cong
        style={styles.chartStyle}
        withInnerLines={false} // Ẩn lưới ngang dọc cho sạch
        withOuterLines={false}
      />
    </View>
  );
};

export const AqiBarChart = ({ data = mockData }) => {
    // Tùy chỉnh màu từng cột dựa trên giá trị (Xanh/Vàng/Đỏ) - Advanced
    // Hiện tại dùng 1 màu chung cho đơn giản
  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={chartConfig}
        style={styles.chartStyle}
        showValuesOnTopOfBars // Hiện số trên đầu cột
        withInnerLines={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartStyle: {
    borderRadius: 16,
    paddingRight: 30, // Padding để số cuối không bị mất
  },
});