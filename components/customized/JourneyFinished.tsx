import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@/i18n';

interface JourneyFinishedProps {
    numStops: number;
    onReset: () => void;
}

export const JourneyFinished: React.FC<JourneyFinishedProps> = ({ numStops, onReset }) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconCircle}>
                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.title}>{t('route.journeyComplete')}</Text>
            <Text style={styles.subText}>
                You've visited all {numStops} stops in your personalized route!
            </Text>

            <TouchableOpacity style={styles.btn} onPress={onReset}>
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    <Ionicons name="refresh" size={24} color="#fff" />
                    <Text style={styles.btnText}>{t('route.backToStart')}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#fff',
        borderRadius: 32,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    btn: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
