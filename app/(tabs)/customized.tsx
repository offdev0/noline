import { useFavorites } from '@/context/FavoritesContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePlaces } from '@/context/PlacesContext';
import { t } from '@/i18n';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GroupSelection } from '@/components/customized/GroupSelection';
import { GeneratingRoute } from '@/components/customized/GeneratingRoute';
import { JourneyCard } from '@/components/customized/JourneyCard';
import { JourneyFinished } from '@/components/customized/JourneyFinished';
import { FavoritesSection } from '@/components/customized/FavoritesSection';

export default function CustomizedScreen() {
    const router = useRouter();
    const { favorites } = useFavorites();
    const { language } = useLanguage();
    const { allPlaces } = usePlaces();

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
            const pool = allPlaces;
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            const selectedStops = shuffled.slice(0, 4);

            const stopsWithTransit = selectedStops.map((stop, i) => {
                const dist = Math.random() * 1.5 + 0.3; // 0.3 - 1.8 km
                const mode = dist < 0.8 ? 'walking' : 'taxi';
                const time = Math.round(dist * (mode === 'walking' ? 12 : 5));
                
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
                        />
                    ) : (
                        <GroupSelection onSelect={generateRoute} />
                    )}
                </View>

                {/* Favorites - Only show when not in the middle of a journey */}
                {routeStops.length === 0 && !isGenerating && (
                    <FavoritesSection 
                        favorites={favorites}
                        language={language}
                        onViewAll={() => router.push('/favorites')}
                        onPressPlace={(place) => router.push({ pathname: '/place/[id]', params: { id: place.id } })}
                    />
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
});
