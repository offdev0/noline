import { formatDistance } from '@/utils/formatters';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { usePlaces } from '@/context/PlacesContext';
import { PlaceData } from '@/services/MapsService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2; // 2 columns with 20px padding each side + 12px gap

export default function SearchResultsScreen() {
    const router = useRouter();
    const { query: initialQuery } = useLocalSearchParams();
    const { performSearch, searchResults, loading, recordPlaceClick, searchHistory } = usePlaces();
    const [searchQuery, setSearchQuery] = useState((initialQuery as string) || '');
    const [isInputFocused, setIsInputFocused] = useState(false);

    useEffect(() => {
        if (initialQuery) {
            handleSearch(initialQuery as string);
        }
    }, [initialQuery]);

    const handleSearch = async (val: string) => {
        if (!val.trim()) return;
        await performSearch(val.trim());
    };

    const handlePlacePress = (place: PlaceData) => {
        recordPlaceClick(place);
        router.push({ pathname: '/place/[id]', params: { id: place.id } });
    };

    const getQueueColor = (status: string) => {
        if (status === 'vacant') return '#22C55E';
        if (status === 'medium') return '#F59E0B';
        return '#EF4444';
    };

    const getQueueLabel = (status: string) => {
        if (status === 'vacant') return t('placesSection.shortQueue');
        if (status === 'medium') return t('placesSection.mediumQueue');
        return t('placesSection.longQueue');
    };

    const getCategoryIcon = (cat: string) => {
        const c = cat.toLowerCase();
        if (c.includes('restaurant')) return 'restaurant';
        if (c.includes('cafe') || c.includes('coffee')) return 'cafe';
        if (c.includes('shop') || c.includes('shopping') || c.includes('mall') || c.includes('store')) return 'cart';
        if (c.includes('casino') || c.includes('game') || c.includes('play')) return 'game-controller';
        if (c.includes('fun') || c.includes('entertainment') || c.includes('park')) return 'happy';
        if (c.includes('bar') || c.includes('club') || c.includes('night')) return 'wine';
        if (c.includes('must') || c.includes('attraction') || c.includes('landmark')) return 'camera';
        return 'location';
    };

    const renderGridItem = ({ item }: { item: PlaceData }) => (
        <TouchableOpacity
            style={styles.gridCard}
            onPress={() => handlePlacePress(item)}
            activeOpacity={0.9}
        >
            <View style={styles.cardImageContainer}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                />
                <View style={styles.categoryBadge}>
                    <Ionicons name={getCategoryIcon(item.category) as any} size={10} color="#fff" />
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.ratingBadgeText}>{item.rating}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.distanceContainer}>
                    <Ionicons name="location-sharp" size={12} color="#94A3B8" />
                    <Text style={styles.cardAddress} numberOfLines={1}>
                        {formatDistance(item.distance)} • {t('places.open')}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getQueueColor(item.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getQueueColor(item.status) }]} />
                    <Text style={[styles.statusText, { color: getQueueColor(item.status) }]}>
                        {getQueueLabel(item.status)}
                    </Text>
                </View>
                <TouchableOpacity style={styles.ctaButton} onPress={() => handlePlacePress(item)} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#6366F1', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaText}>{t('placesSection.viewDetails')}</Text>
                        <Ionicons name="arrow-forward" size={12} color="#fff" style={{ marginLeft: 4 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <View style={styles.searchBarWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={t('search.placeholder')}
                        onSubmitEditing={() => handleSearch(searchQuery)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isInputFocused && searchHistory.length > 0 && (
                <View style={styles.historyContainer}>
                    <Text style={styles.historyTitle}>{t('search.recentSearches').toUpperCase()}</Text>
                    <View style={styles.historyChips}>
                        {searchHistory.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.historyChip}
                                onPress={() => {
                                    setSearchQuery(item);
                                    handleSearch(item);
                                }}
                            >
                                <Ionicons name="time-outline" size={14} color="#6366F1" />
                                <Text style={styles.historyChipText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>{t('placesSection.fetching')}</Text>
                </View>
            ) : searchResults.length > 0 ? (
                <>
                    <Text style={styles.resultsCount}>
                        {searchResults.length} {t('search.placesFound')}
                    </Text>
                    <FlatList
                        data={searchResults}
                        renderItem={renderGridItem}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.gridContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            ) : (
                <View style={styles.centerContainer}>
                    <Ionicons name="search-outline" size={64} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>{t('places.noMatching')}</Text>
                    <Text style={styles.emptySubtitle}>{t('places.adjustFilters')}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => handleSearch(searchQuery)}>
                        <Text style={styles.retryBtnText}>{t('common.retry')}</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBarWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#0F172A',
        fontWeight: '500',
    },
    clearButton: {
        padding: 4,
    },
    resultsCount: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
    },
    gridContent: {
        padding: 20,
        paddingTop: 12,
    },
    row: {
        justifyContent: 'space-between',
    },
    gridCard: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardImageContainer: {
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: 120,
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    ratingBadgeText: {
        color: '#1a1a1a',
        fontSize: 10,
        fontWeight: '800',
        marginLeft: 3,
    },
    cardContent: {
        padding: 10,
    },
    cardName: {
        fontSize: 13,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    cardAddress: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    statusDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginRight: 5,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    ctaButton: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    ctaGradient: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    retryBtn: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    historyContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    historyChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    historyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    historyChipText: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '600',
    },
});
