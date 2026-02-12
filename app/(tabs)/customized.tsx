import { db } from '@/configs/firebaseConfig';
import { usePlaces } from '@/context/PlacesContext';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDocs, limit, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Sample itinerary data
const itineraryData = {
    title: 'Morning in the park',
    locations: [
        { icon: 'leaf', name: 'Sacher Garden' },
        { icon: 'cafe', name: 'cafe' },
        { icon: 'storefront', name: 'market' },
    ],
    duration: 'Between 60 minutes– to a whole day',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
};

// Sample hot tips
const hotTips = [
    {
        id: '1',
        icon: '🔥',
        title: 'Coffee without a queue',
        description: 'There is a vacancy at Café Nordoy now.',
        action: 'Check now',
    },
    {
        id: '2',
        icon: '⚡',
        title: 'Skip the lunch rush',
        description: 'Quick service at Bistro Central right now.',
        action: 'Check now',
    },
];

// Interface for search history items
interface RecentPlace {
    id: string;
    name: string;
    address: string;
    rating: number;
    image: string;
    searchedOn: Date;
}

export default function CustomizedScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { getPlaceById, allPlaces } = usePlaces();
    const [recentlyVisited, setRecentlyVisited] = useState<RecentPlace[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Fetch search history from Firebase
    const fetchSearchHistory = async () => {
        if (!user) {
            setLoadingHistory(false);
            return;
        }

        try {
            const userRef = doc(db, 'users', user.uid);
            const historyQuery = query(
                collection(db, 'SearchHistory'),
                where('searchedBy', '==', userRef),
                limit(50)
            );

            const snapshot = await getDocs(historyQuery);

            // Process everything in memory
            const places: RecentPlace[] = [];
            const seenPlaceIds = new Set<string>();

            const processedData = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as any))
                // Filter by user UID
                .filter(d => {
                    const uid = d.searchedBy?.id || d.searchedBy?.path?.split('/').pop();
                    return uid === user.uid && d.businessRef;
                })
                // Sort by time
                .sort((a, b) => (b.searchedOn?.seconds || 0) - (a.searchedOn?.seconds || 0));

            for (const data of processedData) {
                const businessRef = data.businessRef;
                const placeId = businessRef.id || businessRef.path?.split('/').pop();

                if (!placeId || seenPlaceIds.has(placeId)) continue;
                seenPlaceIds.add(placeId);

                const placeFromContext = getPlaceById(placeId);

                places.push({
                    id: placeId,
                    name: data.searchedString || 'Unknown Place',
                    address: data.searchedAddress || 'Address not available',
                    rating: placeFromContext?.rating || data.rating || 4.2,
                    image: placeFromContext?.image || data.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
                    searchedOn: data.searchedOn?.toDate() || new Date(),
                });

                if (places.length >= 10) break;
            }

            setRecentlyVisited(places);
        } catch (error) {
            console.error('Error fetching search history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchSearchHistory();
        }, [user])
    );

    const handleOpenRoute = () => {
        router.push('/map');
    };

    const handleNavigate = (placeId: string) => {
        router.push({
            pathname: '/place/[id]',
            params: { id: placeId }
        });
    };

    const handleTipPress = (tip: any) => {
        const description = tip.description.toLowerCase();
        const foundPlace = allPlaces.find(p => description.includes(p.name.toLowerCase()));

        if (foundPlace) {
            handleNavigate(foundPlace.id);
        } else {
            // Fallback: extract place name or search
            const match = tip.description.match(/at (.*?) (now|right now)/i);
            const searchName = match ? match[1] : tip.title;
            router.push({
                pathname: '/map',
                params: { search: searchName }
            });
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    {router.canGoBack() ? (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 24 }} />
                    )}
                </View>

                {/* Title */}
                <Text style={styles.pageTitle}>Your customized itinerary</Text>

                {/* Itinerary Card */}
                <View style={styles.itineraryCard}>
                    <ImageBackground
                        source={{ uri: itineraryData.image }}
                        style={styles.itineraryImage}
                        imageStyle={styles.itineraryImageStyle}
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
                            style={styles.itineraryGradient}
                        >
                            {/* Itinerary Title */}
                            <Text style={styles.itineraryTitle}>{itineraryData.title}</Text>

                            {/* Locations Row */}
                            <View style={styles.locationsRow}>
                                {itineraryData.locations.map((loc, index) => (
                                    <View key={index} style={styles.locationItem}>
                                        <Ionicons
                                            name={loc.icon as any}
                                            size={14}
                                            color="#fff"
                                        />
                                        <Text style={styles.locationText}>{loc.name}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Duration */}
                            <Text style={styles.durationText}>{itineraryData.duration}</Text>

                            {/* Open Route Button */}
                            <TouchableOpacity
                                style={styles.openRouteButton}
                                onPress={handleOpenRoute}
                            >
                                <Text style={styles.openRouteText}>Open a route</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </ImageBackground>
                </View>

                {/* Hot Tips Section */}
                <Text style={styles.sectionTitle}>Hot Tips</Text>

                {hotTips.map((tip) => (
                    <View key={tip.id} style={styles.hotTipCard}>
                        <View style={styles.hotTipIcon}>
                            <Text style={styles.hotTipEmoji}>{tip.icon}</Text>
                        </View>
                        <View style={styles.hotTipContent}>
                            <Text style={styles.hotTipTitle}>{tip.title}</Text>
                            <Text style={styles.hotTipDescription}>{tip.description}</Text>
                            <TouchableOpacity
                                style={styles.checkNowButton}
                                onPress={() => handleTipPress(tip)}
                            >
                                <Text style={styles.checkNowText}>{tip.action}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}



                {/* Recently Visited Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recently visited</Text>
                    {recentlyVisited.length > 0 && (
                        <TouchableOpacity>
                            <Text style={styles.showAllText}>Show all</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {loadingHistory ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#5356FF" />
                        <Text style={styles.loadingText}>Loading history...</Text>
                    </View>
                ) : recentlyVisited.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="location-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No places visited yet</Text>
                        <Text style={styles.emptySubtext}>Explore places and they'll appear here</Text>
                    </View>
                ) : (
                    recentlyVisited.map((place) => (
                        <View key={place.id} style={styles.recentCard}>
                            <Image
                                source={{ uri: place.image }}
                                style={styles.recentImage}
                            />
                            <View style={styles.recentContent}>
                                <Text style={styles.recentName} numberOfLines={1}>{place.name}</Text>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={14} color="#FFD700" />
                                    <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                                </View>
                                <View style={styles.availabilityRow}>
                                    <Ionicons name="location-outline" size={14} color="#666" />
                                    <Text style={styles.addressText} numberOfLines={1}>{place.address}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.navigateButton}
                                onPress={() => handleNavigate(place.id)}
                            >
                                <Text style={styles.navigateText}>View</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 16,
    },
    backButton: {
        padding: 4,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 24,
    },
    // Itinerary Card
    itineraryCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    itineraryImage: {
        width: '100%',
        height: 280,
    },
    itineraryImageStyle: {
        borderRadius: 20,
    },
    itineraryGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'flex-end',
    },
    itineraryTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    locationsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    locationText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 4,
    },
    durationText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        marginBottom: 16,
    },
    openRouteButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    openRouteText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 15,
    },
    // Section styles
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 26
    },
    showAllText: {
        color: '#5356FF',
        fontSize: 14,
        fontWeight: '500',
    },
    // Hot Tips
    hotTipCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8E8FF',
        shadowColor: '#5356FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    hotTipIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    hotTipEmoji: {
        fontSize: 20,
    },
    hotTipContent: {
        flex: 1,
    },
    hotTipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    hotTipDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    checkNowButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#5356FF',
    },
    checkNowText: {
        color: '#5356FF',
        fontWeight: '600',
        fontSize: 13,
    },
    // Accent Line
    accentLine: {
        marginVertical: 24,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    accentGradient: {
        flex: 1,
    },
    // Recently Visited
    recentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    recentImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    recentContent: {
        flex: 1,
        marginLeft: 14,
    },
    recentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 13,
        color: '#666',
    },
    availabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    availableText: {
        marginLeft: 4,
        fontSize: 13,
        color: '#22C55E',
        fontWeight: '500',
    },
    unavailableText: {
        marginLeft: 4,
        fontSize: 13,
        color: '#F59E0B',
        fontWeight: '500',
    },
    navigateButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    navigateText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    bottomSpacing: {
        height: 100,
    },
    // New styles for search history
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    emptySubtext: {
        marginTop: 4,
        fontSize: 13,
        color: '#999',
    },
    addressText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
});
