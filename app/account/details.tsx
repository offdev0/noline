import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

import { t } from '@/i18n';
import { useUser } from '@/context/UserContext';

export default function AccountDetails() {
    const router = useRouter();
    const { userData, user, updateProfileDetails } = useUser();
    const [displayName, setDisplayName] = useState(userData?.display_name || user?.displayName || '');
    const [photoUrl, setPhotoUrl] = useState(userData?.photo_url || user?.photoURL || '');
    const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!displayName && (userData?.display_name || user?.displayName)) {
            setDisplayName(userData?.display_name || user?.displayName || '');
        }
        if (!photoUrl && (userData?.photo_url || user?.photoURL)) {
            setPhotoUrl(userData?.photo_url || user?.photoURL || '');
        }
    }, [displayName, photoUrl, user, userData]);

    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const profilePic = localPhotoUri || photoUrl || userData?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=6366F1&color=fff&size=128`;

    const uploadToCloudinary = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!cloudName || !uploadPreset) {
            Alert.alert(
                t('accountDetailsPage.notConfigured'),
                t('accountDetailsPage.configMsg')
            );
            return null;
        }

        const formData = new FormData();
        const fileName = asset.fileName || `avatar-${user?.uid || 'user'}.jpg`;

        formData.append('file', {
            uri: asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: fileName,
        } as any);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'avatars');

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result?.error?.message || t('accountDetailsPage.uploadFailed'));
        }

        return result.secure_url as string;
    };

    const handlePickAvatar = async () => {
        if (isUploading) return;

        if (!cloudName || !uploadPreset) {
            Alert.alert(
                t('accountDetailsPage.notConfigured'),
                t('accountDetailsPage.configMsg')
            );
            return;
        }

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(t('accountDetailsPage.permissionRequired'), t('accountDetailsPage.permissionMsg'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;

        const asset = result.assets?.[0];
        if (!asset?.uri) {
            Alert.alert(t('common.error'), t('accountDetailsPage.readError'));
            return;
        }

        setLocalPhotoUri(asset.uri);
        setIsUploading(true);

        try {
            const uploadedUrl = await uploadToCloudinary(asset);
            if (!uploadedUrl) {
                setLocalPhotoUri(null);
                return;
            }

            setPhotoUrl(uploadedUrl);
            setLocalPhotoUri(null);
            await updateProfileDetails({ photoUrl: uploadedUrl });
            Alert.alert(t('auth.success'), t('accountDetailsPage.photoSuccess'));
        } catch (error) {
            console.error('Avatar upload failed:', error);
            setLocalPhotoUri(null);
            Alert.alert(t('accountDetailsPage.uploadFailed'), t('accountDetailsPage.uploadFailedMsg'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        const trimmedName = displayName.trim();
        if (!trimmedName) {
            Alert.alert(t('accountDetailsPage.missingName'), t('accountDetailsPage.missingNameMsg'));
            return;
        }

        setIsSaving(true);
        try {
            await updateProfileDetails({
                displayName: trimmedName,
                photoUrl: photoUrl || undefined,
            });
            Alert.alert(t('auth.success'), t('accountDetailsPage.success'));
        } catch (error) {
            console.error('Profile update failed:', error);
            Alert.alert(t('common.error'), t('accountDetailsPage.error'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('accountDetailsPage.title')}</Text>
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
                            <TouchableOpacity
                                style={[styles.editBadge, isUploading && styles.disabledButton]}
                                onPress={handlePickAvatar}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Ionicons name="camera" size={16} color="white" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.emailText}>{user?.email}</Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('accountDetailsPage.displayName')}</Text>
                            <TextInput
                                style={styles.input}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder={t('accountDetailsPage.enterName')}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('accountDetailsPage.emailAddress')}</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={user?.email || ''}
                                editable={false}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, (isSaving || isUploading) && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={isSaving || isUploading}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSaving ? t('accountDetailsPage.saving') : t('accountDetailsPage.saveChanges')}
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
