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
const CONTACT_EMAIL = 'Noline012@gmail.com';

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        content: `By downloading, installing, or using the Noline mobile application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.`,
    },
    {
        title: '2. User Accounts',
        content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to keep it updated. We reserve the right to suspend or terminate accounts that violate these terms.`,
    },
    {
        title: '3. Community Reporting',
        content: `Noline relies on community-contributed queue data. You agree that any reports you submit will be based on your actual, real-time observations and will be as accurate as possible. Misleading or abusive reporting may result in account termination.`,
    },
    {
        title: '4. Prohibited Conduct',
        content: `You agree not to:
• Use the app for any illegal or unauthorized purpose.
• Attempt to gain unauthorized access to our systems.
• Interfere with or disrupt the service or servers.
• Use automated systems (bots, scrapers) to collect data from the app.
• Harass or harm other users of the community.`,
    },
    {
        title: '5. Intellectual Property',
        content: `The Noline app, including its code, design, logos, and original content, is protected by intellectual property laws. You may not copy, modify, or distribute any part of the app without our prior written consent.`,
    },
    {
        title: '6. Limitation of Liability',
        content: `Noline provides real-time data but cannot guarantee its 100% accuracy at all times, as queue conditions change rapidly. We are not liable for any decisions made based on the information provided in the app. The service is provided "as is" and "as available".`,
    },
    {
        title: '7. Changes to Terms',
        content: `We may modify these terms at any time. We will notify you of significant changes via the app. Your continued use of Noline after changes are posted constitutes acceptance of the updated terms.`,
    },
];

export default function TermsOfServiceScreen() {
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
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero */}
                <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.heroCard}>
                    <Ionicons name="document-text" size={48} color="#fff" />
                    <Text style={styles.heroTitle}>Noline Terms</Text>
                    <Text style={styles.heroSubtitle}>
                        Please read these terms carefully before using our services.
                    </Text>
                    <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>
                </LinearGradient>

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
                <Text style={styles.contactTitle}>Questions?</Text>
                <TouchableOpacity
                    style={styles.contactCard}
                    onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
                >
                    <View style={styles.contactIconCircle}>
                        <Ionicons name="mail-outline" size={22} color="#4F46E5" />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Legal Department</Text>
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
