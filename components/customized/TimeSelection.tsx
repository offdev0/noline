import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const getTimeOptions = () => [
    { id: '1h', icon: 'time-outline', label: t('route.hour1'), color: '#6366F1' },
    { id: '3h', icon: 'hourglass-outline', label: t('route.hours3'), color: '#8B5CF6' },
    { id: 'half', icon: 'sunny-outline', label: t('route.halfDay'), color: '#F59E0B' },
    { id: 'full', icon: 'calendar-outline', label: t('route.fullDay'), color: '#EC4899' },
];

interface TimeSelectionProps {
    onSelect: (timeId: string) => void;
    onBack: () => void;
}

export const TimeSelection: React.FC<TimeSelectionProps> = ({ onSelect, onBack }) => {
    const TIME_OPTIONS = getTimeOptions();
    return (
        <View style={styles.container}>
            
            <View style={styles.grid}>
                {TIME_OPTIONS.map(time => (
                    <TouchableOpacity
                        key={time.id}
                        style={styles.card}
                        onPress={() => onSelect(time.id)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[time.color + '15', time.color + '25']}
                            style={styles.cardGradient}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: time.color + '20' }]}>
                                <Ionicons name={time.icon as any} size={28} color={time.color} />
                            </View>
                            <Text style={styles.timeLabel}>{time.label}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    backBtn: {
        padding: 7,
        backgroundColor: '#1c1d1dff',
        borderRadius: 10,


    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: (width - 52) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardGradient: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    timeLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
});
