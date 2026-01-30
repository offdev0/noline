import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface AuthInputProps extends TextInputProps {
    label: string;
    isPassword?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
}

export default function AuthInput({
    label,
    isPassword = false,
    showPassword = false,
    onTogglePassword,
    ...props
}: AuthInputProps) {
    return (
        <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>{label}</Text>
            </View>

            {isPassword ? (
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, styles.passwordInput]}
                        secureTextEntry={!showPassword}
                        {...props}
                    />
                    <TouchableOpacity
                        onPress={onTogglePassword}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            ) : (
                <TextInput
                    style={styles.input}
                    {...props}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: 20,
        position: 'relative',
    },
    inputLabelContainer: {
        position: 'absolute',
        top: -10,
        left: 12,
        zIndex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 4,
    },
    inputLabel: {
        fontSize: 12,
        color: '#666',
    },
    input: {
        height: 56,
        borderWidth: 1.5,
        borderColor: '#787878',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000',
        backgroundColor: 'transparent',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
});
