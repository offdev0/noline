import { db } from '@/configs/firebaseConfig';
import { usePlaces } from '@/context/PlacesContext';
import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDocs, limit, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ROUTE_TYPES = [
    { id: 'leisure', icon: 'sunny', label: 'leisure', categories: ['mustVisit', 'fun', 'vibe'] },
    { id: 'food', icon: 'restaurant', label: 'food', categories: ['restaurant', 'cafe'] },
    { id: 'culture', icon: 'camera', label: 'culture', categories: ['mustVisit'] },
    { id: 'adventure', icon: 'flash', label: 'adventure', categories: ['casino', 'fun', 'mustVisit'] },
];

const DURATIONS = [
    { id: '30min', labelKey: 'mins30', stopCount: 1 },
    { id: '1h', labelKey: 'hour1', stopCount: 2 },
    { id: '2h', labelKey: 'hours2', stopCount: 3 },
    { id: 'half', labelKey: 'halfDay', stopCount: 4 },
    { id: 'full', labelKey: 'fullDay', stopCount: 6 },
];

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

    const [selectedRouteType, setSelectedRouteType] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
    const [routeStops, setRouteStops] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchSearchHistory = async () => {
        if (!user) { setLoadingHistory(false); return; }
        try {
            const userRef = doc(db, 'users', user.uid);
            const historyQuery = query(
                collection(db, 'SearchHistory'),
                where('searchedBy', '==', userRef),
                limit(50)
            );
            const snapshot = await getDocs(historyQuery);
            const places: RecentPlace[] = [];
            const seenPlaceIds = new Set<string>();
            const processedData = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as any))
                .filter(d => {
                    const uid = d.searchedBy?.id || d.searchedBy?.path?.split('/').pop();
                    return uid === user.uid && d.businessRef;
                })
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

    useFocusEffect(useCallback(() => { fetchSearchHistory(); }, [user]));

    const generateRoute = () => {
        if (!selectedRouteType || !selectedDuration) return;
        setIsGenerating(true);

        const typeConfig = ROUTE_TYPES.find(r => r.id === selectedRouteType);
        const durConfig = DURATIONS.find(d => d.id === selectedDuration);
        if (!typeConfig || !durConfig) { setIsGenerating(false); return; }

        const eligible = allPlaces.filter(p => typeConfig.categories.includes(p.category));
        const pool = eligible.length >= durConfig.stopCount ? eligible : allPlaces;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);

        setTimeout(() => {
            setRouteStops(shuffled.slice(0, durConfig.stopCount));
            setIsGenerating(false);
        }, 1200);
    };

    const handleOpenInMaps = () => {
        if (routeStops.length === 0) return;
        const waypoints = routeStops
            .filter(p => p.location?.latitude && p.location?.longitude)
            .map(p => `${p.location.latitude},${p.location.longitude}`)
            .join('/');
        const url = `https://www.google.com/maps/dir/${waypoints}`;
        Linking.openURL(url);
    };

    const handleNewRoute = () => {
        setRouteStops([]);
        setSelectedRouteType(null);
        setSelectedDuration(null);
    };

    const handleNavigate = (placeId: string) => {
        router.push({ pathname: '/place/[id]', params: { id: placeId } });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <Text style={styles.pageTitle}>{t('route.planTitle')}</Text>
                <Text style={styles.pageSubtitle}>{t('route.planSubtitle')}</Text>

                {/* Route Planner Card */}
                <View style={styles.plannerCard}>
                    {/* Route Type Section */}
                    <Text style={styles.sectionLabel}>{t('route.routeType')}</Text>
                    <View style={styles.typeRow}>
                        {ROUTE_TYPES.map(type => {
                            const isSelected = selectedRouteType === type.id;
                            return (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                                    onPress={() => setSelectedRouteType(type.id)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.typeIconCircle, isSelected && styles.typeIconCircleSelected]}>
                                        <Ionicons
                                            name={type.icon as any}
                                            size={18}
                                            color={isSelected ? '#fff' : '#6366F1'}
                                        />
                                    </View>
                                    <Text style={[styles.typeChipText, isSelected && styles.typeChipTextSelected]}>
                                        {t(`route.${type.label}`)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Duration Section */}
                    <Text style={styles.sectionLabel}>{t('route.duration')}</Text>
                    <View style={styles.durationRow}>
                        {DURATIONS.map(dur => {
                            const isSelected = selectedDuration === dur.id;
                            return (
                                <TouchableOpacity
                                    key={dur.id}
                                    style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                                    onPress={() => setSelectedDuration(dur.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.durationChipText, isSelected && styles.durationChipTextSelected]}>
                                        {t(`route.${dur.labelKey}`)}
                                    </Text>
                                    <Text style={[styles.durationStopText, isSelected && { color: 'rgba(255,255,255,0.7)' }]}>
                                        {dur.stopCount} {t('route.stop')}
                                        {dur.stopCount > 1 ? 's' : ''}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Generate Button */}
                    <TouchableOpacity
                        style={[
                            styles.generateBtn,
                            (!selectedRouteType || !selectedDuration) && styles.generateBtnDisabled,
                        ]}
                        onPress={generateRoute}
                        disabled={!selectedRouteType || !selectedDuration || isGenerating}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={
                                selectedRouteType && selectedDuration
                                    ? ['#6366F1', '#4F46E5']
                                    : ['#CBD5E1', '#94A3B8']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.generateGradient}
                        >
                            {isGenerating ? (
                                <>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.generateBtnText}>{t('route.generating')}</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="sparkles" size={18} color="#fff" />
                                    <Text style={styles.generateBtnText}>{t('route.generateRoute')}</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Route Results */}
                {routeStops.length > 0 && (
                    <View style={styles.routeResultSection}>
                        <LinearGradient colors={['#4F46E5', '#6366F1']} style={styles.routeResultBanner}>
                            <Ionicons name="checkmark-circle" size={28} color="#fff" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.routeResultTitle}>
                                    {t('route.stopCount', { count: routeStops.length })}
                                </Text>
                                <Text style={styles.routeResultSub}>
                                    {ROUTE_TYPES.find(r => r.id === selectedRouteType)
                                        ? t(`route.${ROUTE_TYPES.find(r => r.id === selectedRouteType)!.label}`)
                                        : ''}{' '}
                                    · {DURATIONS.find(d => d.id === selectedDuration)
                                        ? t(`route.${DURATIONS.find(d => d.id === selectedDuration)!.labelKey}`)
                                        : ''}
                                </Text>
                            </View>
                        </LinearGradient>

                        {routeStops.map((place, index) => (
                            <TouchableOpacity
                                key={place.id}
                                style={styles.stopCard}
                                onPress={() => handleNavigate(place.id)}
                                activeOpacity={0.9}
                            >
                                <View style={styles.stopNumberBadge}>
                                    <Text style={styles.stopNumber}>{index + 1}</Text>
                                </View>
                                {index < routeStops.length - 1 && <View style={styles.stopConnector} />}
                                <Image
                                    source={{ uri: place.image }}
                                    style={styles.stopImage}
                                    contentFit="cover"
                                    cachePolicy="memory-disk"
                                    transition={200}
                                />
                                <View style={styles.stopInfo}>
                                    <Text style={styles.stopLabel}>
                                        {t('route.stop')} {index + 1}
                                    </Text>
                                    <Text style={styles.stopName} numberOfLines={1}>{place.name}</Text>
                                    <Text style={styles.stopAddress} numberOfLines={1}>{place.address}</Text>
                                    <View style={styles.stopMeta}>
                                        <Ionicons name="star" size={11} color="#FFD700" />
                                        <Text style={styles.stopRating}>{place.rating}</Text>
                                        <View style={[styles.statusDot, {
                                            backgroundColor: place.status === 'vacant' ? '#22C55E'
                                                : place.status === 'medium' ? '#F59E0B' : '#EF4444'
                                        }]} />
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                            </TouchableOpacity>
                        ))}

                        {/* Action buttons */}
                        <TouchableOpacity style={styles.openMapsBtn} onPress={handleOpenInMaps} activeOpacity={0.85}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.openMapsGradient}
                            >
                                <Ionicons name="navigate" size={20} color="#fff" />
                                <Text style={styles.openMapsBtnText}>{t('route.openInMaps')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.finishBtn} onPress={handleNewRoute} activeOpacity={0.8}>
                            <Ionicons name="refresh" size={18} color="#6366F1" />
                            <Text style={styles.finishBtnText}>{t('route.finishRoute')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Recently Visited */}
                <View style={styles.recentHeader}>
                    <Text style={styles.recentTitle}>{t('route.recentlyVisited')}</Text>
                </View>

                {loadingHistory ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="small" color="#6366F1" />
                    </View>
                ) : recentlyVisited.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Ionicons name="location-outline" size={40} color="#CBD5E1" />
                        <Text style={styles.emptyText}>{t('route.noHistory')}</Text>
                    </View>
                ) : (
                    recentlyVisited.map((place) => (
                        <TouchableOpacity
                            key={place.id}
                            style={styles.recentCard}
                            onPress={() => handleNavigate(place.id)}
                            activeOpacity={0.9}
                        >
                            <Image
                                source={{ uri: place.image }}
                                style={styles.recentImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                transition={200}
                            />
                            <View style={styles.recentContent}>
                                <Text style={styles.recentName} numberOfLines={1}>{place.name}</Text>
                                <Text style={styles.recentAddress} numberOfLines={1}>{place.address}</Text>
                                <View style={styles.recentMeta}>
                                    <Ionicons name="star" size={12} color="#FFD700" />
                                    <Text style={styles.recentRating}>{place.rating.toFixed(1)}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },

    // Header
    pageTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
    pageSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 20 },

    // Planner Card
    plannerCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 12,
    },

    // Route Type
    typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        gap: 7,
    },
    typeChipSelected: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
    typeIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeIconCircleSelected: { backgroundColor: '#6366F1' },
    typeChipText: { fontSize: 13, fontWeight: '700', color: '#475569' },
    typeChipTextSelected: { color: '#4338CA' },

    // Duration
    durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
    durationChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
    },
    durationChipSelected: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    durationChipText: { fontSize: 13, fontWeight: '800', color: '#475569' },
    durationChipTextSelected: { color: '#fff' },
    durationStopText: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2 },

    // Generate Button
    generateBtn: { borderRadius: 16, overflow: 'hidden' },
    generateBtnDisabled: { opacity: 0.5 },
    generateGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    // Route Result
    routeResultSection: {
        marginBottom: 24,
    },
    routeResultBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
    },
    routeResultTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
    routeResultSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    stopCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        position: 'relative',
    },
    stopNumberBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        zIndex: 2,
    },
    stopNumber: { color: '#fff', fontSize: 13, fontWeight: '800' },
    stopConnector: {
        position: 'absolute',
        left: 26,
        bottom: -8,
        width: 2,
        height: 8,
        backgroundColor: '#E2E8F0',
        zIndex: 1,
    },
    stopImage: { width: 64, height: 64, borderRadius: 14, marginRight: 12 },
    stopInfo: { flex: 1 },
    stopLabel: { fontSize: 10, color: '#6366F1', fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    stopName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
    stopAddress: { fontSize: 11, color: '#64748B', marginBottom: 4 },
    stopMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    stopRating: { fontSize: 11, fontWeight: '700', color: '#92400E' },
    statusDot: { width: 6, height: 6, borderRadius: 3 },

    openMapsBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
    openMapsGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        gap: 8,
    },
    openMapsBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    finishBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        marginTop: 10,
        gap: 8,
    },
    finishBtnText: { color: '#6366F1', fontSize: 15, fontWeight: '700' },

    // Recently Visited
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    recentTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    loadingBox: { paddingVertical: 30, alignItems: 'center' },
    emptyBox: {
        paddingVertical: 30,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    emptyText: { marginTop: 10, fontSize: 14, color: '#94A3B8', fontWeight: '500' },
    recentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    recentImage: { width: 60, height: 60, borderRadius: 14 },
    recentContent: { flex: 1, marginLeft: 14 },
    recentName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
    recentAddress: { fontSize: 12, color: '#64748B', marginBottom: 4 },
    recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    recentRating: { fontSize: 12, fontWeight: '700', color: '#92400E' },
});
