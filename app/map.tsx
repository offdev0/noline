import { useLocation } from '@/context/LocationContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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

// Sample nearby places data
const nearbyPlaces = [
    { id: '1', name: 'Uniqlo Store', latitude: 22.5746, longitude: 88.3659, category: 'Fashion', queueStatus: 'Short queue' },
    { id: '2', name: 'Coffee House', latitude: 22.5706, longitude: 88.3619, category: 'Cafe', queueStatus: 'Short queue' },
    { id: '3', name: 'Tech Store', latitude: 22.5766, longitude: 88.3679, category: 'Electronics', queueStatus: 'Medium queue' },
    { id: '4', name: 'Food Court', latitude: 22.5686, longitude: 88.3599, category: 'Restaurant', queueStatus: 'Long queue' },
];

export default function FullMapScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { location, address, refreshLocation, loading } = useLocation();
    const mapRef = useRef<MapView>(null);
    const [selectedPlace, setSelectedPlace] = useState<typeof nearbyPlaces[0] | null>(null);

    // Animation for bottom sheet
    const slideAnim = useRef(new Animated.Value(0)).current;

    const defaultLocation = {
        latitude: 22.5726,
        longitude: 88.3639,
    };

    const initialRegion: Region = {
        latitude: location?.latitude || defaultLocation.latitude,
        longitude: location?.longitude || defaultLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

    const getQueueColor = (status: string) => {
        switch (status) {
            case 'Short queue': return '#22C55E';
            case 'Medium queue': return '#F59E0B';
            case 'Long queue': return '#EF4444';
            default: return '#22C55E';
        }
    };

    const handlePlaceSelect = (place: typeof nearbyPlaces[0]) => {
        setSelectedPlace(place);

        // Animate to selected place
        mapRef.current?.animateToRegion({
            latitude: place.latitude,
            longitude: place.longitude,
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
                    >
                        <View style={styles.userMarker}>
                            <LinearGradient
                                colors={['#5356FF', '#3787FF']}
                                style={styles.userMarkerGradient}
                            >
                                <Ionicons name="person" size={16} color="#fff" />
                            </LinearGradient>
                        </View>
                    </Marker>
                )}

                {/* Nearby Places Markers */}
                {nearbyPlaces.map((place) => (
                    <Marker
                        key={place.id}
                        coordinate={{
                            latitude: place.latitude,
                            longitude: place.longitude,
                        }}
                        onPress={() => handlePlaceSelect(place)}
                    >
                        <View style={styles.placeMarker}>
                            <View style={[
                                styles.placeMarkerInner,
                                { backgroundColor: getQueueColor(place.queueStatus) }
                            ]}>
                                <Ionicons
                                    name={place.category === 'Cafe' ? 'cafe' :
                                        place.category === 'Fashion' ? 'shirt' :
                                            place.category === 'Electronics' ? 'phone-portrait' : 'restaurant'}
                                    size={14}
                                    color="#fff"
                                />
                            </View>
                        </View>
                    </Marker>
                ))}
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
                    <Text style={styles.headerTitleText}>Explore Map</Text>
                    <Text style={styles.headerSubtitle}>{nearbyPlaces.length} places nearby</Text>
                </View>

                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={refreshLocation}
                >
                    <Ionicons name="refresh" size={22} color="#5356FF" />
                </TouchableOpacity>
            </View>

            {/* Location Info Card */}
            <View style={styles.locationCard}>
                <Ionicons name="location" size={20} color="#5356FF" />
                <Text style={styles.locationText} numberOfLines={1}>
                    {address || 'Detecting location...'}
                </Text>
            </View>

            {/* Center on User Button */}
            <TouchableOpacity
                style={[styles.centerButton, { bottom: selectedPlace ? 220 : 100 }]}
                onPress={centerOnUser}
            >
                <Ionicons name="locate" size={24} color="#5356FF" />
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
                                    outputRange: [200, 0],
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
                                { backgroundColor: getQueueColor(selectedPlace.queueStatus) + '20' }
                            ]}>
                                <Text style={[
                                    styles.categoryText,
                                    { color: getQueueColor(selectedPlace.queueStatus) }
                                ]}>
                                    {selectedPlace.queueStatus}
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
                                colors={['#5356FF', '#3787FF']}
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
});
