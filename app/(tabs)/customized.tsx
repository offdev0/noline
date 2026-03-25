import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePlaces } from '@/context/PlacesContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Linking, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const GROUP_TYPES = [
    { id: 'alone', icon: 'person-outline', label: 'alone', color: '#6366F1' },
    { id: 'couple', icon: 'heart-outline', label: 'couple', color: '#EC4899' },
    { id: 'friends', icon: 'people-outline', label: 'friends', color: '#8B5CF6' },
    { id: 'family', icon: 'home-outline', label: 'family', color: '#F59E0B' },
];

const isLatinText = (value: string) => /[A-Za-z]/.test(value) && /^[\x00-\x7F]*$/.test(value);

export default function CustomizedScreen() {
    const router = useRouter();
    const { favorites } = useFavorites();
    const { language } = useLanguage();
    const { allPlaces } = usePlaces();

    const mapRef = useRef<MapView>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [routeStops, setRouteStops] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const generateRoute = async (groupId: string) => {
        if (allPlaces.length === 0) {
            alert('Wait a moment, we are still loading places near you...');
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedGroup(groupId);
        setIsGenerating(true);

        // Simulation delay for "Personalized" feel
        setTimeout(() => {
            // Pick a mix of places
            // If we have enough places, pick 4. Otherwise pick all available.
            const pool = allPlaces;
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            const selectedStops = shuffled.slice(0, 4);

            const stopsWithTransit = selectedStops.map((stop, i) => {
                const dist = Math.random() * 1.5 + 0.3; // 0.3 - 1.8 km
                const mode = dist < 0.8 ? 'walking' : 'taxi';
                const time = Math.round(dist * (mode === 'walking' ? 12 : 5));
                
                // Generate detailed sub-steps
                const subSteps = mode === 'walking' 
                    ? [
                        { icon: 'walk', text: 'Walk to the nearby point' },
                        { icon: 'navigate', text: 'Follow the direct path' },
                        { icon: 'flag', text: `Reach ${stop.name}` }
                    ]
                    : [
                        { icon: 'walk', text: 'Walk 5 min to the pickup point' },
                        { icon: 'car', text: `Take taxi for ${dist.toFixed(1)} km` },
                        { icon: 'flag', text: `Reach ${stop.name}` }
                    ];

                return {
                    ...stop,
                    transit: {
                        mode,
                        time,
                        distance: dist.toFixed(1),
                        subSteps
                    }
                };
            });

            setRouteStops(stopsWithTransit);
            setIsGenerating(false);
            setCurrentStep(0);
            setIsFinished(false);
        }, 1500);
    };

    const handleNewRoute = () => {
        setRouteStops([]);
        setSelectedGroup(null);
        setCurrentStep(0);
        setIsFinished(false);
    };

    const handleNext = () => {
        if (currentStep < routeStops.length - 1) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentStep(prev => prev - 1);
        }
    };

    const favoritePreview = favorites.slice(0, 6);

    const renderSelection = () => (
        <View style={styles.selectionContainer}>
            <Text style={styles.sectionLabel}>{t('route.whoAreYouWith')}</Text>
            <View style={styles.groupGrid}>
                {GROUP_TYPES.map(group => (
                    <TouchableOpacity
                        key={group.id}
                        style={styles.groupCard}
                        onPress={() => generateRoute(group.id)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[group.color + '15', group.color + '25']}
                            style={styles.groupCardGradient}
                        >
                            <View style={[styles.groupIconCircle, { backgroundColor: group.color + '20' }]}>
                                <Ionicons name={group.icon as any} size={28} color={group.color} />
                            </View>
                            <Text style={styles.groupLabel}>{t(`route.${group.label}`)}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderGenerating = () => (
        <View style={styles.generatingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.generatingText}>{t('route.generating')}</Text>
            <Text style={styles.generatingSub}>{t('route.planSubtitle')}</Text>
        </View>
    );

    const renderJourney = () => {
        const place = routeStops[currentStep];
        if (!place) return null;
        const isLastStep = currentStep === routeStops.length - 1;

        return (
            <View style={styles.journeyWrapper}>
                {/* Step Indicator */}
                <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle}>
                        {t('route.stop')} {currentStep + 1}
                    </Text>
                    <View style={styles.stepDots}>
                        {routeStops.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.stepDot,
                                    i === currentStep && styles.stepDotActive,
                                    i < currentStep && styles.stepDotCompleted,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Main Card */}
                <View style={styles.journeyCard}>
                    <Image
                        source={{ uri: place.image }}
                        style={styles.journeyImage}
                        contentFit="cover"
                        transition={600}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
                        style={styles.journeyImageOverlay}
                    />

                    <View style={styles.journeyInfo}>
                        <View style={styles.stepBadge}>
                            <Text style={styles.stepBadgeText}>{t('route.stop')} {currentStep + 1} / {routeStops.length}</Text>
                        </View>
                        <Text style={styles.journeyName}>{place.name}</Text>
                        <Text style={styles.journeyAddress} numberOfLines={1}>{place.address}</Text>

                        <View style={styles.journeyMeta}>
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={14} color="#F59E0B" />
                                <Text style={styles.ratingText}>{place.rating}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <View style={[styles.statusDot, {
                                    backgroundColor: place.status === 'vacant' ? '#22C55E'
                                        : place.status === 'medium' ? '#F59E0B' : '#EF4444'
                                }]} />
                                <Text style={styles.statusText}>{t(`places.${place.status}`)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Navigation Buttons */}
                <View style={styles.journeyNav}>
                    {currentStep > 0 && (
                        <TouchableOpacity style={styles.navBtnSecondary} onPress={handlePrevious}>
                            <Ionicons name="arrow-back" size={20} color="#6366F1" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.navBtnPrimary, isLastStep && styles.navBtnFinish]}
                        onPress={isLastStep ? () => setIsFinished(true) : handleNext}
                    >
                        <Text style={styles.navBtnTextPrimary}>
                            {isLastStep ? t('route.journeyComplete') : t('route.nextStop')}
                        </Text>
                        {!isLastStep && <Ionicons name="chevron-forward" size={24} color="#fff" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.secondaryActionBtn}
                        onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
                    >
                        <Ionicons name="information-circle-outline" size={20} color="#64748B" />
                        <Text style={styles.secondaryActionText}>{t('placesSection.viewDetails')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.mainActionBtn, { flex: 1 }]}
                        onPress={() => router.push({
                            pathname: '/route-details',
                            params: {
                                stops: JSON.stringify(routeStops),
                                currentStep: currentStep.toString()
                            }
                        })}
                    >
                        <Ionicons name="map-outline" size={20} color="#fff" />
                        <Text style={styles.mainActionText}>{t('route.seeRoute')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderFinished = () => (
        <View style={styles.finishedContainer}>
            <View style={styles.finishedIconCircle}>
                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            <Text style={styles.finishedTitle}>{t('route.journeyComplete')}</Text>
            <Text style={styles.finishedSub}>
                You've visited all {routeStops.length} stops in your personalized route!
            </Text>

            <TouchableOpacity style={styles.startAgainBtn} onPress={handleNewRoute}>
                <LinearGradient
                    colors={['#6366F1', '#4F46E5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startAgainGradient}
                >
                    <Ionicons name="refresh" size={24} color="#fff" />
                    <Text style={styles.startAgainText}>{t('route.backToStart')}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>{t('route.personalizedTitle')}</Text>
                    <Text style={styles.pageSubtitle}>{t('route.planSubtitle')}</Text>
                </View>

                {/* Main Content Area */}
                <View style={styles.mainArea}>
                    {isGenerating
                        ? renderGenerating()
                        : isFinished
                            ? renderFinished()
                            : routeStops.length > 0
                                ? renderJourney()
                                : renderSelection()
                    }
                </View>

                {/* Favorites - Only show when not in the middle of a journey */}
                {routeStops.length === 0 && !isGenerating && (
                    <>
                        <View style={styles.favoritesHeader}>
                            <Text style={styles.favoritesTitle}>{t('trends.yourFavorites')}</Text>
                            {favorites.length > 0 && (
                                <TouchableOpacity onPress={() => router.push('/favorites')}>
                                    <Text style={styles.favoritesSeeMore}>{t('trends.seeAll')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {favorites.length === 0 ? (
                            <View style={styles.emptyFavBox}>
                                <Ionicons name="heart-outline" size={40} color="#CBD5E1" />
                                <Text style={styles.emptyFavText}>{t('trends.favoritesEmpty')}</Text>
                            </View>
                        ) : (
                            <View style={styles.favoritesGrid}>
                                {favoritePreview.map((place) => (
                                    <TouchableOpacity
                                        key={place.id}
                                        style={styles.favoriteCard}
                                        onPress={() => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
                                        activeOpacity={0.9}
                                    >
                                        <Image
                                            source={{ uri: place.image }}
                                            style={styles.favoriteImage}
                                            contentFit="cover"
                                            cachePolicy="memory-disk"
                                            transition={200}
                                        />
                                        <View style={styles.favoriteContent}>
                                            <Text style={[styles.favoriteName, language === 'he' && isLatinText(place.name) && styles.ltrText]} numberOfLines={1}>{place.name}</Text>
                                            <View style={styles.favoriteMeta}>
                                                <Ionicons name="star" size={12} color="#FFD700" />
                                                <Text style={styles.favoriteRating}>{place.rating?.toFixed(1) || '4.5'}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },

    header: { marginBottom: 24 },
    pageTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
    pageSubtitle: { fontSize: 14, color: '#64748B', lineHeight: 20 },

    mainArea: {
        marginBottom: 32,
    },

    // Selection
    selectionContainer: {},
    sectionLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 16,
    },
    groupGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    groupCard: {
        width: (width - 52) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    groupCardGradient: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    groupIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    groupLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },

    // Generating
    generatingContainer: {
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generatingText: {
        marginTop: 16,
        fontSize: 18,
        color: '#1E293B',
        fontWeight: '800',
    },
    generatingSub: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    // Finished
    finishedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#fff',
        borderRadius: 32,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    finishedIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    finishedTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
    },
    finishedSub: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    startAgainBtn: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    startAgainGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    startAgainText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    // Journey
    journeyWrapper: {
    },
    mapContainer: {
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#E2E8F0',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#94A3B8',
    },
    markerCircleActive: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderColor: '#6366F1',
        backgroundColor: '#fff',
    },
    markerCircleCompleted: {
        borderColor: '#6366F1',
        backgroundColor: '#6366F1',
    },
    markerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#94A3B8',
    },
    markerDotActive: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#6366F1',
    },

    // Transit
    transitWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    transitLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#6366F1',
        opacity: 0.3,
    },
    transitContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9', // Light background
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    transitBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#6366F1', // Active color
        alignItems: 'center',
        justifyContent: 'center',
    },
    transitText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },

    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#6366F1',
        textTransform: 'uppercase',
    },
    stepDots: {
        flexDirection: 'row',
        gap: 6,
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
    },
    stepDotActive: {
        width: 24,
        backgroundColor: '#6366F1',
    },
    stepDotCompleted: {
        backgroundColor: '#6366F1',
        opacity: 0.5,
    },
    journeyCard: {
        height: 380,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    journeyImage: {
        width: '100%',
        height: '100%',
    },
    journeyImageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    journeyInfo: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
    },
    stepBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    stepBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    journeyName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    journeyAddress: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 12,
    },
    journeyMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 13,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    statusText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    journeyNav: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    navBtnPrimary: {
        flex: 1,
        backgroundColor: '#6366F1',
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    navBtnFinish: {
        backgroundColor: '#10B981',
    },
    navBtnSecondary: {
        flex: 1,
        backgroundColor: '#EEF2FF',
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    navBtnTextPrimary: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    navBtnTextSecondary: {
        color: '#6366F1',
        fontSize: 16,
        fontWeight: '700',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    mainActionBtn: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A',
        height: 54,
        borderRadius: 18,
        gap: 8,
    },
    mainActionText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        height: 54,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        gap: 8,
    },
    secondaryActionText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
    fullWidthActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        height: 54,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        gap: 8,
    },
    // Favorites
    favoritesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 14,
    },
    favoritesTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    favoritesSeeMore: { fontSize: 13, fontWeight: '800', color: '#6366F1' },
    favoritesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    favoriteCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    favoriteImage: { width: '100%', height: 110 },
    favoriteContent: { padding: 12 },
    favoriteName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
    ltrText: { writingDirection: 'ltr', textAlign: 'left' },
    favoriteMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    favoriteRating: { fontSize: 12, fontWeight: '700', color: '#92400E' },
    emptyFavBox: {
        paddingVertical: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    emptyFavText: { marginTop: 10, fontSize: 14, color: '#94A3B8', fontWeight: '500' },
});
