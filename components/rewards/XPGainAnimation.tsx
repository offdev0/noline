import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface XPGainAnimationProps {
    amount: number;
    onComplete?: () => void;
}

export default function XPGainAnimation({ amount, onComplete }: XPGainAnimationProps) {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation sequence: Fade in and move up, then fade out
        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onComplete) onComplete();
        });
    }, [amount, onComplete, translateY, opacity]);

    return (
        <Animated.View style={[
            styles.container,
            {
                opacity,
                transform: [{ translateY }]
            }
        ]}>
            <View style={styles.bubble}>
                <Ionicons name="sparkles" size={16} color="#FFD700" />
                <Text style={styles.text}>+{amount} XP</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100, // Starting position near the bottom or middle
        alignSelf: 'center',
        zIndex: 1000,
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F46E5', // Matches indigo theme
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    text: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
        marginLeft: 6,
    }
});
