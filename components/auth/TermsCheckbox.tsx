import { t } from '@/i18n';
import Checkbox from 'expo-checkbox';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TermsCheckboxProps {
    isChecked: boolean;
    onValueChange: (value: boolean) => void;
}

export default function TermsCheckbox({
    isChecked,
    onValueChange
}: TermsCheckboxProps) {
    return (
        <View style={styles.checkboxContainer}>
            <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={onValueChange}
                color={isChecked ? '#4A6CFA' : undefined}
            />
            <Text style={styles.checkboxLabel}>
                {t('auth.termsAgreement')}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    checkbox: {
        marginRight: 8,
        marginTop: 4,
        borderRadius: 4,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
        marginTop: -2
    },
});
