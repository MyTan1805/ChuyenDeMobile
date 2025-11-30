import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({
    progress = 0,
    height = 8,
    trackColor = '#f0f0f0',
    progressColor = '#4A90E2',
}) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));

    return (
        <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor }]}>
            <View 
                style={[
                    styles.progress, 
                    { 
                        width: `${clampedProgress * 100}%`, 
                        backgroundColor: progressColor,
                        borderRadius: height / 2,
                    }
                ]} 
            />
        </View>
    );
};

const BadgeProgressCard = ({
    title,
    label,
    currentValue,
    maxValue,
    unit = 'điểm',
    progressColor = '#7B61FF',
    style,
}) => {
    const percentage = Math.round((currentValue / maxValue) * 100);
    const progress = currentValue / maxValue;

    return (
        <View style={[styles.container, style]}>
            <View style={styles.row}>
                <Text style={styles.titleText}>{title}</Text>
                <Text style={styles.percentageText}>{percentage}%</Text>
            </View>

            <ProgressBar
                progress={progress}
                style={styles.progressBar}
                progressColor={progressColor}
                trackColor="#FFFFFF"
                height={12}
            />

            <View style={styles.row}>
                <Text style={styles.labelText}>{label}</Text>
                <Text style={styles.valueText}>{`${currentValue}/${maxValue} ${unit}`}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0f1f5',
        borderRadius: 16,
        padding: 20,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        color: '#333',
    },
    percentageText: {
        fontSize: 16,
        fontFamily: 'Nunito-Bold',
        color: '#333',
    },
    progressBar: {
        marginVertical: 12,
    },
    labelText: {
        fontSize: 14,
        fontFamily: 'Nunito-Regular',
        color: '#666',
    },
    valueText: {
        fontSize: 14,
        fontFamily: 'Nunito-Regular',
        color: '#666',
    },

    track: {
        width: '100%',
        justifyContent: 'center',
    },
    progress: {
        height: '100%',
    },
});

export default BadgeProgressCard;