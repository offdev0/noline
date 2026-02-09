import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const moods = [
    { id: '1', label: 'calm', icon: 'leaf-outline', colors: ['#FFF9C4', '#FFF59D'], iconColor: '#F59E0B' },
    { id: '2', label: 'social', icon: 'people-outline', colors: ['#E0F2FE', '#BAE6FD'], iconColor: '#0284C7' },
    { id: '3', label: 'adventure', icon: 'rocket-outline', colors: ['#FEF2F2', '#FECACA'], iconColor: '#DC2626' },
    { id: '4', label: 'freedom', icon: 'aperture-outline', colors: ['#F0FDF4', '#DCFCE7'], iconColor: '#16A34A' },
];



import { useFavorites } from '@/context/FavoritesContext';
import { usePlaces } from '@/context/PlacesContext';
import { PlaceData } from '@/services/MapsService';

export default function TrendsScreen() {
    const router = useRouter();
    const { trendingPlaces, loading } = usePlaces();
    const { favorites } = useFavorites();
    const [showAllTrending, setShowAllTrending] = useState(false);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const filteredTrendingPlaces = useMemo(() => {
        if (!selectedMood) return trendingPlaces;

        return trendingPlaces.filter((place: PlaceData) => {
            const mood = selectedMood.toLowerCase();
            const category = place.category.toLowerCase();

            if (mood === 'calm') return category === 'mustvisit' || place.description.toLowerCase().includes('relaxed');
            if (mood === 'social') return category === 'restaurant' || category === 'hot';
            if (mood === 'adventure') return category === 'fun' || category === 'casino';
            if (mood === 'freedom') return category === 'shopping' || category === 'mustvisit';

            return true;
        });
    }, [selectedMood, trendingPlaces]);

    const handlePlacePress = (id: string) => {
        router.push({
            pathname: '/place/[id]',
            params: { id }
        });
    };

    const getCategoryIcon = (cat: string) => {
        const c = cat?.toLowerCase() || '';
        if (c.includes('restaurant')) return 'restaurant';
        if (c.includes('cafe') || c.includes('coffee')) return 'cafe';
        if (c.includes('shop') || c.includes('shopping') || c.includes('mall') || c.includes('store')) return 'cart';
        if (c.includes('casino') || c.includes('game') || c.includes('play')) return 'game-controller';
        if (c.includes('fun') || c.includes('entertainment') || c.includes('park')) return 'happy';
        if (c.includes('bar') || c.includes('club') || c.includes('night')) return 'wine';
        if (c.includes('must') || c.includes('attraction') || c.includes('landmark')) return 'camera';
        if (c.includes('vibe') || c.includes('special')) return 'sparkles';
        return 'location';
    };

    // Use a smaller image source when available to reduce memory usage
    const getImageForPlace = (place: PlaceData) => (place.thumbnail || place.thumb || place.image);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.circularButton}>
                        <Ionicons name="search-outline" size={20} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                {/* Main Hero Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>{t('trends.heroTitle')}</Text>
                </View>

                {/* Mood Selection */}
                <View style={styles.moodContainer}>
                    {moods.map((mood) => (
                        <View key={mood.id} style={styles.moodItem}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.moodWrapper,
                                    selectedMood === mood.label && styles.selectedMoodWrapper
                                ]}
                                onPress={() => router.push(`/trends/${mood.label}`)}
                            >
                                <LinearGradient
                                    colors={mood.colors as any}
                                    style={[
                                        styles.moodCircle,
                                        selectedMood === mood.label && { borderWidth: 2, borderColor: mood.iconColor }
                                    ]}
                                >
                                    <Ionicons name={mood.icon as any} size={22} color={mood.iconColor} />
                                </LinearGradient>
                                <Text style={[styles.moodLabel, { color: mood.iconColor }]}>{t(`moods.${mood.label}`)}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Trending Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('trends.trendingNearYou')}</Text>
                    {trendingPlaces.length > 3 && (
                        <TouchableOpacity onPress={() => setShowAllTrending(!showAllTrending)}>
                            <Text style={styles.seeAllText}>
                                {showAllTrending ? t('trends.showLess') : t('trends.seeAll')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.trendingContainer}>
                    {loading && trendingPlaces.length === 0 ? (
                        <View style={{ padding: 20 }}>
                            <Text style={{ color: '#666', textAlign: 'center' }}>{t('trends.updating')}</Text>
                        </View>
                    ) : (
                        (showAllTrending ? filteredTrendingPlaces.slice(0, 12) : filteredTrendingPlaces.slice(0, 3)).map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.premiumCard}
                                onPress={() => handlePlacePress(item.id)}
                                activeOpacity={0.9}
                            >
                                <Image source={{ uri: getImageForPlace(item) }} style={styles.cardCover} priority="low" cachePolicy="disk" contentFit="cover" />
                                <View style={styles.cardOverlay}>
                                    <View style={styles.statusChip}>
                                        <Ionicons name="flash" size={14} color="#16A34A" />
                                        <Text style={styles.statusChipText}>{item.status}</Text>
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
                                            onPress={() => handlePlacePress(item.id)}
                                        >
                                            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.visitGradient}>
                                                <Text style={styles.visitText}>{t('trends.visit')}</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View style={styles.metaRow}>
                                            <Ionicons name={getCategoryIcon(item.category) as any} size={14} color="#6366F1" />
                                            <Text style={styles.distanceText}>{item.distance} away</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Favorites Section - Redesigned */}
                <View style={styles.favoritesSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.favTitleRow}>
                            <Ionicons name="heart" size={20} color="#EF4444" />
                            <Text style={styles.sectionTitle}> {t('trends.yourFavorites')}</Text>
                        </View>
                        {favorites.length > 0 && (
                            <TouchableOpacity onPress={() => router.push('/favorites')}>
                                <Text style={styles.seeAllText}>{t('trends.seeAll')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.favoritesScroll}
                        contentContainerStyle={styles.favScrollContent}
                    >
                        {favorites.length === 0 ? (
                            <View style={styles.emptyFavBox}>
                                <Ionicons name="heart-outline" size={32} color="#CBD5E1" />
                                <Text style={styles.emptyFavText}>{t('trends.favoritesEmpty')}</Text>
                            </View>
                        ) : (
                            favorites.map((fav) => (
                                <TouchableOpacity
                                    key={fav.id}
                                    style={styles.favCompactCard}
                                    onPress={() => handlePlacePress(fav.id)}
                                    activeOpacity={0.85}
                                >
                                    <Image source={{ uri: fav.image }} style={styles.favThumb} />
                                    <View style={styles.favInfo}>
                                        <Text style={styles.favName} numberOfLines={1}>{fav.name}</Text>
                                        <View style={styles.goBackBadge}>
                                            <Text style={styles.goBackText}>{t('trends.goBack')}</Text>
                                            <Ionicons name="chevron-forward" size={10} color="#fff" />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    circularButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
        marginTop: -40
    },
    mainTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 42,
        letterSpacing: -1,
    },
    moodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 35,
    },
    moodItem: {
        alignItems: 'center',
        width: (width - 60) / 4,
    },
    moodWrapper: {
        alignItems: 'center',
    },
    moodCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    moodLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    selectedMoodWrapper: {
        transform: [{ scale: 1.05 }],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    favTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    seeAllText: {
        fontSize: 14,
        color: '#6366F1',
        fontWeight: '700',
    },
    trendingContainer: {
        paddingHorizontal: 20,
        gap: 20,
    },
    premiumCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 4,
    },
    cardCover: {
        width: '100%',
        height: 120,
    },
    cardOverlay: {
        position: 'absolute',
        top: 14,
        left: 14,
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#16A34A',
        textTransform: 'uppercase',
    },
    cardBody: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    nameContent: {
        flex: 1,
        marginRight: 12,
    },
    placeName: {
        fontSize: 19,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
    },
    placeDescription: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    quickVisitBtn: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    visitGradient: {
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    visitText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distanceText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    favoritesSection: {
        marginTop: 40,
        marginBottom: 20,
    },
    favoritesScroll: {
        paddingLeft: 20,
    },
    favScrollContent: {
        paddingRight: 40,
        paddingBottom: 10,
    },
    favCompactCard: {
        width: 150,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        overflow: 'hidden',
    },
    favThumb: {
        width: '100%',
        height: 90,
    },
    favInfo: {
        padding: 12,
    },
    favName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    goBackBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F97316',
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    goBackText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
    },
    emptyFavBox: {
        width: 300,
        height: 100,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    emptyFavText: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 8,
    },
    bottomSpace: {
        height: 120,
    }
});
