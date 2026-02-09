import { t } from '@/i18n';
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
                        {t('auth.noAccount')}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={onToggleMode} disabled={isLoading}>
                    <Text style={[styles.privacyLink, isLoading && styles.disabledText]}>
                        {t('auth.haveAccount')}
                    </Text>
                </TouchableOpacity>
            )}

            {!isLoginMode && (
                <TouchableOpacity>
                    <Text style={[styles.privacyLink, { marginTop: 10 }]}>{t('auth.privacyPolicy')}</Text>
                </TouchableOpacity>
            )}

            <View style={{ alignItems: 'center', marginTop: 12 }}>
                <TouchableOpacity disabled={isLoading}>
                    <Text style={[styles.forgotPassword, isLoading && styles.disabledText]}>
                        {t('auth.forgotPassword')}
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
