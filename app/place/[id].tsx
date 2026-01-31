import ReportModal from '@/components/ReportModal';
import { useFavorites } from '@/context/FavoritesContext';
import { usePlaces } from '@/context/PlacesContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ImageBackground,
    Linking,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PlaceDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getPlaceById, allPlaces, loading: globalLoading } = usePlaces();
    const { toggleFavorite, isFavorite } = useFavorites();
    const [isReportVisible, setIsReportVisible] = useState(false);

    // Get dynamic data from context
    const place = useMemo(() => getPlaceById(id), [id, getPlaceById]);
    const isPlaceFavorite = useMemo(() => isFavorite(id || ''), [id, isFavorite]);

    // Derived coordinates
    const coordinates = {
        latitude: 22.5726,
        longitude: 88.3639,
    };

    if (globalLoading && !place) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#5356FF" />
                <Text style={styles.loaderText}>Loading venue details...</Text>
            </View>
        );
    }

    if (!place) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#64748B" />
                <Text style={styles.errorText}>Venue not found</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const getQueueColor = (status: string) => {
        if (status === 'vacant') return '#22C55E';
        if (status === 'medium') return '#F59E0B';
        return '#EF4444';
    };

    const handleMapNavigation = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${coordinates.latitude},${coordinates.longitude}`;
        const label = place.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        if (url) Linking.openURL(url);
    };

    const handleShare = async () => {
        if (!place) return;
        try {
            await Share.share({
                message: `Check out ${place.name} on NoLine!\n\n📍 Address: ${place.address}\n⭐ Rating: ${place.rating}/5\n🚦 Current Status: ${place.status}`,
                title: `Share ${place.name}`
            });
        } catch (error: any) {
            console.error('Error sharing:', error.message);
        }
    };

    const similarPlaces = allPlaces
        .filter(p => p.category === place.category && p.id !== place.id)
        .slice(0, 4);

    return (
        <View style={styles.container}>
            {/* Header Image */}
            <ImageBackground
                source={{ uri: place.image }}
                style={styles.headerImage}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.4)']}
                    style={styles.headerOverlay}
                >
                    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
                                    style={[styles.headerButton, isPlaceFavorite && { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}
                                    onPress={() => place && toggleFavorite(place)}
                                >
                                    <Ionicons
                                        name={isPlaceFavorite ? 'heart' : 'heart-outline'}
                                        size={24}
                                        color={isPlaceFavorite ? '#EF4444' : '#fff'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Status Badge */}
                        <View style={styles.statusBadgeContainer}>
                            <View style={styles.statusBadge}>
                                <View style={[styles.statusDot, { backgroundColor: getQueueColor(place.status) }]} />
                                <Text style={styles.statusText}>{place.status}</Text>
                            </View>
                            <Text style={styles.updatedText}>Updated just now</Text>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </ImageBackground>

            {/* Content */}
            <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
                <View style={styles.titleRow}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.ratingText}>{place.rating}</Text>
                    </View>
                </View>
                <View style={styles.accentDivider} />
                <Text style={styles.descriptionText}>{place.description}</Text>

                {/* Useful Information Section */}
                <Text style={styles.sectionTitle}>Useful information</Text>

                {/* Opening Hours */}
                <View style={styles.infoBox}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="time-outline" size={18} color="#5356FF" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>General Hours</Text>
                        <Text style={styles.infoValue}>Open now · Closes 10:00 PM</Text>
                    </View>
                </View>

                {/* Address */}
                <View style={styles.infoBox}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="location-outline" size={18} color="#5356FF" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel} numberOfLines={2}>{place.address}</Text>
                        <TouchableOpacity onPress={handleMapNavigation}>
                            <Text style={styles.infoLink}>Get Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.infoBox}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="pricetag-outline" size={18} color="#5356FF" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>{place.category.toUpperCase()}</Text>
                        <Text style={styles.infoValue}>Verified business category</Text>
                    </View>
                </View>

                {/* Mini Map */}
                <View style={styles.mapFrame}>
                    <MapView
                        style={styles.miniMap}
                        region={{
                            latitude: coordinates.latitude,
                            longitude: coordinates.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    >
                        <Marker coordinate={coordinates} />
                    </MapView>
                </View>

                {/* Similar Places */}
                {similarPlaces.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Similar businesses nearby</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.similarScroll}
                        >
                            {similarPlaces.map((sibling) => (
                                <TouchableOpacity
                                    key={sibling.id}
                                    style={styles.similarCard}
                                    onPress={() => router.push(`/place/${sibling.id}`)}
                                >
                                    <View style={styles.similarThumbnailBox}>
                                        <Image source={{ uri: sibling.image }} style={styles.similarThumb} />
                                    </View>
                                    <View style={styles.similarInfo}>
                                        <Text style={styles.similarName} numberOfLines={1}>{sibling.name}</Text>
                                        <View style={styles.similarMeta}>
                                            <Ionicons name="star" size={12} color="#FFD700" />
                                            <Text style={styles.similarRatingText}>{sibling.rating}</Text>
                                            <Text style={[styles.similarStatus, { color: getQueueColor(sibling.status) }]}>
                                                · {sibling.status}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => setIsReportVisible(true)}
            >
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fabGradient}
                >
                    <Ionicons name="flash" size={20} color="#FFD700" />
                    <Text style={styles.fabText}>Report Queue</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Report Modal Component */}
            <ReportModal
                isVisible={isReportVisible}
                onClose={() => setIsReportVisible(false)}
                place={place}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loaderText: { marginTop: 12, color: '#64748B', fontWeight: '600' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    errorText: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 16 },
    backBtn: { marginTop: 20, paddingHorizontal: 30, paddingVertical: 12, backgroundColor: '#5356FF', borderRadius: 12 },
    backBtnText: { color: '#fff', fontWeight: '700' },
    headerImage: { height: 320 },
    headerOverlay: { flex: 1 },
    safeArea: { flex: 1, justifyContent: 'space-between' },
    headerActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
    headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center' },
    headerRightActions: { flexDirection: 'row', gap: 12 },
    statusBadgeContainer: { alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 25 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    updatedText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 4, fontWeight: '600' },
    contentSection: { flex: 1, marginTop: -30, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 24, paddingTop: 30 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    placeName: { fontSize: 26, fontWeight: '800', color: '#0F172A', flex: 1, marginRight: 15 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
    ratingText: { marginLeft: 5, fontSize: 15, fontWeight: '800', color: '#0F172A' },
    accentDivider: { height: 4, width: 50, backgroundColor: '#F59E0B', borderRadius: 2, marginBottom: 20 },
    descriptionText: { fontSize: 16, color: '#475569', lineHeight: 26, marginBottom: 30, fontWeight: '500' },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
    infoBox: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
    iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    infoTextContainer: { flex: 1, marginLeft: 15 },
    infoLabel: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    infoValue: { fontSize: 14, color: '#64748B', marginTop: 3, fontWeight: '500' },
    infoLink: { fontSize: 14, color: '#4F46E5', marginTop: 5, fontWeight: '800' },
    mapFrame: { height: 160, borderRadius: 20, overflow: 'hidden', marginVertical: 25, borderWidth: 1, borderColor: '#F1F5F9' },
    miniMap: { flex: 1 },
    similarScroll: { marginHorizontal: -24, paddingHorizontal: 24 },
    similarCard: { width: 180, marginRight: 16, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#F1F5F9', padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    similarThumbnailBox: { width: '100%', height: 100, borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
    similarThumb: { width: '100%', height: '100%' },
    similarInfo: { paddingHorizontal: 2 },
    similarName: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 5 },
    similarMeta: { flexDirection: 'row', alignItems: 'center' },
    similarRatingText: { fontSize: 12, fontWeight: '800', marginLeft: 4, color: '#475569' },
    similarStatus: { fontSize: 12, fontWeight: '700', marginLeft: 4, textTransform: 'capitalize' },
    fabContainer: { position: 'absolute', bottom: 35, alignSelf: 'center', borderRadius: 30, overflow: 'hidden', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
    fabGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 35, paddingVertical: 18 },
    fabText: { color: '#fff', fontSize: 16, fontWeight: '800', marginLeft: 10 },
});
