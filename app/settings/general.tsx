import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function GeneralSettings() {
    const router = useRouter();
    const { language, setLanguage } = useLanguage();
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [locationServices, setLocationServices] = useState(true);

    const SettingItem = ({ icon, label, description, value, onToggle }: any) => (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: '#F3F4F6' }]}>
                    <Ionicons name={icon} size={20} color="#5356FF" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.settingLabel}>{label}</Text>
                    {description && <Text style={styles.settingDescription}>{description}</Text>}
                </View>
            </View>
            <Switch
                trackColor={{ false: '#D1D5DB', true: '#A5A6FF' }}
                thumbColor={value ? '#5356FF' : '#F3F4F6'}
                onValueChange={onToggle}
                value={value}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>General settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="notifications"
                        label="Push Notifications"
                        description="Receive alerts about places near you"
                        value={pushNotifications}
                        onToggle={setPushNotifications}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="mail"
                        label="Email Updates"
                        description="Get weekly summaries of your activity"
                        value={emailNotifications}
                        onToggle={setEmailNotifications}
                    />
                </View>

                <Text style={styles.sectionTitle}>App Preferences</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="moon"
                        label="Dark Mode"
                        description="Toggle between light and dark themes"
                        value={darkMode}
                        onToggle={setDarkMode}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="location"
                        label="Location Services"
                        description="Improve discovery precision"
                        value={locationServices}
                        onToggle={setLocationServices}
                    />
                </View>

                <Text style={styles.sectionTitle}>Language</Text>
                <View style={styles.section}>
                    <View style={styles.languageRow}>
                        <View style={styles.settingInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: '#F3F4F6' }]}>
                                <Ionicons name="language" size={20} color="#5356FF" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.settingLabel}>App Language</Text>
                                <Text style={styles.settingDescription}>Choose Hebrew or English</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.languageButtons}>
                        <TouchableOpacity
                            style={[styles.langButton, language === 'en' && styles.langButtonActive]}
                            onPress={() => setLanguage('en')}
                            activeOpacity={0.85}
                        >
                            <Text style={[styles.langButtonText, language === 'en' && styles.langButtonTextActive]}>English</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.langButton, language === 'he' && styles.langButtonActive]}
                            onPress={() => setLanguage('he')}
                            activeOpacity={0.85}
                        >
                            <Text style={[styles.langButtonText, language === 'he' && styles.langButtonTextActive]}>Hebrew</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.listItem}>
                        <Text style={styles.listItemText}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={18} color="#CCC" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.listItem}>
                        <Text style={styles.listItemText}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={18} color="#CCC" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <View style={styles.listItem}>
                        <Text style={styles.listItemText}>Version</Text>
                        <Text style={styles.versionText}>1.0.4 (Build 42)</Text>
                    </View>
                </View>
            </ScrollView>
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
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#9CA3AF',
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 25,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    settingDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
    },
    languageRow: {
        padding: 16,
        paddingBottom: 8,
    },
    languageButtons: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    langButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    langButtonActive: {
        borderColor: '#5356FF',
        backgroundColor: '#EEF2FF',
    },
    langButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
    },
    langButtonTextActive: {
        color: '#4338CA',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    listItemText: {
        fontSize: 16,
        color: '#374151',
    },
    versionText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
});
