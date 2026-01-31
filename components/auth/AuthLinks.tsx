import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AuthLinksProps {
    isLoginMode: boolean;
    isLoading: boolean;
    onToggleMode: () => void;
}

export default function AuthLinks({
    isLoginMode,
    isLoading,
    onToggleMode
}: AuthLinksProps) {
    return (
        <>
            {isLoginMode ? (
                <TouchableOpacity onPress={onToggleMode} disabled={isLoading}>
                    <Text style={[styles.privacyLink, isLoading && styles.disabledText]}>
                        Don't have an account? Sign Up
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={onToggleMode} disabled={isLoading}>
                    <Text style={[styles.privacyLink, isLoading && styles.disabledText]}>
                        Already have an account? Log In
                    </Text>
                </TouchableOpacity>
            )}

            {!isLoginMode && (
                <TouchableOpacity>
                    <Text style={[styles.privacyLink, { marginTop: 10 }]}>Privacy Policy</Text>
                </TouchableOpacity>
            )}

            <View style={{ alignItems: 'center', marginTop: 12 }}>
                <TouchableOpacity disabled={isLoading}>
                    <Text style={[styles.forgotPassword, isLoading && styles.disabledText]}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    privacyLink: {
        fontSize: 12,
        color: '#4E46E5',
        marginTop: 2,
        marginLeft: 22
    },
    forgotPassword: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24
    },
    disabledText: {
        opacity: 0.5,
    },
});
