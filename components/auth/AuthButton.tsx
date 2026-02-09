import { t } from '@/i18n';
import React from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface AuthButtonProps {
    isLoading: boolean;
    isLoginMode: boolean;
    buttonScale: Animated.Value;
    onPress: () => void;
}

export default function AuthButton({
    isLoading,
    isLoginMode,
    buttonScale,
    onPress
}: AuthButtonProps) {
    return (
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={onPress}
                disabled={isLoading}
                activeOpacity={0.8}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={[styles.buttonText, { marginLeft: 10 }]}>
                            {isLoginMode ? t('auth.loggingIn') : t('auth.creatingAccount')}
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.buttonText}>
                        {isLoginMode ? t('auth.login') : t('auth.signup')}
                    </Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#5A46E5',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#4E46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
