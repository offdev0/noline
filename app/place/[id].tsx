import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock place data - in a real app, this would come from API/Firebase
const placesData: Record<string, any> = {
    '1': {
        id: '1',
        name: 'Uniqlo Store',
        description: 'Premium fashion retail store with minimalist Japanese aesthetics',
        rating: 4.5,
        category: 'Fashion',
        queueStatus: 'Short queue',
        peopleInQueue: 3,
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
        address: '123 Main Street, Downtown',
        phone: '+1 234 567 8900',
        openingHours: 'Monday - Sunday [10AM]-[9PM]',
        coordinates: { latitude: 37.78825, longitude: -122.4324 },
        reviews: [
            { id: 'r1', reviewerName: 'John D.', rating: 5, review: 'Great selection and no wait time!' },
            { id: 'r2', reviewerName: 'Sarah M.', rating: 4, review: 'Love the clothes, quick service' },
            { id: 'r3', reviewerName: 'Mike R.', rating: 4, review: 'Clean store, friendly staff' },
        ],
        similarPlaces: [
            { id: '5', name: 'Zara', rating: 4.3, queueStatus: 'Short queue' },
            { id: '6', name: 'H&M', rating: 4.1, queueStatus: 'Short queue' },
        ]
    },
    '2': {
        id: '2',
        name: 'Coffee House',
        description: 'Cozy cafe with artisan coffee and fresh pastries',
        rating: 4.2,
        category: 'Cafe',
        queueStatus: 'Short queue',
        peopleInQueue: 1,
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        address: '456 Oak Avenue, Midtown',
        phone: '+1 234 567 8901',
        openingHours: 'Monday - Sunday [7AM]-[8PM]',
        coordinates: { latitude: 37.78925, longitude: -122.4334 },
        reviews: [
            { id: 'r4', reviewerName: 'Emma L.', rating: 5, review: 'Best espresso in town!' },
            { id: 'r5', reviewerName: 'David K.', rating: 4, review: 'Great atmosphere for working' },
        ],
        similarPlaces: [
            { id: '7', name: 'Starbucks', rating: 4.0, queueStatus: 'Medium queue' },
            { id: '8', name: 'Blue Bottle', rating: 4.4, queueStatus: 'Short queue' },
        ]
    },
    '3': {
        id: '3',
        name: 'Tech Store',
        description: 'Latest electronics and gadgets with expert staff',
        rating: 4.8,
        category: 'Electronics',
        queueStatus: 'Medium queue',
        peopleInQueue: 8,
        image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
        address: '789 Tech Boulevard',
        phone: '+1 234 567 8902',
        openingHours: 'Monday - Sunday [9AM]-[10PM]',
        coordinates: { latitude: 37.79025, longitude: -122.4344 },
        reviews: [
            { id: 'r6', reviewerName: 'Alex P.', rating: 5, review: 'Amazing products and knowledgeable staff' },
            { id: 'r7', reviewerName: 'Lisa T.', rating: 5, review: 'Worth the wait, great deals!' },
        ],
        similarPlaces: [
            { id: '9', name: 'Best Buy', rating: 4.2, queueStatus: 'Medium queue' },
            { id: '10', name: 'Apple Store', rating: 4.6, queueStatus: 'Long queue' },
        ]
    },
    '4': {
        id: '4',
        name: 'Food Court',
        description: 'Diverse food options under one roof',
        rating: 4.0,
        category: 'Restaurant',
        queueStatus: 'Long queue',
        peopleInQueue: 15,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        address: '321 Food Plaza',
        phone: '+1 234 567 8903',
        openingHours: 'Monday - Sunday [11AM]-[10PM]',
        coordinates: { latitude: 37.79125, longitude: -122.4354 },
        reviews: [
            { id: 'r8', reviewerName: 'Tom B.', rating: 4, review: 'Great variety of cuisines' },
            { id: 'r9', reviewerName: 'Nina C.', rating: 3, review: 'Can get crowded but food is good' },
        ],
        similarPlaces: [
            { id: '11', name: 'Chipotle', rating: 4.1, queueStatus: 'Medium queue' },
            { id: '12', name: 'Panda Express', rating: 3.9, queueStatus: 'Short queue' },
        ]
    }
};

