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

const CONTACT_EMAIL = 'noline012@gmail.com';

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const [expandedSection, setExpandedSection] = useState<number | null>(null);

    const toggleSection = (index: number) => {
        setExpandedSection(prev => prev === index ? null : index);
    };

    const lastUpdatedText = t('privacyPolicy.lastUpdatedLabel', {
        date: t('privacyPolicy.lastUpdatedDate'),
    });

    const sections = [
        {
            title: t('privacyPolicy.sections.infoCollect.title'),
            content: t('privacyPolicy.sections.infoCollect.content'),
        },
        {
            title: t('privacyPolicy.sections.useInfo.title'),
            content: t('privacyPolicy.sections.useInfo.content'),
        },
        {
            title: t('privacyPolicy.sections.location.title'),
            content: t('privacyPolicy.sections.location.content'),
        },
        {
            title: t('privacyPolicy.sections.userContent.title'),
            content: t('privacyPolicy.sections.userContent.content'),
        },
        {
            title: t('privacyPolicy.sections.sharing.title'),
            content: t('privacyPolicy.sections.sharing.content'),
        },
        {
            title: t('privacyPolicy.sections.retention.title'),
            content: t('privacyPolicy.sections.retention.content'),
        },
        {
            title: t('privacyPolicy.sections.rights.title'),
            content: t('privacyPolicy.sections.rights.content', { email: CONTACT_EMAIL }),
        },
        {
            title: t('privacyPolicy.sections.security.title'),
            content: t('privacyPolicy.sections.security.content'),
        },
        {
            title: t('privacyPolicy.sections.children.title'),
            content: t('privacyPolicy.sections.children.content'),
        },
        {
            title: t('privacyPolicy.sections.changes.title'),
            content: t('privacyPolicy.sections.changes.content'),
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('privacyPolicy.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero */}
                <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.heroCard}>
                    <Ionicons name="shield-checkmark" size={48} color="#fff" />
                    <Text style={styles.heroTitle}>{t('privacyPolicy.title')}</Text>
                    <Text style={styles.heroSubtitle}>{t('privacyPolicy.heroSubtitle')}</Text>
                </LinearGradient>

                {/* Accordion Sections */}
                {sections.map((section, index) => (
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
                <Text style={styles.contactTitle}>{t('privacyPolicy.contact.title')}</Text>
                <Text style={styles.contactDescription}>{t('privacyPolicy.contact.description')}</Text>
                <TouchableOpacity
                    style={styles.contactCard}
                    onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
                >
                    <View style={styles.contactIconCircle}>
                        <Ionicons name="mail-outline" size={22} color="#4F46E5" />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>{t('privacyPolicy.contact.emailLabel')}</Text>
                        <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('privacyPolicy.footer')}</Text>
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
    contactDescription: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 12 },
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
