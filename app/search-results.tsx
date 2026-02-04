import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { usePlaces } from '@/context/PlacesContext';
import { PlaceData } from '@/services/MapsService';

const { width } = Dimensions.get('window');

export default function SearchResultsScreen() {
    const router = useRouter();
    const { query, lat, lon } = useLocalSearchParams();
    const { searchLocation, allPlaces, loading, recordPlaceClick } = usePlaces();
    const [results, setResults] = useState<PlaceData[]>([]);

    useEffect(() => {
        if (query) {
            handleSearch();
        }
    }, [query]);

    const handleSearch = async () => {
        await searchLocation(query as string);
    };

    const handlePlacePress = (place: PlaceData) => {
        recordPlaceClick(place);
        router.push({ pathname: '/place/[id]', params: { id: place.id } });
    };

    const renderPlaceItem = ({ item }: { item: PlaceData }) => {
        const getQueueColor = (status: string) => {
            if (status.includes('vacant')) return '#22C55E';
            if (status.includes('medium')) return '#F59E0B';
            return '#EF4444';
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
            if (c.includes('vibe') || c.includes('special')) return 'sparkles';
            return 'location';
        };

        return (
            <TouchableOpacity
                style={styles.resultCard}
                onPress={() => handlePlacePress(item)}
                activeOpacity={0.9}
            >
                <Image source={{ uri: item.image }} style={styles.resultImage} />
                <View style={styles.resultInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                        <Ionicons name={getCategoryIcon(item.category) as any} size={14} color="#6366F1" />
                    </View>
                    <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>

                    <View style={styles.badgeRow}>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getQueueColor(item.status) + '20' }]}>
                            <View style={[styles.statusDot, { backgroundColor: getQueueColor(item.status) }]} />
                            <Text style={[styles.statusText, { color: getQueueColor(item.status) }]}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Text>
                        </View>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Search Results</Text>
                    <Text style={styles.headerSubtitle}>"{query}"</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Searching for places...</Text>
                </View>
            ) : allPlaces.length > 0 ? (
                <FlatList
                    data={allPlaces}
                    renderItem={renderPlaceItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Ionicons name="search-outline" size={64} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>No places found</Text>
                    <Text style={styles.emptySubtitle}>Try searching for a different location or place name.</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={handleSearch}>
                        <Text style={styles.retryBtnText}>Retry Search</Text>
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
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    listContent: {
        padding: 20,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    resultImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
    },
    resultInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    resultName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    resultAddress: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 10,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#92400E',
        marginLeft: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
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
});
