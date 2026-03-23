import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface AuthHeaderProps {
    title?: string;
}

export default function AuthHeader({ title = 'NoLine' }: AuthHeaderProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.appName}>{title}</Text>
            <View style={styles.logoContainer}>
                <Image source={require('@/assets/logo.png')} style={styles.logoImage} />
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
    logoImage: {
        width: 64,
        height: 64,
        resizeMode: 'contain',
    },
});
