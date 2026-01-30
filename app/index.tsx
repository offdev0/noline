import { auth, db } from '@/configs/firebaseConfig';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
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

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        try {
            if (isLoginMode) {
                // Login Logic
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Signup Logic
                if (password !== confirmPassword) {
                    Alert.alert("Error", "Passwords do not match");
                    return;
                }
                if (!isChecked) {
                    Alert.alert("Error", "Please agree to the terms");
                    return;
                }

                // 1. Create User in Auth
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Create User Document in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
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
            }
            // If successful, navigate
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert("Authentication Error", error.message);
        }
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

                        {/* Action Button */}
                        <TouchableOpacity style={styles.button} onPress={handleAuth}>
                            <Text style={styles.buttonText}>{isLoginMode ? 'Log In' : 'Create Account'}</Text>
                        </TouchableOpacity>

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
                            <TouchableOpacity onPress={() => setIsLoginMode(false)}>
                                <Text style={styles.privacyLink}>Don't have an account? Sign Up</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setIsLoginMode(true)}>
                                <Text style={styles.privacyLink}>Already have an account? Log In</Text>
                            </TouchableOpacity>
                        )}

                        {!isLoginMode && (
                            <TouchableOpacity>
                                <Text style={[styles.privacyLink, { marginTop: 10 }]}>Privacy Policy</Text>
                            </TouchableOpacity>
                        )}

                        <View style={{ alignItems: 'center', marginTop: 12 }}>
                            <Text style={styles.forgotPassword}>Forgot Password?</Text>
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
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
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
});
