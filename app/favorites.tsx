import { useFavorites } from '@/context/FavoritesContext';
import { PlaceData } from '@/services/MapsService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function FavoritesScreen() {
    const router = useRouter();
    const { favorites } = useFavorites();

    const renderFavoriteCard = ({ item }: { item: PlaceData }) => {
        const getQueueColor = (status: string) => {
            if (status === 'vacant') return '#22C55E';
            if (status === 'medium') return '#F59E0B';
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

        const getQueueBgColor = (status: string) => {
            if (status === 'vacant') return 'rgba(34, 197, 94, 0.1)';
            if (status === 'medium') return 'rgba(245, 158, 11, 0.1)';
            return 'rgba(239, 68, 68, 0.1)';
        };

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/place/${item.id}`)}
                activeOpacity={0.9}
            >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.categoryBadge}>
                    <Ionicons name={getCategoryIcon(item.category) as any} size={10} color="#fff" />
                </View>

                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>

                    <View style={[styles.statusBadge, { backgroundColor: getQueueBgColor(item.status) }]}>
                        <View style={[styles.statusDot, { backgroundColor: getQueueColor(item.status) }]} />
                        <Text style={[styles.statusText, { color: getQueueColor(item.status) }]}>
                            {item.status === 'vacant' ? 'Short queue' : item.status === 'medium' ? 'Medium queue' : 'Long queue'}
                        </Text>
                    </View>
                    <Text style={styles.distanceText}>{item.distance}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favorite Places</Text>
                <View style={{ width: 40 }} />
            </View>

            {favorites.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="star-outline" size={48} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                    <Text style={styles.emptySubtitle}>Start exploring and save your favorite spots to see them here.</Text>
                    <TouchableOpacity
                        style={styles.exploreBtn}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <LinearGradient
                            colors={['#6366F1', '#4F46E5']}
                            style={styles.exploreGradient}
                        >
                            <Text style={styles.exploreBtnText}>Discover Places</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderFavoriteCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <View style={styles.listHeader}>
                            <Text style={styles.countText}>{favorites.length} saved places</Text>
                        </View>
                    )}
                />
            )}
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
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    listHeader: {
        marginBottom: 20,
    },
    countText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#F1F5F9',
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '800',
        marginLeft: 2,
        color: '#0F172A',
    },
    cardBody: {
        padding: 12,
    },
    placeName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#94A3B8',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
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
        fontSize: 10,
        fontWeight: '800',
    },
    distanceText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '600',
        marginTop: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    exploreBtn: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    exploreGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    exploreBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
