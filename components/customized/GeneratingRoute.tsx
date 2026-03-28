import { t } from '@/i18n';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export const GeneratingRoute = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.text}>{t('route.generating')}</Text>
            <Text style={styles.subText}>{t('route.planSubtitle')}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 16,
        fontSize: 18,
        color: '#1E293B',
        fontWeight: '800',
    },
    subText: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
