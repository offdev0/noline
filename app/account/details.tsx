import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useUser } from '@/context/UserContext';

export default function AccountDetails() {
    const router = useRouter();
    const { userData, user } = useUser();
    const [displayName, setDisplayName] = useState(userData?.display_name || '');
    const [isSaving, setIsSaving] = useState(false);

    const profilePic = userData?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=6366F1&color=fff&size=128`;

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate saving
        setTimeout(() => {
            setIsSaving(false);
            Alert.alert('Success', 'Profile updated successfully!');
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account details</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: profilePic }} style={styles.avatar} />
                            <TouchableOpacity style={styles.editBadge}>
                                <Ionicons name="camera" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.emailText}>{user?.email}</Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Display Name</Text>
                            <TextInput
                                style={styles.input}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter your name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={user?.email || ''}
                                editable={false}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'white',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#5356FF',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    emailText: {
        fontSize: 14,
        color: '#666',
    },
    formSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    disabledInput: {
        color: '#888',
    },
    saveButton: {
        backgroundColor: '#5356FF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 30,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
