import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // Two cards with spacing

// Type definition for place data
interface Place {
    id: string;
    name: string;
    rating: number;
    category: string;
    queueStatus: 'Short queue' | 'Medium queue' | 'Long queue';
    peopleInQueue: number;
    imageColors: string[];
}

// Sample data
const specialPlaces: Place[] = [
    { id: '1', name: 'Uniqlo Store', rating: 4.5, category: 'Fashion', queueStatus: 'Short queue', peopleInQueue: 3, imageColors: ['#e8d5f0', '#c5b3e0'] },
    { id: '2', name: 'Coffee House', rating: 4.2, category: 'Cafe', queueStatus: 'Short queue', peopleInQueue: 1, imageColors: ['#d5e8f0', '#b3c5e0'] },
];

const hotPlaces: Place[] = [
    { id: '3', name: 'Tech Store', rating: 4.8, category: 'Electronics', queueStatus: 'Medium queue', peopleInQueue: 8, imageColors: ['#f0e8d5', '#e0c5b3'] },
    { id: '4', name: 'Food Court', rating: 4.0, category: 'Restaurant', queueStatus: 'Long queue', peopleInQueue: 15, imageColors: ['#d5f0e8', '#b3e0c5'] },
];

// Place Card Component
const PlaceCard = ({ place }: { place: Place }) => {
    const getQueueColor = (status: string) => {
        switch (status) {
            case 'Short queue': return '#22C55E';
            case 'Medium queue': return '#F59E0B';
            case 'Long queue': return '#EF4444';
            default: return '#22C55E';
        }
    };

    return (
        <View style={styles.card}>
            {/* Image Placeholder */}
            <LinearGradient
                colors={place.imageColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardImage}
            />

            {/* Card Content */}
            <View style={styles.cardContent}>
                <Text style={styles.cardName} numberOfLines={1}>{place.name}</Text>

                {/* Rating and Category Row */}
                <View style={styles.ratingRow}>
                    <Text style={styles.ratingText}>[{place.rating}]</Text>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.categoryText} numberOfLines={1}>[{place.category}]</Text>
                </View>

                {/* Queue Status Row */}
                <View style={styles.queueRow}>
                    <Text style={[styles.queueStatus, { color: getQueueColor(place.queueStatus) }]}>
                        {place.queueStatus}
                    </Text>
                    <View style={styles.peopleCount}>
                        <Text style={styles.peopleText}>[{place.peopleInQueue}]</Text>
                        <Ionicons name="person" size={12} color="#666" />
                    </View>
                </View>

                {/* CTA Button */}
                <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#5356FF', '#5A46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaText}>Let's find out</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function PlacesSection() {
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
                        <PlaceCard key={place.id} place={place} />
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
                        <PlaceCard key={place.id} place={place} />
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
        borderRadius: 16,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 100,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    cardContent: {
        padding: 12,
    },
    cardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginRight: 2,
    },
    categoryText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 8,
        flex: 1,
    },
    queueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    queueStatus: {
        fontSize: 13,
        fontWeight: '600',
    },
    peopleCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    peopleText: {
        fontSize: 12,
        color: '#666',
        marginRight: 2,
    },
    ctaButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    ctaGradient: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    ctaText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});
