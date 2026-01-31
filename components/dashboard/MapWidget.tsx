import { useLocation } from '@/context/LocationContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapWidget() {
    const router = useRouter();
    const { location, address, loading, error, refreshLocation, permissionStatus } = useLocation();

    // Default location (can be city center or any default)
    const defaultLocation = {
        latitude: 22.5726,  // Kolkata, India as default
        longitude: 88.3639,
    };

    const mapRegion = {
        latitude: location?.latitude || defaultLocation.latitude,
        longitude: location?.longitude || defaultLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    const handleOpenFullMap = () => {
        // Navigate to the full map/places screen
        router.push('/(tabs)/places');
    };

    return (
        <View style={styles.mapWidgetContainer}>
            <View style={styles.mapPreview}>
                {loading ? (
                    // Loading state
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5356FF" />
                        <Text style={styles.loadingText}>Getting your location...</Text>
                    </View>
                ) : error && !location ? (
                    // Error state (but no location)
                    <View style={styles.errorContainer}>
                        <Ionicons name="location-outline" size={48} color="#999" />
                        <Text style={styles.errorText}>Location unavailable</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
                            <Text style={styles.retryText}>Enable Location</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Map view
                    <>
                        <MapView
                            style={styles.map}
                            region={mapRegion}
                            showsUserLocation={true}
                            showsMyLocationButton={false}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            pitchEnabled={false}
                            rotateEnabled={false}
                        >
                            {location && (
                                <Marker
                                    coordinate={{
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                    }}
                                    title="You are here"
                                    description={address || 'Your current location'}
                                >
                                    <View style={styles.markerContainer}>
                                        <LinearGradient
                                            colors={['#5356FF', '#3787FF']}
                                            style={styles.markerGradient}
                                        >
                                            <Ionicons name="person" size={16} color="#fff" />
                                        </LinearGradient>
                                        <View style={styles.markerPulse} />
                                    </View>
                                </Marker>
                            )}
                        </MapView>

                        {/* Location Info Overlay */}
                        <View style={[styles.mapOverlayBox, { zIndex: 2 }]}>
                            <View style={styles.overlayHeader}>
                                <Ionicons name="location" size={20} color="#5356FF" />
                                <Text style={styles.overlayTitle}>Your Location</Text>
                            </View>
                            <Text style={styles.overlayText} numberOfLines={2}>
                                {address || 'Detecting location...'}
                            </Text>
                            {location && (
                                <TouchableOpacity
                                    style={styles.refreshButton}
                                    onPress={refreshLocation}
                                >
                                    <Ionicons name="refresh" size={14} color="#5356FF" />
                                    <Text style={styles.refreshText}>Refresh</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Open Full Map Button */}
                        <View style={styles.floatingMapButtonContainer}>
                            <TouchableOpacity
                                style={styles.openMapButton}
                                onPress={handleOpenFullMap}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#5356FF', '#3787FF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.openMapGradient}
                                >
                                    <Ionicons name="map-outline" size={20} color="white" style={{ marginRight: 8 }} />
                                    <Text style={styles.openMapText}>Open full map</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mapWidgetContainer: {
        marginHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
        padding: 8,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    mapPreview: {
        borderRadius: 16,
        height: 220,
        backgroundColor: '#f0f0f0',
        position: 'relative',
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#5356FF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    mapOverlayBox: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        backgroundColor: 'white',
        padding: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    overlayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    overlayTitle: {
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 6,
        color: '#333',
    },
    overlayText: {
        color: '#666',
        fontSize: 13,
        lineHeight: 18,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    refreshText: {
        fontSize: 12,
        color: '#5356FF',
        marginLeft: 4,
        fontWeight: '500',
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerGradient: {
        width: 32,
        height: 32,
        borderRadius: 16,
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
    markerPulse: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(83, 86, 255, 0.2)',
        top: -8,
    },
    floatingMapButtonContainer: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        zIndex: 10,
    },
    openMapButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#5356FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    openMapGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
    },
    openMapText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
