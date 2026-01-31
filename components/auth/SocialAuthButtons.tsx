import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SocialAuthButtonsProps {
    onGooglePress: () => void;
    isLoading: boolean;
    mode: 'login' | 'signup';
}

export default function SocialAuthButtons({ onGooglePress, isLoading, mode }: SocialAuthButtonsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.dividerContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
            </View>

            <TouchableOpacity
                style={[styles.googleButton, isLoading && styles.disabled]}
                onPress={onGooglePress}
                disabled={isLoading}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                </View>
                <Text style={styles.buttonText}>
                    {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 10,
        marginBottom: 20,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    orText: {
        marginHorizontal: 15,
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        marginRight: 12,
    },
    buttonText: {
        color: '#334155',
        fontSize: 16,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.6,
    }
});
