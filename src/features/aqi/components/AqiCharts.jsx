import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0, 
  color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,  
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#2E7D32',
  },
  barPercentage: 0.5, 
};

const mockData = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [
    {
      data: [45, 52, 48, 60, 55, 30, 40], 
    },
  ],
};

export const AqiLineChart = ({ data }) => {  
  const finalData = data || mockData; 
  return (
    <View style={styles.container}>
      <LineChart
        data={finalData}
        width={screenWidth}
        height={220}
        chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(94, 96, 206, ${opacity})`,  
        }}
        bezier  
        style={styles.chartStyle}
        withInnerLines={false}  
        withOuterLines={false}
      />
    </View>
  );
};

export const AqiBarChart = ({ data = mockData }) => {
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
        showValuesOnTopOfBars  
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingLeft: 75,  
  },
  chartStyle: {
    borderRadius: 16,
    paddingRight: 30,  
  },
});