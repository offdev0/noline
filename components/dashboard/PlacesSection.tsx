import { usePlaces } from '@/context/PlacesContext';
import { t } from '@/i18n';
import { formatDistance } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

// Modular Components
import { CategoryIcon } from './places/CategoryIcon';
import { CARD_MARGIN, FeaturedCard, GridCard, ListCard, PlaceProps } from './places/PlaceCards';
import { SectionHeader } from './places/SectionHeader';

export default function PlacesSection({ isLocationEnabled = false }: { isLocationEnabled?: boolean }) {
    const router = useRouter();
    const { allPlaces, loading } = usePlaces();

    const bestPlacesTitle = isLocationEnabled
        ? t('dashboard.bestPlacesNearby')
        : t('dashboard.bestPlaces');
    const popularTitle = isLocationEnabled
        ? t('dashboard.popularNearYou')
        : t('dashboard.popular');

    const sortedPlaces = useMemo(() => {
        if (!allPlaces || allPlaces.length === 0) return [];
        return [...allPlaces].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }, [allPlaces]);

    const featuredPlace = sortedPlaces[0];
    const gridPlaces = sortedPlaces.slice(1, 3);
    const remainingPlaces = sortedPlaces.slice(3);

    const mapPlace = (p: any): PlaceProps => ({
        id: p.id,
        name: p.name,
        rating: p.rating || 4.5,
        category: p.category,
        queueStatus: p.status === 'vacant' ? t('places.shortWait') : t('places.quiteBusy'),
        distance: formatDistance(p.distance),
        image: p.image,
        status: p.status,
        description: p.description || ''
    });

    if (loading && allPlaces.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5356FF" />
                <Text style={styles.loadingText}>{t('placesSection.fetching')}</Text>
            </View>
        );
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            <SectionHeader title={bestPlacesTitle} />

            {featuredPlace && (
                <FeaturedCard
                    place={mapPlace(featuredPlace)}
                    onPress={() => router.push({ pathname: '/place/[id]', params: { id: featuredPlace.id } })}
                />
            )}

            <View style={styles.gridRow}>
                {gridPlaces.map(p => (
                    <GridCard
                        key={p.id}
                        place={mapPlace(p)}
                        onPress={() => router.push({ pathname: '/place/[id]', params: { id: p.id } })}
                    />
                ))}
            </View>

            <View style={styles.categorySection}>
                <SectionHeader title={t('dashboard.exploreByCategory')} />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    <CategoryIcon
                        imageUrl="https://img.icons8.com/?size=96&id=GpH0R2n99gZy&format=png"
                        label={t('categories.cafe')}
                        bgColor="#F5F5F5"
                        onPress={() => router.push({ pathname: '/category/[id]', params: { id: 'cafe' } })}
                    />
                    <CategoryIcon
                        imageUrl="https://img.icons8.com/3d-fluency/94/hamburger.png"
                        label={t('places.food')}
                        bgColor="#FFF3E0"
                        onPress={() => router.push({ pathname: '/category/[id]', params: { id: 'food' } })}
                    />
                    <CategoryIcon
                        imageUrl={"https://img.icons8.com/?size=96&id=g4ya0t-L-Ui_&format=png"}
                        label={t('categories.bars')}
                        bgColor="#E0F2F1"
                        onPress={() => router.push({ pathname: '/category/[id]', params: { id: 'bars' } })}
                    />
                    <CategoryIcon
                        imageUrl={"https://img.icons8.com/?size=96&id=81214&format=png"}
                        label={t('categories.desserts')}
                        bgColor="#FCE4EC"
                        onPress={() => router.push({ pathname: '/category/[id]', params: { id: 'desserts' } })}
                    />
                </ScrollView>
            </View>

            <View style={styles.popularDivider}>
                <Text style={styles.popularTitle}>{popularTitle}</Text>
            </View>

            <View style={styles.listContainer}>
                {remainingPlaces.map(p => (
                    <ListCard
                        key={p.id}
                        place={mapPlace(p)}
                        onPress={() => router.push({ pathname: '/place/[id]', params: { id: p.id } })}
                    />
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    loadingText: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#475569' },
    gridRow: { flexDirection: 'row', paddingHorizontal: CARD_MARGIN, justifyContent: 'space-between', marginBottom: 24 },
    categorySection: { marginBottom: 0 },
    categoryScroll: { paddingHorizontal: CARD_MARGIN, gap: 12 },
    popularDivider: { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingVertical: 16, paddingHorizontal: CARD_MARGIN },
    popularTitle: { fontSize: 18, color: '#64748B' },
    boldText: { fontWeight: '800', color: '#1E293B' },
    listContainer: { paddingBottom: 20 },
});
