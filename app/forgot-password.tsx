import AuthButton from '@/components/auth/AuthButton';
import AuthInput from '@/components/auth/AuthInput';
import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { sendPasswordReset } = useUser();
    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert(t('auth.errorTitle'), t('auth.enterEmailForReset'));
            return;
        }

        setLoading(true);
        try {
            await sendPasswordReset(email);
            Alert.alert(
                t('auth.success'),
                t('auth.passwordResetSent'),
                [{ text: t('auth.ok'), onPress: () => router.back() }]
            );
        } catch (error: any) {
            Alert.alert(t('auth.errorTitle'), error.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#ed75ffff', '#7337ffff']} style={StyleSheet.absoluteFill} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.content}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Image
                                source={require('@/assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
                        <Text style={styles.subtitle}>
                            {t('auth.enterEmailForReset')}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <AuthInput
                            icon="mail-outline"
                            placeholder={t('auth.email')}
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <AuthButton
                            title="Send Reset Link"
                            onPress={handleResetPassword}
                            loading={loading}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {t('auth.haveAccount').split('?')[0]}?{" "}
                            </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.footerLink}>
                                    {t('auth.login')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    logo: {
        width: 120,
        height: 120,
    },
    content: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        marginBottom: -30,
        borderRadius: 32,
        paddingHorizontal: 30,
        paddingTop: 30,
        paddingBottom: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 40,
        elevation: 15,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1F2937',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    form: {
        gap: 0,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#6B7280',
        fontSize: 14,
    },
    footerLink: {
        color: '#5356FF',
        fontSize: 14,
        fontWeight: '800',
    },
});
