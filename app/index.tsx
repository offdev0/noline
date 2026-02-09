import { auth, db } from '@/configs/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    SafeAreaView,
    ScrollView,
    Text,
    View
} from 'react-native';
// Safe import for GoogleSignin to prevent crashes in Expo Go
let GoogleSignin: any;
try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
    console.log('GoogleSignin not available in this environment');
}

import AuthButton from '@/components/auth/AuthButton';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthInput from '@/components/auth/AuthInput';
import AuthLinks from '@/components/auth/AuthLinks';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import TermsCheckbox from '@/components/auth/TermsCheckbox';
import { AUTH_GRADIENT_COLORS, authStyles } from '@/components/auth/authStyles';
import { t } from '@/i18n';

const DEFAULT_PROFILE_PIC = 'https://imgs.search.brave.com/Fu2vzE7rwzQnr00qao9hegfrI2z1fW5tQy1qs01eMe4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5na2V5LmNvbS9w/bmcvZGV0YWlsLzEy/MS0xMjE5MjMxX3Vz/ZXItZGVmYXVsdC1w/cm9maWxlLnBuZw';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(false); // Default to Signup
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (GoogleSignin) {
            try {
                GoogleSignin.configure({
                    webClientId: '83234148402-llr9kih19oh0hmmadf1pl916rrkn90go.apps.googleusercontent.com',
                });
            } catch (e) {
                console.error('GoogleSignin configuration failed:', e);
            }
        }
    }, []);

    // Animation for button
    const buttonScale = React.useRef(new Animated.Value(1)).current;
    const spinValue = React.useRef(new Animated.Value(0)).current;

    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const startLoadingAnimation = () => {
        spinValue.setValue(0);
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert(t('auth.errorTitle'), t('auth.enterEmailPassword'));
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert(t('auth.errorTitle'), t('auth.invalidEmail'));
            return;
        }

        // Validate password length
        if (password.length < 6) {
            Alert.alert(t('auth.errorTitle'), t('auth.passwordMin'));
            return;
        }

        animateButtonPress();
        setIsLoading(true);
        startLoadingAnimation();

        try {
            if (isLoginMode) {
                // Login Logic
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Signup Logic
                if (password !== confirmPassword) {
                    setIsLoading(false);
                    Alert.alert(t('auth.errorTitle'), t('auth.passwordsDontMatch'));
                    return;
                }
                if (!isChecked) {
                    setIsLoading(false);
                    Alert.alert(t('auth.errorTitle'), t('auth.agreeTerms'));
                    return;
                }

                // 1. Create User in Auth
                console.log('Creating user in Firebase Auth...');
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log('User created in Auth:', user.uid);

                // 2. Create User Document in Firestore
                try {
                    console.log('Creating user document in Firestore...');
                    await setDoc(doc(db, "users", user.uid), {
                        uid: user.uid,
                        email: user.email || '',
                        display_name: "", // Initial empty, user can update later
                        photo_url: DEFAULT_PROFILE_PIC,
                        phone_number: "",
                        username: email.split('@')[0], // Default username from email

                        created_time: Timestamp.now(),
                        joinedAt: Timestamp.now(),

                        isGuest: false,
                        darkMode: false,
                        enableNotification: false, // Default false until requested
                        enableLocation: false, // Default false until requested
                        Language: true, // Matching the Boolean type in screenshot
                        xp: 0,

                        favourite: [], // Empty list of references
                        currentLocaton: null // Typo 'currentLocaton' matches screenshot schema
                    });
                    console.log('User document created in Firestore successfully!');
                } catch (firestoreError: any) {
                    console.error('Firestore error:', firestoreError);
                    // User was created in Auth, but Firestore failed - still allow them to proceed
                    // The document can be created later when they update their profile
                }
            }
            // Navigation will happen automatically via UserContext/MainLayout
        } catch (error: any) {
            setIsLoading(false);
            let errorMessage = error.message;

            // User-friendly error messages
            if (error.code === 'auth/user-not-found') {
                errorMessage = t('auth.noAccountFound');
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = t('auth.incorrectPassword');
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = t('auth.emailInUse');
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = t('auth.invalidEmailFormat');
            } else if (error.code === 'auth/weak-password') {
                errorMessage = t('auth.weakPassword');
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = t('auth.networkError');
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = t('auth.tooManyRequests');
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = t('auth.invalidCredentials');
            }

            Alert.alert(t('auth.authErrorTitle'), errorMessage);
        }
    };

    const handleGoogleAuth = async () => {
        animateButtonPress();
        setIsLoading(true);
        startLoadingAnimation();

        try {
            if (!GoogleSignin) {
                Alert.alert(
                    t('auth.googleBuildRequiredTitle'),
                    t('auth.googleBuildRequiredMessage'),
                    [{ text: t('auth.ok'), onPress: () => setIsLoading(false) }]
                );
                return;
            }

            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            const idToken = response.data?.idToken;

            if (!idToken) throw new Error("No ID Token found");

            const credential = GoogleAuthProvider.credential(idToken);

            // Sign in to Firebase with the Google credential
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;

            // Check if user document exists in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (!userDoc.exists()) {
                // Create user document if it doesn't exist (First time Google Login)
                console.log('Creating new user document for Google user...');
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email || '',
                    display_name: user.displayName || "",
                    photo_url: user.photoURL || DEFAULT_PROFILE_PIC,
                    phone_number: user.phoneNumber || "",
                    username: user.email?.split('@')[0] || "",
                    created_time: Timestamp.now(),
                    joinedAt: Timestamp.now(),
                    isGuest: false,
                    darkMode: false,
                    enableNotification: false,
                    enableLocation: false,
                    Language: true,
                    xp: 0,
                    favourite: [],
                    currentLocaton: null
                });
            }

            // Navigation happens automatically via auth state observer
        } catch (error: any) {
            setIsLoading(false);
            console.error("Google Auth error:", error);

            if (error.code === 'DEVELOPER_ERROR') {
                Alert.alert(
                    t('auth.configErrorTitle'),
                    t('auth.configErrorMessage')
                );
            } else if (error.code !== 'SIGN_IN_CANCELLED') {
                Alert.alert(t('auth.googleLoginErrorTitle'), error.message);
            }
        }
    };

    const toggleMode = () => {
        // Animate mode switch
        setIsLoginMode(!isLoginMode);
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <LinearGradient
            colors={AUTH_GRADIENT_COLORS}
            style={authStyles.container}
        >
            <SafeAreaView style={authStyles.safeArea}>
                <AuthHeader />

                <View style={authStyles.contentContainer}>
                    <ScrollView contentContainerStyle={authStyles.scrollContent}>
                        <Text style={authStyles.subtitle}>{t('auth.subtitle')}</Text>
                        <AuthInput
                            label={t('auth.email')}
                            value={email}
                            onChangeText={setEmail}
                            placeholder=""
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Password Input */}
                        <AuthInput
                            label={t('auth.password')}
                            isPassword
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            value={password}
                            onChangeText={setPassword}
                            placeholder=""
                        />

                        {/* Confirm Password Input - Only for Signup */}
                        {!isLoginMode && (
                            <AuthInput
                                label={t('auth.confirmPassword')}
                                isPassword
                                showPassword={showConfirmPassword}
                                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder=""
                            />
                        )}

                        {/* Action Button with Loading State */}
                        <AuthButton
                            isLoading={isLoading}
                            isLoginMode={isLoginMode}
                            buttonScale={buttonScale}
                            onPress={handleAuth}
                        />

                        <SocialAuthButtons
                            onGooglePress={handleGoogleAuth}
                            isLoading={isLoading}
                            mode={isLoginMode ? 'login' : 'signup'}
                        />

                        {/* Terms Checkbox - Only for Signup */}
                        {!isLoginMode && (
                            <TermsCheckbox
                                isChecked={isChecked}
                                onValueChange={setChecked}
                            />
                        )}

                        {/* Auth Links - Toggle Mode, Privacy, Forgot Password */}
                        <AuthLinks
                            isLoginMode={isLoginMode}
                            isLoading={isLoading}
                            onToggleMode={toggleMode}
                        />
                    </ScrollView>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}
