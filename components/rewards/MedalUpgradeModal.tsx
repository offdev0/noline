import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MedalUpgradeModal() {
    const { medalUpgrade, clearMedalUpgrade } = useUser();
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.92)).current;

    useEffect(() => {
        if (!medalUpgrade) return;

        opacity.setValue(0);
        scale.setValue(0.92);

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 260,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 6,
                tension: 80,
            }),
        ]).start();

        const timer = setTimeout(() => clearMedalUpgrade(), 3200);
        return () => clearTimeout(timer);
    }, [medalUpgrade, clearMedalUpgrade, opacity, scale]);

    if (!medalUpgrade) return null;

    return (
        <Modal transparent visible animationType="none">
            <View style={styles.backdrop}>
                <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
                    <View style={styles.iconRow}>
                        <Ionicons name="trophy" size={22} color="#F59E0B" />
                        <Text style={styles.kicker}>Medal Upgraded</Text>
                    </View>
                    <Image source={medalUpgrade.medalAsset} style={styles.medal} resizeMode="contain" />
                    <Text style={styles.title}>New Medal Unlocked!</Text>
                    <Text style={styles.medalName}>{medalUpgrade.medalName}</Text>
                    <Text style={styles.subtitle}>Level {medalUpgrade.level} • {medalUpgrade.points} XP</Text>
                    <TouchableOpacity style={styles.button} onPress={clearMedalUpgrade} activeOpacity={0.85}>
                        <Text style={styles.buttonText}>Awesome</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 22,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 6,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    kicker: {
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        fontWeight: '800',
        color: '#F59E0B',
    },
    medal: {
        width: 90,
        height: 90,
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0F172A',
    },
    medalName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#4338CA',
        marginTop: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 6,
    },
    button: {
        marginTop: 16,
        backgroundColor: '#6366F1',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
});