export default function PlaceDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [isFavorite, setIsFavorite] = useState(false);

    const place = placesData[id || '1'] || placesData['1'];

    const getQueueColor = (status: string) => {
        switch (status) {
            case 'Short queue': return '#22C55E';
            case 'Medium queue': return '#F59E0B';
            case 'Long queue': return '#EF4444';
            default: return '#22C55E';
        }
    };

    const getStatusDot = (status: string) => {
        const color = status === 'vacant' ? '#22C55E' : '#F59E0B';
        return <View style={[styles.statusDot, { backgroundColor: color }]} />;
    };

    const handleMapNavigation = () => {
        const { latitude, longitude } = place.coordinates;
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${latitude},${longitude}`;
        const label = place.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        if (url) Linking.openURL(url);
    };

    const handleCall = () => {
        Linking.openURL(`tel:${place.phone}`);
    };

    const handleShare = () => {
        // Share functionality
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                />
            );
        }
        return stars;
    };

    return (
        <View style={styles.container}>
            {/* Header Image */}
            <ImageBackground
                source={{ uri: place.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' }}
                style={styles.headerImage}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.3)']}
                    style={styles.headerOverlay}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>

                            <View style={styles.headerRightActions}>
                                <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                                    <Ionicons name="share-outline" size={24} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.headerButton, styles.favoriteButton]}
                                    onPress={() => setIsFavorite(!isFavorite)}
                                >
                                    <Ionicons
                                        name={isFavorite ? 'heart' : 'heart-outline'}
                                        size={24}
                                        color={isFavorite ? '#EF4444' : '#fff'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Status Badge */}
                        <View style={styles.statusBadgeContainer}>
                            <View style={styles.statusBadge}>
                                {getStatusDot('vacant')}
                                <Text style={styles.statusText}>vacant</Text>
                            </View>
                            <Text style={styles.updatedText}>Updated [1]</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </ImageBackground>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Name and Description */}
                <Text style={styles.placeName}>{place.name}</Text>
                <View style={styles.divider} />
                <Text style={styles.description}>{place.description}</Text>

                {/* Useful Information Section */}
                <Text style={styles.sectionTitle}>Useful information</Text>

                {/* Opening Hours */}
                <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                        <Ionicons name="time-outline" size={20} color="#5356FF" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Open now</Text>
                        <Text style={styles.infoValue}>{place.openingHours}</Text>
                    </View>
                </View>

                {/* Address */}
                <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                        <Ionicons name="location-outline" size={20} color="#5356FF" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>{place.address}</Text>
                        <TouchableOpacity onPress={handleMapNavigation}>
                            <Text style={styles.infoLink}>Map navigation</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Phone */}
                <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                        <Ionicons name="call-outline" size={20} color="#5356FF" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>[phone]</Text>
                        <TouchableOpacity onPress={handleCall}>
                            <Text style={styles.infoLink}>Call now</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Mini Map */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: place.coordinates.latitude,
                            longitude: place.coordinates.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    >
                        <Marker
                            coordinate={place.coordinates}
                            title={place.name}
                        />
                    </MapView>
                </View>

                {/* Reviews Section */}
                <View style={styles.reviewsHeader}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                    <TouchableOpacity style={styles.addReviewButton}>
                        <Text style={styles.addReviewText}>+ Add review</Text>
                    </TouchableOpacity>
                </View>

                {place.reviews.map((review: any) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewerName}>[{review.reviewerName}]</Text>
                            <View style={styles.reviewStars}>
                                {renderStars(review.rating)}
                            </View>
                        </View>
                        <Text style={styles.reviewText}>[{review.review}]</Text>
                    </View>
                ))}

                {/* Similar Places Section */}
                <Text style={styles.sectionTitle}>Similar businesses in the area</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.similarContainer}
                >
                    {place.similarPlaces.map((similar: any) => (
                        <TouchableOpacity
                            key={similar.id}
                            style={styles.similarCard}
                            onPress={() => router.push(`/place/${similar.id}`)}
                        >
                            <LinearGradient
                                colors={['#e8e8e8', '#d0d0d0']}
                                style={styles.similarImage}
                            />
                            <Text style={styles.similarName}>[{similar.name}]</Text>
                            <View style={styles.similarRating}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.similarRatingText}>[{similar.rating}]</Text>
                            </View>
                            <Text style={[styles.similarQueue, { color: getQueueColor(similar.queueStatus) }]}>
                                {similar.queueStatus}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Report Button */}
            <TouchableOpacity style={styles.reportButton}>
                <LinearGradient
                    colors={['#5356FF', '#3787FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.reportGradient}
                >
                    <Ionicons name="flash" size={20} color="#FFD700" />
                    <Text style={styles.reportText}>Report now</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerImage: {
        height: 280,
    },
    headerOverlay: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
    },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRightActions: {
        flexDirection: 'row',
        gap: 12,
    },
    favoriteButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    statusBadgeContainer: {
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    updatedText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 4,
    },
    content: {
        flex: 1,
        marginTop: -20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    placeName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E40AF',
        marginBottom: 8,
    },
    divider: {
        height: 3,
        backgroundColor: '#FFD700',
        width: 60,
        borderRadius: 2,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 16,
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    infoIconContainer: {
        width: 32,
        alignItems: 'center',
        marginTop: 2,
    },
    infoContent: {
        flex: 1,
        marginLeft: 8,
    },
    infoLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    infoValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    infoLink: {
        fontSize: 14,
        color: '#1E40AF',
        marginTop: 4,
    },
    mapContainer: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 16,
    },
    map: {
        flex: 1,
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    addReviewButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#5356FF',
    },
    addReviewText: {
        fontSize: 14,
        color: '#5356FF',
        fontWeight: '500',
    },
    reviewCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    reviewStars: {
        flexDirection: 'row',
    },
    reviewText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    similarContainer: {
        marginBottom: 16,
    },
    similarCard: {
        width: (width - 60) / 2,
        marginRight: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    similarImage: {
        height: 100,
        width: '100%',
    },
    similarName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        padding: 12,
        paddingBottom: 4,
    },
    similarRating: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    similarRatingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    similarQueue: {
        fontSize: 13,
        fontWeight: '500',
        padding: 12,
        paddingTop: 4,
    },
    reportButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#5356FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    reportGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    reportText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
