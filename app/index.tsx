import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChecked, setChecked] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(false);

    // TODO: Add actual authentication logic here
    const handleAuth = () => {
        // For now, bypass auth and go straight to dashboard
        // In a real app, you would check firebase auth here
        router.replace('/(tabs)');
    };

    return (
        <LinearGradient
            colors={['#5356FF', '#3787FF']} // Approximate blue/purple gradient
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.appName}>NoLine</Text>
                    <View style={styles.logoContainer}>
                        <Ionicons name="hourglass-outline" size={60} color="#FFD700" />
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>Let's get started.</Text>
                        <Text style={styles.subtitle}>Controlling your time starts here.</Text>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabelContainer}>
                                <Text style={styles.inputLabel}>Email</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder=""
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <View style={styles.inputLabelContainer}>
                                <Text style={styles.inputLabel}>Password</Text>
                            </View>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    placeholder=""
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={24}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input - Only for Signup */}
                        {!isLoginMode && (
                            <View style={styles.inputGroup}>
                                <View style={styles.inputLabelContainer}>
                                    <Text style={styles.inputLabel}>Confirm Password</Text>
                                </View>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, styles.passwordInput]}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        placeholder=""
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={24}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
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


                        {/* Social Logins */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-google" size={20} color="black" />
                                <Text style={styles.socialButtonText}>Continue with Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={20} color="black" />
                                <Text style={styles.socialButtonText}>Continue with Apple</Text>
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
    inputGroup: {
        marginBottom: 20,
        position: 'relative',
    },
    inputLabelContainer: {
        position: 'absolute',
        top: -10,
        left: 12,
        zIndex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 4,
    },
    inputLabel: {
        fontSize: 12,
        color: '#666',
    },
    input: {
        height: 56,
        borderWidth: 1.5,
        borderColor: '#787878',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000',
        backgroundColor: 'transparent',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 16,
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
    socialContainer: {
        gap: 16,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        gap: 12,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'black',
    },
});
