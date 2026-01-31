import { Ionicons } from '@expo/vector-icons';
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

export default function AboutScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About NoLine</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoSection}>
                    <View style={styles.logoBorder}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="flash-outline" size={40} color="#4F46E5" />
                        </View>
                    </View>
                    <Text style={styles.appName}>NoLine</Text>
                    <Text style={styles.tagline}>Skip the queue, enjoy the moment.</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Mission</Text>
                    <Text style={styles.sectionText}>
                        NoLine was born from a simple idea: time is the most valuable luxury.
                        We believe no one should spend their precious moments waiting in frustration.
                        Our community-driven platform empowers people to share real-time crowd insights,
                        helping everyone make smarter decisions about when and where to visit.
                    </Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>10k+</Text>
                        <Text style={styles.statLabel}>Locations</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>50k+</Text>
                        <Text style={styles.statLabel}>Reports</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>4.9/5</Text>
                        <Text style={styles.statLabel}>Accuracy</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Built for the Community</Text>
                    <Text style={styles.sectionText}>
                        Every piece of data you see is contributed by users like you.
                        By submitting a report, you're not just earning points—you're helping
                        your neighbors save time and reducing congestion at your favorite local businesses.
                    </Text>
                </View>

                <View style={styles.legalSection}>
                    <TouchableOpacity style={styles.legalItem}>
                        <Text style={styles.legalLabel}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                    <View style={styles.legalDivider} />
                    <TouchableOpacity style={styles.legalItem}>
                        <Text style={styles.legalLabel}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                    <View style={styles.legalDivider} />
                    <TouchableOpacity style={styles.legalItem}>
                        <Text style={styles.legalLabel}>Cookie Policy</Text>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.builtWith}>Built with ❤️ by the Jyoti Team</Text>
                <Text style={styles.version}>© 2026 NoLine. All rights reserved.</Text>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    scrollContent: {
        padding: 24,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
        paddingTop: 20,
    },
    logoBorder: {
        padding: 4,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    appName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1E293B',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '500',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 24,
        letterSpacing: 0.2,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#4F46E5',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E2E8F0',
    },
    legalSection: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingVertical: 8,
        marginBottom: 32,
    },
    legalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    legalLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    legalDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 16,
    },
    builtWith: {
        textAlign: 'center',
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 8,
    }
});
