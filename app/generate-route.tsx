import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from '@/context/LocationContext';
import { usePlaces } from '@/context/PlacesContext';
import { t } from '@/i18n';
import { MapsService } from '@/services/MapsService';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GeneratingRoute } from '@/components/customized/GeneratingRoute';
import { JourneyCard } from '@/components/customized/JourneyCard';
import { JourneyFinished } from '@/components/customized/JourneyFinished';
import { TimeSelection } from '@/components/customized/TimeSelection';
import { Ionicons } from '@expo/vector-icons';

export default function GenerateRouteScreen() {
    const router = useRouter();
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const { allPlaces } = usePlaces();
    const { language } = useLanguage();
    const { location: userLocation } = useLocation();

    const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
    const [routeStops, setRouteStops] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const generateRoute = async (durationId: string) => {
        if (allPlaces.length === 0) {
            alert(t('route.loadingPlaces'));
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedDuration(durationId);
        setIsGenerating(true);

        // Simulation delay for "Personalized" feel
        setTimeout(() => {
            // 1. Start with the pool of all places
            let pool = [...allPlaces];

            // 2. Filter by group type (groupId) to make it truly personalized
            if (groupId) {
                if (groupId === 'alone') {
                    // Solo: Cafes, museums, parks, shopping
                    pool = pool.filter(p =>
                        p.category === 'restaurant' ||
                        p.category === 'mustVisit' ||
                        p.category === 'shopping' ||
                        p.isLeisure
                    );
                } else if (groupId === 'couple') {
                    // Couples: Nice restaurants, scenic must-visits, special vibes
                    pool = pool.filter(p =>
                        p.category === 'restaurant' ||
                        p.category === 'mustVisit' ||
                        p.category === 'hot'
                    );
                } else if (groupId === 'friends') {
                    // Friends: Bars (hot), entertainment (fun), restaurants
                    pool = pool.filter(p =>
                        p.category === 'hot' ||
                        p.category === 'fun' ||
                        p.category === 'restaurant'
                    );
                } else if (groupId === 'family') {
                    // Family: Parks, kid-friendly must-visits, leisure spots
                    pool = pool.filter(p =>
                        p.category === 'mustVisit' ||
                        p.isLeisure ||
                        p.category === 'fun'
                    );
                }
            }

            // Fallback if filtering was too strict
            if (pool.length < 5) pool = [...allPlaces];

            // 3. Sort by rating and proximity to ensure high-quality, consistent suggestions
            const sortedByBest = pool.sort((a, b) => {
                // Primary: Quality (Rating)
                if ((b.rating || 0) !== (a.rating || 0)) {
                    return (b.rating || 0) - (a.rating || 0);
                }
                
                // Secondary: Proximity (if user location is available)
                if (userLocation) {
                    const distA = MapsService.getRawDistance(userLocation.latitude, userLocation.longitude, a.location.latitude, a.location.longitude);
                    const distB = MapsService.getRawDistance(userLocation.latitude, userLocation.longitude, b.location.latitude, b.location.longitude);
                    return distA - distB;
                }
                return 0;
            });

            // 4. Adjust stops count based on duration
            const stopsCount =
                durationId === '1h' ? 2 :
                    durationId === '3h' ? 3 :
                        durationId === 'half' ? 5 : 8;

            const selectedStops = sortedByBest.slice(0, stopsCount);

            // 5. Calculate transit between stops based on actual distance if possible
            let currentLat = userLocation?.latitude || selectedStops[0].location.latitude;
            let currentLng = userLocation?.longitude || selectedStops[0].location.longitude;

            const stopsWithTransit = selectedStops.map((stop, i) => {
                const actualDist = MapsService.getRawDistance(
                    currentLat,
                    currentLng,
                    stop.location.latitude,
                    stop.location.longitude
                );

                // Ground it in real distance
                const dist = actualDist > 0 ? actualDist : 0.5;

                const mode = dist < 0.8 ? 'walking' : 'taxi';
                const time = Math.round(dist * (mode === 'walking' ? 12 : 5));

                const subSteps = mode === 'walking'
                    ? [
                        { icon: 'walk', text: t('route.walkToNearby') },
                        { icon: 'navigate', text: t('route.followPath') },
                        { icon: 'flag', text: `${t('route.reach')} ${stop.name}` }
                    ]
                    : [
                        { icon: 'walk', text: t('route.walkToPickup') },
                        { icon: 'car', text: `${t('route.takeTaxi')} ${dist.toFixed(1)} ${t('route.km')}` },
                        { icon: 'flag', text: `${t('route.reach')} ${stop.name}` }
                    ];

                // Update current location for next stop
                currentLat = stop.location.latitude;
                currentLng = stop.location.longitude;

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
        setSelectedDuration(null);
        setCurrentStep(0);
        setIsFinished(false);
        router.back();
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Main Content Area */}
                <View style={styles.mainArea}>
                    {isGenerating ? (
                        <GeneratingRoute />
                    ) : isFinished ? (
                        <JourneyFinished numStops={routeStops.length} onReset={handleNewRoute} />
                    ) : routeStops.length > 0 ? (
                        <JourneyCard
                            place={routeStops[currentStep]}
                            currentStep={currentStep}
                            totalSteps={routeStops.length}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onFinish={() => setIsFinished(true)}
                            onViewDetails={() => router.push({ pathname: '/place/[id]', params: { id: routeStops[currentStep].id } })}
                            onSeeRoute={() => router.push({
                                pathname: '/route-details',
                                params: {
                                    stops: JSON.stringify(routeStops),
                                    currentStep: currentStep.toString()
                                }
                            })}
                            onBack={() => {
                                setRouteStops([]);
                                setSelectedDuration(null);
                            }}
                        />

                    ) : (
                        <>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#e6e9ecff" />
                </TouchableOpacity>
                            <View style={styles.header}>
                                <Text style={styles.pageTitle}>{t('route.personalizedTitle')}</Text>
                            </View>

                            <TimeSelection
                                onSelect={(durationId) => generateRoute(durationId)}
                                onBack={() => router.back()}
                            />
                        </>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },

    header: { marginBottom: 10, marginTop: 24 },
    pageTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
    pageSubtitle: { fontSize: 14, color: '#64748B', lineHeight: 20 },

    mainArea: {
        marginBottom: 32,
    },
    backBtn: {
        padding: 7,
        backgroundColor: '#1c1d1dff',
        borderRadius: 10,
        width:70


    },
});
