import { auth, db } from '@/configs/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    SafeAreaView,
    ScrollView,
    Text,
    View
} from 'react-native';

import AuthButton from '@/components/auth/AuthButton';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthInput from '@/components/auth/AuthInput';
import AuthLinks from '@/components/auth/AuthLinks';
import TermsCheckbox from '@/components/auth/TermsCheckbox';
import { AUTH_GRADIENT_COLORS, authStyles } from '@/components/auth/authStyles';

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

    // Animation for button
    const buttonScale = React.useRef(new Animated.Value(1)).current;
    const spinValue = React.useRef(new Animated.Value(0)).current;

    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
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
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        // Validate password length
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
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
                    Alert.alert("Error", "Passwords do not match");
                    return;
                }
                if (!isChecked) {
                    setIsLoading(false);
                    Alert.alert("Error", "Please agree to the terms");
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
                        photo_url: "",
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
                errorMessage = 'No account found with this email. Please sign up first.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'An account already exists with this email. Please log in.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Use at least 6 characters.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password. Please check and try again.';
            }

            Alert.alert("Authentication Error", errorMessage);
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
                    <ScrollView contentContainerStyle={authStyles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={authStyles.title}>Let's get started.</Text>
                        <Text style={authStyles.subtitle}>Controlling your time starts here.</Text>

                        {/* Email Input */}
                        <AuthInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder=""
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Password Input */}
                        <AuthInput
                            label="Password"
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
                                label="Confirm Password"
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
