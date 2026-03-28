import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.imageContainer}>
                <Animated.Image
                    entering={FadeInUp.duration(1000).springify()}
                    source={require('@/assets/image.png')}
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#7337ff' }}>Loading...</Text>
            </View>


        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    image: {
        width: width * 0.85,
        height: height * 0.45,
    },
    footer: {
        paddingHorizontal: 40,
        paddingBottom: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    buttonWrapper: {
        width: '100%',
    },
    button: {
        backgroundColor: '#7337ffff',
        paddingVertical: 18,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#7337ff',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
});
