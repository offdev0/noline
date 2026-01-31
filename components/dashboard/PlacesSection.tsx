import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // Two cards with spacing

// Type definition for place data
interface Place {
    id: string;
    name: string;
    rating: number;
    category: string;
    queueStatus: 'Short queue' | 'Medium queue' | 'Long queue';
    distance: string;
    image: string;
}

// Sample data with real images
const specialPlaces: Place[] = [
    {
        id: '1',
        name: 'Uniqlo Store',
        rating: 4.5,
        category: 'Fashion',
        queueStatus: 'Short queue',
        distance: '0.8 km',
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400'
    },
    {
        id: '2',
        name: 'Coffee House',
        rating: 4.2,
        category: 'Cafe',
        queueStatus: 'Short queue',
        distance: '1.2 km',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'
    },
    {
        id: '3',
        name: 'Uniqlo Store',
        rating: 4.5,
        category: 'Fashion',
        queueStatus: 'Short queue',
        distance: '0.8 km',
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400'
    },
    {
        id: '4',
        name: 'Coffee House',
        rating: 4.2,
        category: 'Cafe',
        queueStatus: 'Short queue',
        distance: '1.2 km',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'
    },
];

const hotPlaces: Place[] = [
    {
        id: '3',
        name: 'Tech Store',
        rating: 4.8,
        category: 'Electronics',
        queueStatus: 'Medium queue',
        distance: '2.5 km',
        image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400'
    },
    {
        id: '4',
        name: 'Food Court',
        rating: 4.0,
        category: 'Restaurant',
        queueStatus: 'Long queue',
        distance: '3.1 km',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'
    },
];

// Place Card Component
const PlaceCard = ({ place, onPress }: { place: Place; onPress: () => void }) => {
    const getQueueColor = (status: string) => {
        switch (status) {
            case 'Short queue': return '#22C55E';
            case 'Medium queue': return '#F59E0B';
            case 'Long queue': return '#EF4444';
            default: return '#22C55E';
        }
    };

    const getQueueBgColor = (status: string) => {
        switch (status) {
            case 'Short queue': return 'rgba(34, 197, 94, 0.15)';
            case 'Medium queue': return 'rgba(245, 158, 11, 0.15)';
            case 'Long queue': return 'rgba(239, 68, 68, 0.15)';
            default: return 'rgba(34, 197, 94, 0.15)';
        }
    };

    const handlePress = () => {
        console.log('Navigating to place:', place.id);
        onPress();
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            {/* Place Image with Overlay */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: place.image }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                {/* Category Badge */}
                <View style={styles.categoryBadge}>
                    <Ionicons
                        name={
                            place.category === 'Fashion' ? 'shirt-outline' :
                                place.category === 'Cafe' ? 'cafe-outline' :
                                    place.category === 'Electronics' ? 'phone-portrait-outline' :
                                        'restaurant-outline'
                        }
                        size={10}
                        color="#fff"
                    />
                    <Text style={styles.categoryBadgeText}>{place.category}</Text>
                </View>
                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FFD700" />
                    <Text style={styles.ratingBadgeText}>{place.rating}</Text>
                </View>
            </View>

            {/* Card Content */}
            <View style={styles.cardContent}>
                <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>

                {/* Queue Status Badge */}
                <View style={[styles.queueBadge, { backgroundColor: getQueueBgColor(place.queueStatus) }]}>
                    {/* <View style={[styles.queueDot, { backgroundColor: getQueueColor(place.queueStatus) }]} /> */}
                    <Text style={[styles.queueText, { color: getQueueColor(place.queueStatus) }]}>
                        {place.queueStatus}
                    </Text>
                    <Text style={styles.distanceBadgeText}>· {place.distance}</Text>
                </View>

                {/* CTA Button */}
                <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8} onPress={handlePress}>
                    <LinearGradient
                        colors={['#5356FF', '#3787FF']}
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

    const handlePlacePress = (placeId: string) => {
        console.log('handlePlacePress called with id:', placeId);
        router.push({
            pathname: '/place/[id]',
            params: { id: placeId }
        });
    };

    return (
        <View style={styles.container}>
            {/* Places with Special Atmosphere */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Places with a special atmosphere</Text>
                    <Text style={styles.emoji}> ✨</Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.cardsContainer}
                >
                    {specialPlaces.map((place) => (
                        <PlaceCard
                            key={place.id}
                            place={place}
                            onPress={() => handlePlacePress(place.id)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Extremely Hot Places */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Extremely hot places</Text>
                    <Text style={styles.emoji}> 🔥</Text>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.cardsContainer}
                >
                    {hotPlaces.map((place) => (
                        <PlaceCard
                            key={place.id}
                            place={place}
                            onPress={() => handlePlacePress(place.id)}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    emoji: {
        fontSize: 18,
    },
    cardsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 18,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: 110,
    },
    categoryBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 4,
    },
    ratingBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingBadgeText: {
        color: '#333',
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 3,
    },
    cardContent: {
        padding: 14,
    },
    cardName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    queueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 12,
    },
    queueDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    queueText: {
        fontSize: 11,
        fontWeight: '600',
    },
    distanceBadgeText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 2,
    },
    ctaButton: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#5356FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    ctaGradient: {
        flexDirection: 'row',
        paddingVertical: 11,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});

