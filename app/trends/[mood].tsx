import { useLanguage } from '@/context/LanguageContext';
import { usePlaces } from '@/context/PlacesContext';
import { t } from '@/i18n';
import { formatDistance } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const isLatinText = (value: string) => /[A-Za-z]/.test(value) && /^[\x00-\x7F]*$/.test(value);

const moods = [
    { id: '1', label: 'calm', icon: 'leaf-outline', colors: ['#FFF9C4', '#FFF59D'], iconColor: '#F59E0B' },
    { id: '2', label: 'social', icon: 'people-outline', colors: ['#E0F2FE', '#BAE6FD'], iconColor: '#0284C7' },
    { id: '3', label: 'adventure', icon: 'rocket-outline', colors: ['#FEF2F2', '#FECACA'], iconColor: '#DC2626' },
    { id: '4', label: 'spontaneous', icon: 'aperture-outline', colors: ['#F0FDF4', '#DCFCE7'], iconColor: '#16A34A' },
];

export default function TrendsCategoryScreen() {
    const { mood } = useLocalSearchParams() as { mood?: string };
    const router = useRouter();
    const { language } = useLanguage();
    const { trendingPlaces, loading } = usePlaces();
    const [selectedMood, setSelectedMood] = useState<string | null>(mood || null);

    const filtered = useMemo(() => {
        if (!selectedMood || !trendingPlaces.length) return trendingPlaces || [];

        const moodStr = selectedMood.toLowerCase();

        let results = (trendingPlaces || []).filter((place: any) => {
            const category = (place.category || '').toLowerCase();
            const description = (place.description || '').toLowerCase();
            const name = (place.name || '').toLowerCase();

            if (moodStr === 'calm') {
                return description.includes('relaxed') || description.includes('quiet') || description.includes('cozy') ||
                    description.includes('peaceful') || name.includes('cafe') || name.includes('coffee') || name.includes('bakery') ||
                    description.includes('tea');
            }
            if (moodStr === 'social') {
                return category === 'hot' || description.includes('lively') || description.includes('social') ||
                    description.includes('popular') || description.includes('vibrant') || name.includes('bar') ||
                    name.includes('club') || name.includes('pub') || name.includes('lounge') || description.includes('music');
            }
            if (moodStr === 'adventure') {
                return description.includes('unique') || description.includes('discovery') || description.includes('exotic') ||
                    description.includes('experimental') || description.includes('hidden') || name.includes('fusion') ||
                    name.includes('experimental') || description.includes('fusion');
            }
            if (moodStr === 'spontaneous') {
                return category === 'shopping' || description.includes('quick') || description.includes('convenient') ||
                    description.includes('fast') || name.includes('express') || name.includes('fast') ||
                    name.includes('takeaway') || description.includes('grab');
            }

            return false;
        });

        // SUPPLEMENT: If specific mood results are too few, add top-rated ones for better UX
        if (results.length < 15 && trendingPlaces.length > 0) {
            const seenIds = new Set(results.map(r => r.id));
            const topRatedFallback = [...trendingPlaces]
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .filter(p => !seenIds.has(p.id));

            results = [...results, ...topRatedFallback.slice(0, 15 - results.length)];
        }

        return results;
    }, [selectedMood, trendingPlaces]);

    // Limit number of displayed items to avoid memory pressure on devices with many results
    const MAX_DISPLAY = 15;
    const displayed = (filtered || []).slice(0, MAX_DISPLAY);

    const ITEM_HEIGHT = 160; // approximate fixed height for getItemLayout to optimize virtualization

    const getQueueChipColors = (status: string) => {
        if (status === 'vacant') return { bg: '#DCFCE7', text: '#15803D', icon: '#15803D' };
        if (status === 'medium') return { bg: '#FFEDD5', text: '#C2410C', icon: '#C2410C' };
        return { bg: '#FEE2E2', text: '#B91C1C', icon: '#B91C1C' };
    };

    const renderCard = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.premiumCard} onPress={() => router.push({ pathname: '/place/[id]', params: { id: item.id } })} activeOpacity={0.9}>
            <Image
                source={{ uri: item.image }}
                style={styles.cardCover}
                priority="low"
                cachePolicy="disk"
                contentFit="cover"
            />
            <View style={styles.cardOverlay}>
                <View style={[styles.statusChip, { backgroundColor: getQueueChipColors(item.status).bg }]}>
                    <Ionicons name="flash" size={14} color={getQueueChipColors(item.status).icon} />
                    <Text style={[styles.statusChipText, { color: getQueueChipColors(item.status).text }]}>{t(`places.${item.status}`)}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                    <View style={styles.nameContent}>
                        <Text style={[styles.placeName, language === 'he' && isLatinText(item.name) && styles.ltrText]}>{item.name}</Text>
                        <Text style={styles.placeDescription}>{item.description}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.quickVisitBtn}
                        onPress={() => router.push({ pathname: '/place/[id]', params: { id: item.id } })}
                    >
                        <View style={styles.visitGradient}>
                            <Text style={styles.visitText}>{t('trends.visit')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.cardFooter}>
                    <View style={styles.metaRow}>
                        <Ionicons name="location" size={14} color="#6366F1" />
                        <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <FlatList
                data={displayed}
                renderItem={renderCard}
                keyExtractor={(i) => i.id}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                ListHeaderComponent={() => (
                    <View>
                        {/* Header */}
                        <View style={styles.listHeader}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.title}>{(selectedMood ? t(`moods.${selectedMood}`) : t('tabs.explore')).toString().toUpperCase()}</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {/* Selected Mood Header */}
                        {selectedMood && (() => {
                            const moodObj = moods.find(m => m.label === selectedMood) || moods[0];
                            return (
                                <View style={styles.moodHeader}>
                                    <View style={styles.moodHeaderContent}>
                                        <View style={[styles.moodCircleLarge, { borderColor: moodObj.iconColor }]}>
                                            <Ionicons name={moodObj.icon as any} size={36} color={moodObj.iconColor} />
                                        </View>
                                        <Text style={styles.moodTitle}>{t(`moods.${moodObj.label}`).toString().toUpperCase()}</Text>
                                        <Text style={styles.moodSubtitle}>{t(`moods.${moodObj.label}Desc`)}</Text>
                                        <TouchableOpacity style={styles.changeBtn} onPress={() => router.push('/(tabs)/trends')}>
                                            <Text style={styles.changeBtnText}>{t('trends.changeMood')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })()}

                        <View style={styles.sectionDivider} />
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>
                            {loading ? t('common.loading') : t('trends.noPlaces')}
                        </Text>
                    </View>
                )}
                ListFooterComponent={() => (
                    filtered.length > MAX_DISPLAY ? (
                        <Text style={styles.footerText}>
                            {t('trends.showingFirst', { count: MAX_DISPLAY, total: filtered.length })}
                        </Text>
                    ) : (
                        <View style={{ height: 20 }} />
                    )
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10
    },
    backButton: { padding: 8 },
    title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    moodHeader: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10
    },
    moodHeaderContent: {
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#F8FAFC',
        paddingVertical: 30,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    moodCircleLarge: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 6
    },
    moodTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginTop: 16 },
    moodSubtitle: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
    changeBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#E0E7FF' },
    changeBtnText: { color: '#6366F1', fontWeight: '800', fontSize: 13 },
    sectionDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20, marginHorizontal: 20 },

    premiumCard: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 4, marginBottom: 16 },
    cardCover: { width: '100%', height: 160 },
    cardOverlay: { position: 'absolute', top: 14, left: 14 },
    statusChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
    statusChipText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    cardBody: { padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    nameContent: { flex: 1, marginRight: 12 },
    placeName: { fontSize: 19, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
    ltrText: { writingDirection: 'ltr', textAlign: 'left' },
    placeDescription: { fontSize: 14, color: '#64748B', fontWeight: '500', lineHeight: 20 },
    quickVisitBtn: { borderRadius: 12, overflow: 'hidden' },
    visitGradient: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#6366F1', borderRadius: 12 },
    visitText: { color: '#fff', fontSize: 14, fontWeight: '800' },
    cardFooter: { flexDirection: 'row', alignItems: 'center' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    distanceText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 12 },
    emptyText: { textAlign: 'center', color: '#64748B', fontSize: 15, fontWeight: '500' },
    footerText: { textAlign: 'center', color: '#94A3B8', marginVertical: 20, fontSize: 13, fontWeight: '600' },
});
