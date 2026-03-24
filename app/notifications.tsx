import { t } from '@/i18n';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const { user } = useUser();

    const [settings, setSettings] = useState({
        pushNotifications: true,
        queueAlerts: true,
        hotSpotAlerts: true,
        weeklySummary: false,
        medalProgress: true,
        communityUpdates: true
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const SettingRow = ({ 
        icon, 
        title, 
        subtitle, 
        value, 
        onToggle,
        isLast = false 
    }: { 
        icon: string, 
        title: string, 
        subtitle: string, 
        value: boolean, 
        onToggle: () => void,
        isLast?: boolean
    }) => (
        <View style={[styles.settingRow, isLast && styles.lastRow]}>
            <View style={styles.settingIconContainer}>
                <Ionicons name={icon as any} size={22} color="#6366F1" />
            </View>
            <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#E2E8F0', true: '#A5A6FF' }}
                thumbColor={value ? '#6366F1' : '#F4F4F5'}
                ios_backgroundColor="#E2E8F0"
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.notifications')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.heroContent}>
                        <View style={styles.heroIconCircle}>
                            <Ionicons name="notifications" size={32} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.heroTitle}>{t('notifications.smartAlerts')}</Text>
                            <Text style={styles.heroSubtitle}>{t('notifications.stayUpdated')}</Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>{t('drawer.settings').toUpperCase()}</Text>
                    <View style={styles.card}>
                        <SettingRow
                            icon="notifications-outline"
                            title={t('settings.pushNotifications')}
                            subtitle={t('settings.pushNotificationsDesc')}
                            value={settings.pushNotifications}
                            onToggle={() => toggleSetting('pushNotifications')}
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon="flame-outline"
                            title={t('notifications.hotSpotAlerts')}
                            subtitle={t('notifications.hotSpotAlertsDesc')}
                            value={settings.hotSpotAlerts}
                            onToggle={() => toggleSetting('hotSpotAlerts')}
                            isLast
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>{t('places.title').toUpperCase()}</Text>
                    <View style={styles.card}>
                        <SettingRow
                            icon="people-outline"
                            title={t('notifications.queueStatus')}
                            subtitle={t('notifications.queueStatusDesc')}
                            value={settings.queueAlerts}
                            onToggle={() => toggleSetting('queueAlerts')}
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon="time-outline"
                            title={t('route.recentlyVisited')} // Reusing some strings or use new ones
                            subtitle={t('settings.historyDesc')}
                            value={settings.weeklySummary}
                            onToggle={() => toggleSetting('weeklySummary')}
                            isLast
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>{t('rewards.achievements').toUpperCase()}</Text>
                    <View style={styles.card}>
                        <SettingRow
                            icon="medal-outline"
                            title={t('notifications.medalProgress')}
                            subtitle={t('notifications.medalProgressDesc')}
                            value={settings.medalProgress}
                            onToggle={() => toggleSetting('medalProgress')}
                        />
                        <View style={styles.divider} />
                        <SettingRow
                            icon="chatbubbles-outline"
                            title={t('notifications.communityUpdates')}
                            subtitle={t('notifications.communityUpdatesDesc')}
                            value={settings.communityUpdates}
                            onToggle={() => toggleSetting('communityUpdates')}
                            isLast
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {t('notifications.batteryInfo')}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    scrollContent: {
        padding: 20,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingTextContainer: {
        flex: 1,
        marginRight: 8,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 52,
    },
    footer: {
        marginTop: 8,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 18,
    },
});
