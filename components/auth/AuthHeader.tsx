import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AuthHeaderProps {
    title?: string;
}

export default function AuthHeader({ title = 'NoLine' }: AuthHeaderProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.appName}>{title}</Text>
            <View style={styles.logoContainer}>
                <Ionicons name="hourglass-outline" size={60} color="#FFD700" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
        height: '25%',
        justifyContent: 'center'
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    logoContainer: {
        // marginBottom: 20,
    },
});
