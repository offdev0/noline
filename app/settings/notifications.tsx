import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const NOTIF_STORAGE_KEY = 'noline_notification_prefs';

interface NotificationPrefs {
    masterEnabled: boolean;
    nearbyBusy: boolean;
    favoritesUpdated: boolean;
    medalProgress: boolean;
    weeklyDigest: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
    masterEnabled: true,
    nearbyBusy: true,
    favoritesUpdated: true,
    medalProgress: true,
    weeklyDigest: false,
};

export default function NotificationsSettingsScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);

    // Load saved prefs per user
    useEffect(() => {
        const loadPrefs = async () => {
            try {
                const key = user?.uid ? `${NOTIF_STORAGE_KEY}_${user.uid}` : NOTIF_STORAGE_KEY;
                const stored = await AsyncStorage.getItem(key);
                if (stored) {
                    setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
                }
            } catch (e) {
                console.error('[NotifSettings] Failed to load prefs:', e);
            } finally {
                setLoading(false);
            }
        };
        loadPrefs();
    }, [user?.uid]);

    const updatePref = async (key: keyof NotificationPrefs, value: boolean) => {
        const updated = { ...prefs, [key]: value };
        setPrefs(updated);
        try {
            const storageKey = user?.uid ? `${NOTIF_STORAGE_KEY}_${user.uid}` : NOTIF_STORAGE_KEY;
            await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
            console.error('[NotifSettings] Failed to save prefs:', e);
        }
    };

    const NotifRow = ({
        icon,
        title,
        subtitle,
        prefKey,
        disabled,
    }: {
        icon: string;
        title: string;
        subtitle: string;
        prefKey: keyof NotificationPrefs;
        disabled?: boolean;
    }) => (
        <View style={[styles.row, disabled && styles.rowDisabled]}>
            <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                    <Ionicons name={icon as any} size={20} color={disabled ? '#CBD5E1' : '#6366F1'} />
                </View>
                <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, disabled && { color: '#CBD5E1' }]}>{title}</Text>
                    <Text style={[styles.rowSubtitle, disabled && { color: '#E2E8F0' }]}>{subtitle}</Text>
                </View>
            </View>
            <Switch
                trackColor={{ false: '#E2E8F0', true: '#A5A6FF' }}
                thumbColor={prefs[prefKey] && !disabled ? '#6366F1' : '#F3F4F6'}
                onValueChange={(val) => updatePref(prefKey, val)}
                value={prefs[prefKey]}
                disabled={disabled || loading}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Smart Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero */}
                <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.heroCard}>
                    <Ionicons name="notifications" size={36} color="#fff" />
                    <Text style={styles.heroTitle}>Stay in the Know</Text>
                    <Text style={styles.heroSubtitle}>
                        Get real-time alerts about the places that matter to you.
                    </Text>
                </LinearGradient>

                {/* Master toggle */}
                <Text style={styles.sectionTitle}>MASTER SWITCH</Text>
                <View style={styles.section}>
                    <View style={styles.masterRow}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                                <Ionicons name="flash" size={20} color="#6366F1" />
                            </View>
                            <View style={styles.rowText}>
                                <Text style={styles.rowTitle}>Enable Smart Notifications</Text>
                                <Text style={styles.rowSubtitle}>All Noline alerts on/off</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: '#A5A6FF' }}
                            thumbColor={prefs.masterEnabled ? '#6366F1' : '#F3F4F6'}
                            onValueChange={(val) => updatePref('masterEnabled', val)}
                            value={prefs.masterEnabled}
                            disabled={loading}
                        />
                    </View>
                </View>

                {/* Individual alert types */}
                <Text style={styles.sectionTitle}>ALERT TYPES</Text>
                <View style={styles.section}>
                    <NotifRow
                        icon="people"
                        title="Nearby Place Getting Busy"
                        subtitle="Alert when a place near you sees a surge in reports"
                        prefKey="nearbyBusy"
                        disabled={!prefs.masterEnabled}
                    />
                    <View style={styles.divider} />
                    <NotifRow
                        icon="heart"
                        title="Favorited Place Updates"
                        subtitle="New reports on places you've saved"
                        prefKey="favoritesUpdated"
                        disabled={!prefs.masterEnabled}
                    />
                    <View style={styles.divider} />
                    <NotifRow
                        icon="trophy"
                        title="Medal & XP Milestones"
                        subtitle="When you earn a new medal or hit XP goals"
                        prefKey="medalProgress"
                        disabled={!prefs.masterEnabled}
                    />
                    <View style={styles.divider} />
                    <NotifRow
                        icon="newspaper"
                        title="Weekly Digest"
                        subtitle="Summary of activity in your favorite area"
                        prefKey="weeklyDigest"
                        disabled={!prefs.masterEnabled}
                    />
                </View>

                <Text style={styles.infoText}>
                    💡 Notification delivery depends on device permission settings. Make sure Noline
                    notifications are allowed in your device's system settings.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 10, marginBottom: 6 },
    heroSubtitle: { fontSize: 14, color: '#E0E7FF', textAlign: 'center', lineHeight: 21 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    masterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowDisabled: { opacity: 0.5 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    rowText: { flex: 1 },
    rowTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    rowSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 18 },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    infoText: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        padding: 14,
        marginTop: 4,
    },
});
