import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpScreen() {
    const router = useRouter();

    const helpSections = [
        {
            title: t('help.sections.canDo.title'),
            content: t('help.sections.canDo.content')
        },
        {
            title: t('help.sections.whyNoPlaces.title'),
            content: t('help.sections.whyNoPlaces.content')
        },
        {
            category: t('help.sections.reports.category'),
            items: [
                {
                    question: t('help.sections.reports.howWorkQ'),
                    answer: t('help.sections.reports.howWorkA')
                },
                {
                    question: t('help.sections.reports.mistakeQ'),
                    answer: t('help.sections.reports.mistakeA')
                },
                {
                    question: t('help.sections.reports.cooldownQ'),
                    answer: t('help.sections.reports.cooldownA')
                },
                {
                    question: t('help.sections.reports.expectedQ'),
                    answer: t('help.sections.reports.expectedA')
                }
            ]
        },
        {
            category: t('help.sections.rewards.category'),
            items: [
                {
                    question: t('help.sections.rewards.earnXpQ'),
                    answer: t('help.sections.rewards.earnXpA')
                },
                {
                    question: t('help.sections.rewards.medalsQ'),
                    answer: t('help.sections.rewards.medalsA')
                },
                {
                    question: t('help.sections.rewards.streaksQ'),
                    answer: t('help.sections.rewards.streaksA')
                }
            ]
        },
        {
            category: t('help.sections.favorites.category'),
            items: [
                {
                    question: t('help.sections.favorites.whatFavQ'),
                    answer: t('help.sections.favorites.whatFavA')
                },
                {
                    question: t('help.sections.favorites.whyDiffQ'),
                    answer: t('help.sections.favorites.whyDiffA')
                }
            ]
        },
        {
            category: t('help.sections.accuracy.category'),
            items: [
                {
                    question: t('help.sections.accuracy.realtimeQ'),
                    answer: t('help.sections.accuracy.realtimeA')
                }
            ]
        }
    ];

    const contactMethods = [
        { icon: 'mail-outline', label: t('help.emailSupport'), value: 'support@noline.app' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('help.title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Support section */}
                <LinearGradient
                    colors={['#4F46E5', '#6366F1']}
                    style={styles.heroCard}
                >
                    <Ionicons name="help-buoy-outline" size={48} color="#fff" />
                    <Text style={styles.heroTitle}>{t('help.heroTitle')}</Text>
                    <Text style={styles.heroSubtitle}>{t('help.heroSubtitle')}</Text>
                </LinearGradient>

                {helpSections.map((section, sIndex) => (
                    <View key={sIndex} style={styles.sectionContainer}>
                        {section.category && (
                            <Text style={styles.categoryTitle}>{section.category}</Text>
                        )}
                        {section.title && (
                            <View style={styles.faqCard}>
                                <Text style={styles.question}>{section.title}</Text>
                                <Text style={styles.answer}>{section.content}</Text>
                            </View>
                        )}
                        {section.items && section.items.map((item, iIndex) => (
                            <View key={iIndex} style={styles.faqCard}>
                                <Text style={styles.question}>{item.question}</Text>
                                <Text style={styles.answer}>{item.answer}</Text>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Contact Section */}
                <Text style={styles.sectionTitle}>{t('help.getInTouch')}</Text>
                <View style={styles.contactContainer}>
                    {contactMethods.map((method, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.contactItem}
                            onPress={() => Linking.openURL('mailto:support@noline.app')}
                        >
                            <View style={styles.contactIconCircle}>
                                <Ionicons name={method.icon as any} size={22} color="#4F46E5" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>{method.label}</Text>
                                <Text style={styles.contactValue}>{method.value}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Version 1.0.4 (BETA)</Text>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    scrollContent: {
        padding: 16,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginTop: 12,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#E0E7FF',
        textAlign: 'center',
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
        marginTop: 8,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0F172A',
        marginTop: 24,
        marginBottom: 16,
    },
    sectionContainer: {
        marginBottom: 16,
    },
    faqCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    question: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    contactContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginBottom: 24,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    contactIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    contactValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    footer: {
        marginTop: 12,
        alignItems: 'center',
        paddingBottom: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    }
});
