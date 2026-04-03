import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Loading() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.loaderWrapper}>
                <ActivityIndicator size="large" color="#7337ff" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loaderWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: '700',
        color: '#7337ff',
        letterSpacing: 0.5,
    }
});
