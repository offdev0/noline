import { useLocation } from '@/context/LocationContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');


import { usePlaces } from '@/context/PlacesContext';

const CATEGORY_ICONS: Record<string, any> = {
    restaurant: 'restaurant',
    cafe: 'cafe',
    bar: 'beer',
    casino: 'cash',
    fun: 'happy',
    shopping: 'cart',
    default: 'location'
};

const CATEGORY_COLORS: Record<string, string> = {
    restaurant: '#F59E0B',
    casino: '#DC2626',
    fun: '#8B5CF6',
    shopping: '#6366F1',
    default: '#94A3B8'
};

export default function FullMapScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        searchQuery?: string;
        latitude?: string;
        longitude?: string;
    }>();
    const insets = useSafeAreaInsets();
    const { location, address, refreshLocation, loading: locationLoading } = useLocation();
    const { allPlaces, loading: placesLoading } = usePlaces();
    const mapRef = useRef<MapView>(null);
    const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
    const [searchedLocation, setSearchedLocation] = useState<{
        latitude: number;
        longitude: number;
        query: string;
    } | null>(null);

    // Animation for bottom sheet
    const slideAnim = useRef(new Animated.Value(0)).current;

    const defaultLocation = {
        latitude: 22.5726,
        longitude: 88.3639,
    };

    // Handle search params
    useEffect(() => {
        if (params.latitude && params.longitude && params.searchQuery) {
            const lat = parseFloat(params.latitude);
            const lng = parseFloat(params.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
                setSearchedLocation({
                    latitude: lat,
                    longitude: lng,
                    query: params.searchQuery,
                });

                // Animate to searched location after a short delay
                setTimeout(() => {
                    mapRef.current?.animateToRegion({
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }, 1000);
                }, 500);
            }
        }
    }, [params.latitude, params.longitude, params.searchQuery]);

    const initialRegion: Region = {
        latitude: params.latitude ? parseFloat(params.latitude) : (location?.latitude || defaultLocation.latitude),
        longitude: params.longitude ? parseFloat(params.longitude) : (location?.longitude || defaultLocation.longitude),
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'vacant': return '#22C55E';
            case 'medium': return '#F59E0B';
            case 'loaded': return '#EF4444';
            default: return '#22C55E';
        }
    };

    const handlePlaceSelect = (place: any) => {
        setSelectedPlace(place);

        // Animate to selected place
        mapRef.current?.animateToRegion({
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 500);

        // Show bottom sheet
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
    };

    const handleCloseBottomSheet = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setSelectedPlace(null));
    };

    const centerOnUser = () => {
        if (location) {
            mapRef.current?.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    };

    const centerOnSearch = () => {
        if (searchedLocation) {
            mapRef.current?.animateToRegion({
                latitude: searchedLocation.latitude,
                longitude: searchedLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    };

    const handleViewPlace = () => {
        if (selectedPlace) {
            router.push({
                pathname: '/place/[id]',
                params: { id: selectedPlace.id }
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Full Screen Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
            >
                {/* User Location Marker */}
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title="You are here"
                        description={address || 'Your current location'}
                        zIndex={10}
                    >
                        <View style={styles.userMarker}>
                            <LinearGradient
                                colors={['#6366F1', '#4F46E5']}
                                style={styles.userMarkerGradient}
                            >
                                <Ionicons name="person" size={16} color="#fff" />
                            </LinearGradient>
                        </View>
                    </Marker>
                )}

                {/* Real Nearby Places Markers */}
                {allPlaces.map((place) => {
                    const category = place.category?.toLowerCase() || 'default';
                    const iconName = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
                    const statusColor = getStatusColor(place.status);

                    return (
                        <Marker
                            key={place.id}
                            coordinate={{
                                latitude: place.location.latitude,
                                longitude: place.location.longitude,
                            }}
                            onPress={() => handlePlaceSelect(place)}
                        >
                            <View style={styles.placeMarker}>
                                <View style={[
                                    styles.placeMarkerInner,
                                    { backgroundColor: statusColor }
                                ]}>
                                    <Ionicons
                                        name={iconName}
                                        size={14}
                                        color="#fff"
                                    />
                                </View>
                            </View>
                        </Marker>
                    );
                })}

                {/* Searched Location Marker */}
                {searchedLocation && (
                    <Marker
                        coordinate={{
                            latitude: searchedLocation.latitude,
                            longitude: searchedLocation.longitude,
                        }}
                        title={searchedLocation.query}
                        description="Searched location"
                    >
                        <View style={styles.searchMarker}>
                            <View style={styles.searchMarkerInner}>
                                <Ionicons name="search" size={18} color="#fff" />
                            </View>
                            <View style={styles.searchMarkerPin} />
                        </View>
                    </Marker>
                )}
            </MapView>

            {/* Header Overlay */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.headerTitle}>
                    <Text style={styles.headerTitleText}>
                        {searchedLocation ? 'Search Results' : 'Explore Map'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {searchedLocation
                            ? `"${searchedLocation.query}"`
                            : `${allPlaces.length} real places nearby`
                        }
                    </Text>
                </View>

                {searchedLocation ? (
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={centerOnSearch}
                    >
                        <Ionicons name="navigate" size={22} color="#6366F1" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={refreshLocation}
                    >
                        <Ionicons name="refresh" size={22} color="#6366F1" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Location Info Card */}
            <View style={styles.locationCard}>
                <Ionicons
                    name={searchedLocation ? "search" : "location"}
                    size={20}
                    color="#6366F1"
                />
                <Text style={styles.locationText} numberOfLines={1}>
                    {searchedLocation
                        ? searchedLocation.query
                        : (address || 'Detecting location...')
                    }
                </Text>
                {searchedLocation && (
                    <TouchableOpacity
                        style={styles.clearSearchButton}
                        onPress={() => {
                            setSearchedLocation(null);
                            centerOnUser();
                        }}
                    >
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Center on User Button */}
            <TouchableOpacity
                style={[styles.centerButton, { bottom: selectedPlace ? 220 : 100 }]}
                onPress={centerOnUser}
            >
                <Ionicons name="locate" size={24} color="#6366F1" />
            </TouchableOpacity>

            {/* Selected Place Bottom Sheet */}
            {selectedPlace && (
                <Animated.View
                    style={[
                        styles.bottomSheet,
                        {
                            paddingBottom: insets.bottom + 16,
                            transform: [{
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [300, 0],
                                })
                            }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.sheetHandle}
                        onPress={handleCloseBottomSheet}
                    >
                        <View style={styles.handleBar} />
                    </TouchableOpacity>

                    <View style={styles.sheetContent}>
                        <View style={styles.placeInfo}>
                            <View style={[
                                styles.categoryBadge,
                                { backgroundColor: getStatusColor(selectedPlace.status) + '20' }
                            ]}>
                                <Text style={[
                                    styles.categoryText,
                                    { color: getStatusColor(selectedPlace.status) }
                                ]}>
                                    {selectedPlace.status.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.placeName}>{selectedPlace.name}</Text>
                            <Text style={styles.placeCategory}>{selectedPlace.category}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.viewButton}
                            onPress={handleViewPlace}
                        >
                            <LinearGradient
                                colors={['#6366F1', '#4F46E5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.viewButtonGradient}
                            >
                                <Text style={styles.viewButtonText}>View Details</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {/* Legend */}
            <View style={[styles.legend, { bottom: selectedPlace ? 240 : 120 }]}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                    <Text style={styles.legendText}>Short</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>Medium</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>Long</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width,
        height,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    refreshButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EEF0FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationCard: {
        position: 'absolute',
        top: 120,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    locationText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    centerButton: {
        position: 'absolute',
        right: 16,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    userMarker: {
        alignItems: 'center',
    },
    userMarkerGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#5356FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    placeMarker: {
        alignItems: 'center',
    },
    placeMarkerInner: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    sheetHandle: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
    },
    sheetContent: {
        paddingVertical: 16,
    },
    placeInfo: {
        marginBottom: 16,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    placeName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    placeCategory: {
        fontSize: 14,
        color: '#666',
    },
    viewButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    viewButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    legend: {
        position: 'absolute',
        left: 16,
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 4,
    },
    legendText: {
        fontSize: 11,
        color: '#666',
    },
    searchMarker: {
        alignItems: 'center',
    },
    searchMarkerInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 5,
    },
    searchMarkerPin: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FF6B6B',
        marginTop: -2,
    },
    clearSearchButton: {
        padding: 4,
    },
});
