import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpScreen() {
    const router = useRouter();

    const faqItems = [
        {
            question: "How do I report a queue?",
            answer: "Tap on any place on the map or dashboard, and then click 'Add Report'. Choose the crowd level and add a brief description of the situation."
        },
        {
            question: "What are points for?",
            answer: "Points help you level up and earn medals. They show your contribution to the community. 500 XP = 1 Level Up!"
        },
        {
            question: "How do streaks work?",
            answer: "Log in every day to keep your streak alive. If you miss a day, your streak will reset to 1. Consistency is key!"
        },
        {
            question: "Is my data private?",
            answer: "Yes, we only use your location to show you nearby places and verify report accuracy. Your personal details are never shared."
        }
    ];

    const contactMethods = [
        { icon: 'mail-outline', label: 'Email Support', value: 'support@noline.app' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Support section */}
                <LinearGradient
                    colors={['#4F46E5', '#6366F1']}
                    style={styles.heroCard}
                >
                    <Ionicons name="help-buoy-outline" size={48} color="#fff" />
                    <Text style={styles.heroTitle}>How can we help?</Text>
                    <Text style={styles.heroSubtitle}>Find answers to frequent questions or reach out to our team.</Text>
                </LinearGradient>

                {/* FAQ Section */}
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                {faqItems.map((item, index) => (
                    <View key={index} style={styles.faqCard}>
                        <Text style={styles.question}>{item.question}</Text>
                        <Text style={styles.answer}>{item.answer}</Text>
                    </View>
                ))}

                {/* Contact Section */}
                <Text style={styles.sectionTitle}>Get in touch</Text>
                <View style={styles.contactContainer}>
                    {contactMethods.map((method, index) => (
                        <TouchableOpacity key={index} style={styles.contactItem}>
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
