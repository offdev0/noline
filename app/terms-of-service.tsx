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

export default function TermsOfServiceScreen() {
    const router = useRouter();
    const [expandedSection, setExpandedSection] = useState<number | null>(null);

    const toggleSection = (index: number) => {
        setExpandedSection(prev => prev === index ? null : index);
    };

    const lastUpdatedText = t('termsOfService.lastUpdatedLabel', {
        date: t('termsOfService.lastUpdatedDate'),
    });

    const sections = [
        {
            title: t('termsOfService.sections.aboutService.title'),
            content: t('termsOfService.sections.aboutService.content'),
        },
        {
            title: t('termsOfService.sections.reportsActivity.title'),
            content: t('termsOfService.sections.reportsActivity.content'),
        },
        {
            title: t('termsOfService.sections.userContent.title'),
            content: t('termsOfService.sections.userContent.content'),
        },
        {
            title: t('termsOfService.sections.businessInfo.title'),
            content: t('termsOfService.sections.businessInfo.content', { email: CONTACT_EMAIL }),
        },
        {
            title: t('termsOfService.sections.photosReports.title'),
            content: t('termsOfService.sections.photosReports.content'),
        },
        {
            title: t('termsOfService.sections.permittedUse.title'),
            content: t('termsOfService.sections.permittedUse.content'),
        },
        {
            title: t('termsOfService.sections.availability.title'),
            content: t('termsOfService.sections.availability.content'),
        },
        {
            title: t('termsOfService.sections.limitation.title'),
            content: t('termsOfService.sections.limitation.content'),
        },
        {
            title: t('termsOfService.sections.termination.title'),
            content: t('termsOfService.sections.termination.content'),
        },
        {
            title: t('termsOfService.sections.changes.title'),
            content: t('termsOfService.sections.changes.content'),
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('termsOfService.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero */}
                <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.heroCard}>
                    <Ionicons name="document-text" size={48} color="#fff" />
                    <Text style={styles.heroTitle}>{t('termsOfService.title')}</Text>
                    <Text style={styles.heroSubtitle}>{t('termsOfService.heroSubtitle')}</Text>
                    <Text style={styles.lastUpdated}>{lastUpdatedText}</Text>
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
                <Text style={styles.contactTitle}>{t('termsOfService.contact.title')}</Text>
                <Text style={styles.contactDescription}>{t('termsOfService.contact.description')}</Text>
                <TouchableOpacity
                    style={styles.contactCard}
                    onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
                >
                    <View style={styles.contactIconCircle}>
                        <Ionicons name="mail-outline" size={22} color="#4F46E5" />
                    </View>
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>{t('termsOfService.contact.emailLabel')}</Text>
                        <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('termsOfService.footer')}</Text>
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
