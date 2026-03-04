import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LAST_UPDATED = 'January 1, 2025';
const CONTACT_EMAIL = 'privacy@noline.app';

const SECTIONS = [
    {
        title: '1. Information We Collect',
        content: `We collect the following types of information when you use Noline:

• **Account Information**: Email address and display name when you register.
• **Location Data**: Your device's GPS location to show nearby places and provide accurate, real-time queue data. Location is only used when you grant permission.
• **Usage Data**: Places you view, reports you submit, and favorites you save — used to personalize your experience and improve our service.
• **Device Information**: Device type, operating system version, and unique device identifiers for analytics and crash reporting.`,
    },
    {
        title: '2. How We Use Your Information',
        content: `We use the information we collect to:

• Provide and improve the Noline app and its features.
• Show you relevant local places based on your location.
• Display real-time community queue reports.
• Personalize recommendations and discoveries.
• Calculate XP, medals, and streak rewards.
• Send push notifications about places you care about (only with your consent).
• Maintain service security and prevent abuse.`,
    },
    {
        title: '3. Location Data',
        content: `Noline uses your location to find nearby places and calculate distances. Location access is optional — you can use the app without it, but accuracy will be reduced.

We use your location only while the app is in use (foreground). We do not track your location in the background or sell location data to third parties.`,
    },
    {
        title: '4. Data Sharing',
        content: `We do not sell your personal information. We may share data in the following limited cases:

• **Service Providers**: Firebase (Google) for database and authentication. Google Places API for location and place data.
• **Community Reports**: Reports you submit (such as queue status) are shared publicly within the app to benefit other users. Reports are associated with an anonymized user identifier.
• **Legal Requirements**: If required by law or to protect the safety of users.`,
    },
    {
        title: '5. Data Retention',
        content: `We retain your account data for as long as your account is active. Search history is stored for up to 30 days. Community reports are retained indefinitely to maintain historical accuracy.

You may request deletion of your account and all associated data by contacting us at ${CONTACT_EMAIL}.`,
    },
    {
        title: '6. Security',
        content: `We take reasonable measures to protect your information, including encrypted data transmission (HTTPS) and Firebase's industry-standard security. However, no method of transmission over the internet is 100% secure.`,
    },
    {
        title: '7. Children\'s Privacy',
        content: `Noline is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.`,
    },
    {
        title: '8. Your Rights',
        content: `Depending on your location, you may have the right to:

• Access the personal data we hold about you.
• Request correction of inaccurate data.
• Request deletion of your data.
• Opt out of non-essential data processing.

To exercise these rights, contact us at ${CONTACT_EMAIL}.`,
    },
    {
        title: '9. Third-Party Services',
        content: `Noline uses the following third-party services, each with their own privacy policies:

• **Google Firebase**: Authentication and database (firebase.google.com/support/privacy)
• **Google Places API**: Location and place data (policies.google.com/privacy)
• **Expo / React Native**: App framework (expo.dev/privacy)`,
    },
    {
        title: '10. Changes to This Privacy Policy',
        content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via in-app notification or email. Continued use of the app after changes constitutes acceptance of the new policy.`,
    },
];

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const [expandedSection, setExpandedSection] = useState<number | null>(null);

    const toggleSection = (index: number) => {
        setExpandedSection(prev => prev === index ? null : index);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero */}
                <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.heroCard}>
                    <Ionicons name="shield-checkmark" size={48} color="#fff" />
                    <Text style={styles.heroTitle}>Your Privacy Matters</Text>
                    <Text style={styles.heroSubtitle}>
                        Noline is committed to transparency about how we handle your data.
                    </Text>
                    <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>
                </LinearGradient>

                <Text style={styles.intro}>
                    This Privacy Policy describes how Noline ("we", "us", or "our") collects, uses, and shares
                    information when you use our mobile application. By using Noline, you agree to the practices
                    described in this policy.
                </Text>

                {/* Accordion Sections */}
                {SECTIONS.map((section, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.sectionCard}
                        onPress={() => toggleSection(index)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Ionicons
                                name={expandedSection === index ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#6366F1"
                            />
                        </View>
                        {expandedSection === index && (
                            <Text style={styles.sectionContent}>{section.content}</Text>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Contact */}
                <Text style={styles.contactTitle}>Contact Us</Text>
                <TouchableOpacity
                    style={styles.contactCard}
                    onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
                >
                    <View style={styles.contactIconCircle}>
                        <Ionicons name="mail-outline" size={22} color="#4F46E5" />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Privacy Inquiries</Text>
                        <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 Noline. All rights reserved.</Text>
                </View>
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
        marginBottom: 20,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 12, marginBottom: 8 },
    heroSubtitle: { fontSize: 14, color: '#E0E7FF', textAlign: 'center', lineHeight: 21 },
    lastUpdated: { marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
    intro: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 10 },
    sectionContent: {
        marginTop: 14,
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 14,
    },
    contactTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12, marginTop: 8 },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 24,
    },
    contactIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInfo: { flex: 1 },
    contactLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase' },
    contactValue: { fontSize: 14, fontWeight: '700', color: '#4F46E5', marginTop: 2 },
    footer: { alignItems: 'center', paddingBottom: 12 },
    footerText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
});
