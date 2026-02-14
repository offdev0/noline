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

const moods = [
    { id: '1', label: 'calm', icon: 'leaf-outline', colors: ['#FFF9C4', '#FFF59D'], iconColor: '#F59E0B' },
    { id: '2', label: 'social', icon: 'people-outline', colors: ['#E0F2FE', '#BAE6FD'], iconColor: '#0284C7' },
    { id: '3', label: 'adventure', icon: 'rocket-outline', colors: ['#FEF2F2', '#FECACA'], iconColor: '#DC2626' },
    { id: '4', label: 'freedom', icon: 'aperture-outline', colors: ['#F0FDF4', '#DCFCE7'], iconColor: '#16A34A' },
];

export default function TrendsCategoryScreen() {
    const { mood } = useLocalSearchParams() as { mood?: string };
    const router = useRouter();
    const { trendingPlaces, loading } = usePlaces();
    const [selectedMood, setSelectedMood] = useState<string | null>(mood || null);

    const filtered = useMemo(() => {
        if (!selectedMood || !trendingPlaces.length) return trendingPlaces || [];

        const moodStr = selectedMood.toLowerCase();

        let results = (trendingPlaces || []).filter((place: any) => {
            const category = (place.category || '').toLowerCase();
            const description = (place.description || '').toLowerCase();

            if (moodStr === 'calm') {
                return category === 'mustvisit' || category === 'cafe' || description.includes('relaxed') || description.includes('quiet');
            }
            if (moodStr === 'social') {
                return category === 'restaurant' || category === 'hot' || category === 'bar' || description.includes('lively');
            }
            if (moodStr === 'adventure') {
                return category === 'fun' || category === 'casino' || category === 'park' || description.includes('exciting');
            }
            if (moodStr === 'freedom') {
                return category === 'shopping' || category === 'mustvisit' || category === 'outdoor';
            }

            return true;
        });

        // FALLBACK: If specific mood results are empty, provide a smart fallback to ensure the screen is never blank
        if (results.length === 0) {
            console.log(`[TrendsCategory] No results for mood: ${moodStr}, providing fallback results`);
            if (moodStr === 'calm') results = trendingPlaces.filter(p => (p.rating || 0) >= 4.5); // Highly rated
            else if (moodStr === 'social') results = trendingPlaces.filter(p => p.category === 'restaurant');
            else results = [...trendingPlaces].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
        }

        // Global fallback to ensure SOMETHING is always shown
        return results.length > 0 ? results : trendingPlaces;
    }, [selectedMood, trendingPlaces]);

    // Limit number of displayed items to avoid memory pressure on devices with many results
    const MAX_DISPLAY = 20; // reduced to lower memory usage
    const displayed = (filtered || []).slice(0, MAX_DISPLAY);

    const ITEM_HEIGHT = 160; // approximate fixed height for getItemLayout to optimize virtualization

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
                <View style={styles.statusChip}>
                    <Ionicons name="flash" size={14} color="#16A34A" />
                    <Text style={styles.statusChipText}>{t(`places.${item.status}`)}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                    <View style={styles.nameContent}>
                        <Text style={styles.placeName}>{item.name}</Text>
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>{(selectedMood ? t(`moods.${selectedMood}`) : t('tabs.trends')).toString().toUpperCase()}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Selected Mood Header */}
            {selectedMood && (() => {
                const moodObj = moods.find(m => m.label === selectedMood) || moods[0];
                return (
                    <View style={styles.moodHeader}>
                        <View style={[styles.moodCircleLarge, { borderColor: moodObj.iconColor }]}>
                            <Ionicons name={moodObj.icon as any} size={36} color={moodObj.iconColor} />
                        </View>
                        <Text style={styles.moodTitle}>{t(`moods.${moodObj.label}`).toString().toUpperCase()}</Text>
                        <Text style={styles.moodSubtitle}>{t('trends.placesFor', { mood: t(`moods.${moodObj.label}`) })}</Text>
                        <TouchableOpacity style={styles.changeBtn} onPress={() => router.push('/(tabs)/trends')}>
                            <Text style={styles.changeBtnText}>{t('trends.changeMood')}</Text>
                        </TouchableOpacity>
                    </View>
                );
            })()}


            <FlatList
                data={displayed}
                renderItem={renderCard}
                keyExtractor={(i) => i.id}
                initialNumToRender={2}
                maxToRenderPerBatch={3}
                windowSize={5}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16 }}
                getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                ListEmptyComponent={() => <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 20 }}>{loading ? t('common.loading') : t('trends.noPlaces')}</Text>}
                ListFooterComponent={() => (
                    filtered.length > MAX_DISPLAY ? (
                        <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 8 }}>{t('trends.showingFirst', { count: MAX_DISPLAY, total: filtered.length })}</Text>
                    ) : null
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    backButton: { padding: 8 },
    title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    moodHeader: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    moodCircleLarge: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    moodTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 12 },
    moodSubtitle: { fontSize: 13, color: '#64748B', marginTop: 6 },
    changeBtn: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#EEF2FF' },
    changeBtnText: { color: '#6366F1', fontWeight: '800' },



    premiumCard: { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 4, marginBottom: 12 },
    cardCover: { width: '100%', height: 120 },
    cardOverlay: { position: 'absolute', top: 14, left: 14 },
    statusChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
    statusChipText: { fontSize: 12, fontWeight: '800', color: '#16A34A', textTransform: 'uppercase' },
    cardBody: { padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    nameContent: { flex: 1, marginRight: 12 },
    placeName: { fontSize: 19, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
    placeDescription: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    quickVisitBtn: { borderRadius: 12, overflow: 'hidden' },
    visitGradient: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#6366F1', borderRadius: 12 },
    visitText: { color: '#fff', fontSize: 14, fontWeight: '800' },
    cardFooter: { flexDirection: 'row', alignItems: 'center' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    distanceText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
});