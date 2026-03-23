import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { usePlaces } from '@/context/PlacesContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


const CATEGORY_ICONS: Record<string, any> = {
    restaurant: 'restaurant',
    cafe: 'cafe',
    bar: 'beer',
    casino: 'cash',
    fun: 'happy',
    shopping: 'cart',
    default: 'location'
};

const CATEGORY_COLORS: Record<string, string[]> = {
    restaurant: ['#F59E0B', '#D97706'],
    casino: ['#DC2626', '#B91C1C'],
    fun: ['#8B5CF6', '#7C3AED'],
    shopping: ['#6366F1', '#4F46E5'],
    default: ['#94A3B8', '#64748B']
};

export default function MapWidget() {
    const router = useRouter();
    const { language } = useLanguage();
    const { location, address: userAddress, refreshLocation, loading, error } = useLocation();
    const { allPlaces, currentSearchCenter, currentSearchName, resetSearch } = usePlaces();
    const [trackViewChanges, setTrackViewChanges] = useState(true);

    // Default location (Tel Aviv, Israel)
    const defaultLocation = {
        latitude: 32.0853,
        longitude: 34.7818,
    };

    // Determine target location (Search takes priority over current location)
    const targetLatitude = currentSearchCenter?.latitude || location?.latitude || defaultLocation.latitude;
    const targetLongitude = currentSearchCenter?.longitude || location?.longitude || defaultLocation.longitude;

    const mapRegion = {
        latitude: targetLatitude,
        longitude: targetLongitude,
        latitudeDelta: 0.1, // Slightly broader view for fallback
        longitudeDelta: 0.1,
    };

    const displayAddress = currentSearchName || userAddress || (location ? t('map.currentLocation') : t('map.israelGeneral'));

    const handleRefresh = async () => {
        resetSearch();
        await refreshLocation();
    };

    const handleOpenFullMap = () => {
        // Navigate to the full-screen map modal with coordinates
        router.push({
            pathname: '/map',
            params: {
                latitude: targetLatitude.toString(),
                longitude: targetLongitude.toString(),
                searchQuery: currentSearchName || ''
            }
        });
    };

    useEffect(() => {
        setTrackViewChanges(true);
        const timer = setTimeout(() => setTrackViewChanges(false), 500);
        return () => clearTimeout(timer);
    }, [
        allPlaces.length,
        location?.latitude,
        location?.longitude,
        currentSearchCenter?.latitude,
        currentSearchCenter?.longitude,
    ]);

    return (
        <View style={styles.mapWidgetContainer}>
            <View style={styles.mapPreview}>
                {loading && allPlaces.length === 0 ? (
                    // Loading state
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5356FF" />
                        <Text style={styles.loadingText}>{t('map.gettingLocation')}</Text>
                    </View>
                ) : (
                    // Show map if we have location OR places (fallback)
                    <>
                        <View
                            style={styles.mapOverlayBox}
                        >
                            <View style={styles.overlayContent}>
                                <View style={styles.overlayLeft}>
                                    <View style={styles.overlayHeader}>
                                        <Ionicons name="location" size={20} color="#6366F1" />
                                        <Text style={styles.overlayTitle}>{t('map.targetLocation')}</Text>
                                    </View>
                                    <Text style={styles.overlayText} numberOfLines={2}>
                                        {displayAddress}
                                    </Text>
                                </View>

                                {location && (
                                    <TouchableOpacity
                                        style={styles.refreshButtonBox}
                                        onPress={handleRefresh}
                                        disabled={loading}
                                    >
                                        <LinearGradient
                                            colors={['#6366F1', '#4F46E5']}
                                            style={styles.refreshIconCircle}
                                        >
                                            <Ionicons name="refresh" size={16} color="#fff" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={styles.openMapButton}
                                    onPress={handleOpenFullMap}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#6366F1', '#4F46E5']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.openMapGradient}
                                    >
                                        <Ionicons name="map-outline" size={20} color="white" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>


                        {/* Location Info Overlay with Glassmorphism */}

                        {/* Open Full Map Button */}
                        <View style={styles.floatingMapButtonContainer}>

                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mapWidgetContainer: {

    },
    mapPreview: {
        height: 80,
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 30
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
        left: 12,
        right: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 1)',
        elevation: 2,
    },
    overlayContent: {
        flexDirection: 'row',
        padding: 14,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
    },
    overlayLeft: {
        flex: 1,
        marginRight: 12,
    },
    overlayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    overlayTitle: {
        fontWeight: '800',
        fontSize: 15,
        marginLeft: 6,
        color: '#1E293B',
    },
    overlayText: {
        color: '#64748B',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    refreshButtonBox: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userMarkerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    userMarkerGradient: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    userMarkerPulse: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        zIndex: -1,
    },
    venueMarkerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    venueMarkerGradient: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    floatingMapButtonContainer: {
        position: 'absolute',
        bottom: 14,
        right: 14,
        zIndex: 10,
    },
    openMapButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#5356FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    openMapGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
