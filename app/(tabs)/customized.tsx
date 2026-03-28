import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/i18n';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoritesSection } from '@/components/customized/FavoritesSection';
import { GroupSelection } from '@/components/customized/GroupSelection';

export default function CustomizedScreen() {
    const router = useRouter();
    const { favorites } = useFavorites();
    const { language } = useLanguage();

    const handleSelectGroup = (groupId: string) => {
        router.push({
            pathname: '/generate-route',
            params: { groupId }
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>{t('route.personalizedTitle')}</Text>
                    <Text style={styles.pageSubtitle}>{t('route.planSubtitle')}</Text>
                </View>

                {/* Selection Section */}
                <View style={styles.mainArea}>
                    <GroupSelection onSelect={handleSelectGroup} />
                </View>

                {/* Favorites Section */}
                <FavoritesSection
                    favorites={favorites}
                    language={language}
                    onViewAll={() => router.push('/favorites')}
                    onPressPlace={(place) => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
                />

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },

    header: { marginBottom: 24 },
    pageTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
    pageSubtitle: { fontSize: 14, color: '#64748B', lineHeight: 20 },

    mainArea: {
        marginBottom: 32,
    },
});
