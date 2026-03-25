import { useLocation } from '@/context/LocationContext';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RouteDetailsScreen() {
    const router = useRouter();
    const { stops: stopsParam, currentStep: currentStepParam } = useLocalSearchParams<{ stops: string, currentStep: string }>();
    const { location: userLocation } = useLocation();

    const routeStops = React.useMemo(() => {
        try {
            return JSON.parse(stopsParam || '[]');
        } catch (e) {
            return [];
        }
    }, [stopsParam]);

    const currentStep = parseInt(currentStepParam || '0');
    const targetStop = routeStops[currentStep];
    const originStop = currentStep > 0 ? routeStops[currentStep - 1] : null;

    if (!targetStop) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>See Route</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>
                    {originStop 
                        ? `Stop ${currentStep} to Stop ${currentStep + 1}`
                        : `Start Your Journey`
                    }
                </Text>

                <View style={styles.segmentContainer}>
                    {/* Origin Section */}
                    <View style={styles.stopPoint}>
                        <View style={styles.pointIndicator} />
                        <View style={styles.stopInfo}>
                            <Text style={styles.stopLabel}>Start from</Text>
                            <Text style={styles.stopName}>
                                {originStop ? originStop.name : "Current Location"}
                            </Text>
                        </View>
                    </View>

                    {/* Transit Directions */}
                    <View style={styles.directionsContainer}>
                        <View style={styles.verticalLineWrapper}>
                            <View style={styles.verticalLine} />
                        </View>
                        <View style={styles.directionsCard}>
                            <View style={styles.transitHeader}>
                                <Ionicons 
                                    name={targetStop.transit?.mode === 'walking' ? "walk" : "car"} 
                                    size={24} 
                                    color="#6366F1" 
                                />
                                <Text style={styles.transitMode}>
                                    {targetStop.transit?.mode === 'walking' ? "Walk" : "Taxi"}
                                </Text>
                            </View>
                            <Text style={styles.transitDetail}>
                                {targetStop.transit?.time} min ({targetStop.transit?.distance} km)
                            </Text>
                            <View style={styles.stepList}>
                                {targetStop.transit?.subSteps?.map((step: any, idx: number) => (
                                    <View key={idx} style={styles.stepItem}>
                                        <Ionicons name={step.icon} size={16} color="#94A3B8" />
                                        <Text style={styles.stepText}>{step.text}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Destination Section */}
                    <View style={styles.stopPoint}>
                        <View style={[styles.pointIndicator, styles.pointActive]} />
                        <View style={styles.stopInfo}>
                            <Text style={styles.stopLabel}>Destination</Text>
                            <Text style={[styles.stopName, { color: '#6366F1' }]}>{targetStop.name}</Text>
                            <Text style={styles.stopAddress}>{targetStop.address}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.mapBtn} onPress={() => {
                    const origin = originStop 
                        ? `${originStop.location.latitude},${originStop.location.longitude}`
                        : userLocation ? `${userLocation.latitude},${userLocation.longitude}` : '';
                    
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${targetStop.location.latitude},${targetStop.location.longitude}`;
                    Linking.openURL(url);
                }}>
                    <Ionicons name="navigate" size={20} color="#fff" />
                    <Text style={styles.mapBtnText}>Open in Google Maps</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
    },
    scrollContent: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 24,
    },
    segmentContainer: {
        marginBottom: 30,
    },
    stopPoint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    pointIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
        marginTop: 4,
        marginRight: 20,
        zIndex: 2,
    },
    pointActive: {
        borderColor: '#6366F1',
        backgroundColor: '#6366F1',
    },
    stopInfo: {
        flex: 1,
    },
    stopLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 4,
    },
    stopName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    stopAddress: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    directionsContainer: {
        flexDirection: 'row',
        minHeight: 120,
    },
    verticalLineWrapper: {
        width: 16,
        marginRight: 20,
        alignItems: 'center',
    },
    verticalLine: {
        flex: 1,
        width: 2,
        backgroundColor: '#F1F5F9',
    },
    directionsCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 20,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    transitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    transitMode: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    transitDetail: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366F1',
        marginBottom: 16,
    },
    stepList: {
        gap: 12,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stepText: {
        fontSize: 14,
        color: '#64748B',
    },
    startSegment: {
        padding: 20,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    mapBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0F172A',
        height: 56,
        borderRadius: 18,
        marginTop: 40,
        gap: 10,
    },
    mapBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
