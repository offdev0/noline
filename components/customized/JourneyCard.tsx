import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface JourneyCardProps {
    place: any;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrevious: () => void;
    onFinish: () => void;
    onViewDetails: () => void;
    onSeeRoute: () => void;
    onBack?: () => void;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
    place,
    currentStep,
    totalSteps,
    onNext,
    onPrevious,
    onFinish,
    onViewDetails,
    onSeeRoute,
    onBack,
}) => {
    if (!place) return null;
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <View style={styles.container}>
            {/* Step Indicator */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#eaedf0ff" />
                </TouchableOpacity>
            </View>
            <View style={styles.stepHeader}>
                <Text style={styles.stepTitle}>
                    {t('route.stop')} {currentStep + 1}
                </Text>
                <View style={styles.stepDots}>
                    {Array.from({ length: totalSteps }).map((_, i) => (
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
            <View style={styles.card}>
                <Image
                    source={{ uri: place.image }}
                    style={styles.image}
                    contentFit="cover"
                    transition={600}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
                    style={styles.imageOverlay}
                />

                <View style={styles.info}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{t('route.stop')} {currentStep + 1} / {totalSteps}</Text>
                    </View>
                    <Text style={styles.name}>{place.name}</Text>
                    <Text style={styles.address} numberOfLines={1}>{place.address}</Text>

                    <View style={styles.meta}>
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
            <View style={styles.navRow}>
                {currentStep > 0 && (
                    <TouchableOpacity style={styles.navBtnSecondary} onPress={onPrevious}>
                        <Ionicons name="arrow-back" size={20} color="#6366F1" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.navBtnPrimary, isLastStep && styles.navBtnFinish]}
                    onPress={isLastStep ? onFinish : onNext}
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
                    onPress={onViewDetails}
                >
                    <Ionicons name="information-circle-outline" size={20} color="#64748B" />
                    <Text style={styles.secondaryActionText}>{t('placesSection.viewDetails')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.mainActionBtn, { flex: 1 }]}
                    onPress={onSeeRoute}
                >
                    <Ionicons name="map-outline" size={20} color="#fff" />
                    <Text style={styles.mainActionText}>{t('route.seeRoute')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    backBtn: {
        padding: 7,
        backgroundColor: '#1c1d1dff',
        borderRadius: 10,


    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
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
    card: {
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
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    info: {
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 12,
    },
    meta: {
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
    navRow: {
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
});
