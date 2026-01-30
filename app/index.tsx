import { auth, db } from '@/configs/firebaseConfig';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import AuthHeader from '@/components/auth/AuthHeader';
import AuthInput from '@/components/auth/AuthInput';

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
            colors={['#5356FF', '#3787FF']} // Approximate blue/purple gradient
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <AuthHeader />

                <View style={styles.contentContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>Let's get started.</Text>
                        <Text style={styles.subtitle}>Controlling your time starts here.</Text>

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
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleAuth}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <Text style={[styles.buttonText, { marginLeft: 10 }]}>
                                            {isLoginMode ? 'Logging in...' : 'Creating account...'}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {isLoginMode ? 'Log In' : 'Create Account'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Terms Checkbox - Only for Signup */}
                        {!isLoginMode && (
                            <View style={styles.checkboxContainer}>
                                <Checkbox
                                    style={styles.checkbox}
                                    value={isChecked}
                                    onValueChange={setChecked}
                                    color={isChecked ? '#4A6CFA' : undefined}
                                />
                                <Text style={styles.checkboxLabel}>
                                    I agree to the Terms of Use and Privacy Policy and allow the use of my location to see real queues and hot spots near me!
                                </Text>
                            </View>
                        )}

                        {isLoginMode ? (
                            <TouchableOpacity onPress={toggleMode} disabled={isLoading}>
                                <Text style={[styles.privacyLink, isLoading && styles.disabledText]}>
                                    Don't have an account? Sign Up
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={toggleMode} disabled={isLoading}>
                                <Text style={[styles.privacyLink, isLoading && styles.disabledText]}>
                                    Already have an account? Log In
                                </Text>
                            </TouchableOpacity>
                        )}

                        {!isLoginMode && (
                            <TouchableOpacity>
                                <Text style={[styles.privacyLink, { marginTop: 10 }]}>Privacy Policy</Text>
                            </TouchableOpacity>
                        )}

                        <View style={{ alignItems: 'center', marginTop: 12 }}>
                            <TouchableOpacity disabled={isLoading}>
                                <Text style={[styles.forgotPassword, isLoading && styles.disabledText]}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    button: {
        backgroundColor: '#5A46E5', // Distinctive purple/blue
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#4E46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    privacyLink: {
        fontSize: 12,
        color: '#4E46E5',
        marginTop: 2,
        marginLeft: 22
    },
    forgotPassword: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24
    },
    disabledText: {
        opacity: 0.5,
    },
});
