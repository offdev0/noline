import AuthButton from '@/components/auth/AuthButton';
import AuthInput from '@/components/auth/AuthInput';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions, Image, KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signUp, signInWithGoogle } = useUser();
    const router = useRouter();

    const handleForgotPassword = () => {
        router.push('/forgot-password');
    };

    const handleAuth = async () => {
        if (!email || !password || (!isLogin && !name)) {
            Alert.alert(t('common.error'), 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signUp(email, password, name);
            }
        } catch (error: any) {
            Alert.alert('Authentication Failed', error.message || 'Check your credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
        } catch (error: any) {
            if (error.code === 'DEVELOPER_ERROR') {
                Alert.alert(
                    t('auth.googleBuildRequiredTitle'),
                    t('auth.googleBuildRequiredMessage')
                );
            } else {
                Alert.alert(t('auth.googleLoginErrorTitle'), error.message);
            }
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
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <Image
                                source={require('@/assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>NoLine</Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Welcome back! Log in to continue.' : 'Create an account to start avoiding queues.'}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {!isLogin && (
                            <AuthInput
                                icon="person-outline"
                                placeholder="Full Name"
                                value={name}
                                onChangeText={setName}
                            />
                        )}

                        <AuthInput
                            icon="mail-outline"
                            placeholder="Email Address"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <AuthInput
                            icon="lock-closed-outline"
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        {isLogin && (
                            <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        )}

                        <AuthButton
                            title={isLogin ? 'Log In' : 'Sign Up'}
                            onPress={handleAuth}
                            loading={loading}
                        />

                        <SocialAuthButtons
                            onGooglePress={handleGoogleAuth}
                            isLoading={loading}
                            mode={isLogin ? 'login' : 'signup'}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                            </Text>
                            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                                <Text style={styles.footerLink}>
                                    {isLogin ? 'Sign Up' : 'Log In'}
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
        // marginHorizontal: 30,
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
        gap: 0, // Gap handled by individual components (marginBottom)
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    forgotText: {
        color: '#5356FF',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
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
