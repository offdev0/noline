import { usePlaces } from '@/context/PlacesContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

interface PlaceProps {
    id: string;
    name: string;
    rating: number;
    category: string;
    queueStatus: string;
    distance: string;
    image: string;
}

const PlaceCard = ({ place, onPress }: { place: PlaceProps; onPress: () => void }) => {
    const getQueueColor = (status: string) => {
        if (status.includes('Short')) return '#22C55E';
        if (status.includes('Medium')) return '#F59E0B';
        return '#EF4444';
    };

    const getQueueBgColor = (status: string) => {
        if (status.includes('Short')) return 'rgba(34, 197, 94, 0.15)';
        if (status.includes('Medium')) return 'rgba(245, 158, 11, 0.15)';
        return 'rgba(239, 68, 68, 0.15)';
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
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: place.image }} style={styles.cardImage} resizeMode="cover" />
                <View style={styles.categoryBadge}>
                    <Ionicons name={getCategoryIcon(place.category) as any} size={10} color="#fff" />
                    <Text style={styles.categoryBadgeText}>{place.category}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.ratingBadgeText}>{place.rating}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>
                <View style={[styles.queueBadge, { backgroundColor: getQueueBgColor(place.queueStatus) }]}>
                    <Text style={[styles.queueText, { color: getQueueColor(place.queueStatus) }]}>{place.queueStatus}</Text>
                    <Text style={styles.distanceBadgeText}>· {place.distance}</Text>
                </View>

                <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8} onPress={onPress}>
                    <LinearGradient
                        colors={['#6366F1', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaText}>View details</Text>
                        <Ionicons name="arrow-forward" size={14} color="#fff" style={{ marginLeft: 4 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default function PlacesSection() {
    const router = useRouter();
    const {
        hotPlaces,
        restaurants,
        recommendedPlaces,
        vibePlaces,
        allPlaces,
        loading,
        recordPlaceClick
    } = usePlaces();

    const handlePlacePress = (id: string) => {
        const place = allPlaces.find(p => p.id === id);
        if (place) {
            recordPlaceClick(place);
        }
        router.push({ pathname: '/place/[id]', params: { id } });
    };

    const mapPlace = (p: any): PlaceProps => ({
        id: p.id,
        name: p.name,
        rating: p.rating,
        category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
        queueStatus: p.status === 'vacant' ? 'Short queue' : p.status === 'medium' ? 'Medium queue' : 'Long queue',
        distance: p.distance,
        image: p.image
    });

    if (loading && hotPlaces.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Fetching real-time spots...</Text>
            </View>
        );
    }

    const sections = [
        { title: 'Extremely hot places', emoji: '🔥', data: hotPlaces },
        { title: 'Top Restaurants', emoji: '🍕', data: restaurants },
        { title: 'Recommended to Discover', emoji: '✨', data: recommendedPlaces },
        { title: 'Places with a Special Vibe', emoji: '🎭', data: vibePlaces },
    ].filter(s => s.data && s.data.length > 0);

    return (
        <View style={styles.container}>
            {sections.map((section, idx) => (
                <View key={idx} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.emoji}>{section.emoji}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsContainer}>
                        {section.data.slice(0, 8).map((place) => (
                            <PlaceCard
                                key={place.id}
                                place={mapPlace(place)}
                                onPress={() => handlePlacePress(place.id)}
                            />
                        ))}
                    </ScrollView>
                </View>
            ))}
            {sections.length === 0 && !loading && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Search for a location to see local spots!</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 20 },
    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
    emoji: { fontSize: 18, marginLeft: 6 },
    cardsContainer: { paddingHorizontal: 20, paddingBottom: 8 },
    loadingContainer: { padding: 40, alignItems: 'center' },
    loadingText: { color: '#64748B', fontSize: 15, fontWeight: '500' },
    emptyContainer: { padding: 60, alignItems: 'center' },
    emptyText: { color: '#94A3B8', fontSize: 16, textAlign: 'center' },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 18,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    imageContainer: { position: 'relative' },
    cardImage: { width: '100%', height: 110 },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    categoryBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', marginLeft: 4, textTransform: 'uppercase' },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    ratingBadgeText: { color: '#1a1a1a', fontSize: 11, fontWeight: '800', marginLeft: 3 },
    cardContent: { padding: 12 },
    cardName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    queueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        marginBottom: 10,
    },
    queueText: { fontSize: 10, fontWeight: '800' },
    distanceBadgeText: { fontSize: 10, color: '#64748B', marginLeft: 2, fontWeight: '600' },
    ctaButton: { borderRadius: 12, overflow: 'hidden' },
    ctaGradient: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
    ctaText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
