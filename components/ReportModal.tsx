import { useLocation } from '@/context/LocationContext';
import { useReports } from '@/context/ReportsContext';
import { useUser } from '@/context/UserContext';
import { PlaceData } from '@/services/MapsService';
import { Ionicons } from '@expo/vector-icons';
import { GeoPoint } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

interface ReportModalProps {
    isVisible: boolean;
    onClose: () => void;
    place: PlaceData;
}

const QUESTIONS = {
    STEP_1: "Is the place open?",
    STEP_2: "What is the queue like?"
};

const OPEN_OPTIONS = [
    { id: 'yes', label: 'Yes, it is open ✅', isOpen: true },
    { id: 'no', label: 'No, it is closed ❌', isOpen: false },
];

const SITUATIONS = [
    { id: '1', label: 'Calm 🙂', level: 1, color: '#10B981' },
    { id: '2', label: 'Little pressure ⚡', level: 2, color: '#FCD34D' },
    { id: '3', label: 'Slow service ⏳', level: 3, color: '#F97316' },
    { id: '4', label: 'Very busy 🔥', level: 4, color: '#EF4444' },
];

export default function ReportModal({ isVisible, onClose, place }: ReportModalProps) {
    const { addReport, reports } = useReports();
    const { user, addPoints } = useUser();
    const { location } = useLocation();

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedOpenStatus, setSelectedOpenStatus] = useState<boolean | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [xpAnim] = useState(new Animated.Value(0));
    const [modalFade] = useState(new Animated.Value(1));

    const handleSubmit = async (situation: typeof SITUATIONS[0]) => {
        setIsSubmitting(true);
        try {
            await addReport({
                placeName: place.name,
                isOpen: selectedOpenStatus ?? true,
                location: new GeoPoint(
                    location?.latitude || 0,
                    location?.longitude || 0
                ),
                description: `Report: ${selectedOpenStatus ? 'Open' : 'Closed'}, ${situation.label}`,
                notes: '',
                irrelevant: '',
                businessRef: place.id,
                reportNumberCount: 1,
                reportBy: user?.email || 'Guest',
                Hplacename: place.name,
                crowdLevel: situation.level,
                liveSituation: situation.label,
            });

            setShowSuccess(true);
            startSuccessFlow();
        } catch (error: any) {
            console.error("Report submission failed:", error);
            alert(error.message || "Failed to submit report. Please try again.");
            handleReset();
        } finally {
            setIsSubmitting(false);
        }
    };

    const startSuccessFlow = () => {
        // XP Animation
        Animated.sequence([
            Animated.timing(xpAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();

        // Countdown for auto-close
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    fadeOutAndClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const fadeOutAndClose = () => {
        Animated.timing(modalFade, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            handleClose();
        });
    };

    const handleReset = () => {
        setCurrentStep(1);
        setSelectedOpenStatus(null);
        setShowSuccess(false);
        setCountdown(5);
        xpAnim.setValue(0);
        modalFade.setValue(1);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleReportIncorrectly = () => {
        // Simply reset to step 1 to let user "fix" it
        handleReset();
    };

    const xpTranslateY = xpAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -100]
    });

    const xpOpacity = xpAnim.interpolate({
        inputRange: [0, 0.2, 0.8, 1],
        outputRange: [0, 1, 1, 0]
    });

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <Animated.View style={[styles.modalBackdrop, { opacity: modalFade }]}>
                <TouchableOpacity
                    style={styles.dismissArea}
                    activeOpacity={1}
                    onPress={handleClose}
                    disabled={isSubmitting || showSuccess}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.sheetContent}
                >
                    <View style={styles.sheetHandle} />

                    {showSuccess ? (
                        <View style={styles.successContainer}>
                            <Animated.View style={[
                                styles.xpBubble,
                                { transform: [{ translateY: xpTranslateY }], opacity: xpOpacity }
                            ]}>
                                <Text style={styles.xpBubbleText}>+10 XP</Text>
                            </Animated.View>

                            <View style={styles.successIconCircle}>
                                <Ionicons name="sparkles" size={50} color="#6366F1" />
                            </View>
                            <Text style={styles.successTitle}>Thank You!</Text>
                            <Text style={styles.successSubtitle}>
                                Your report helps the community!
                            </Text>

                            <TouchableOpacity
                                style={styles.incorrectBtn}
                                onPress={handleReportIncorrectly}
                            >
                                <Text style={styles.incorrectBtnText}>Reported incorrectly?</Text>
                            </TouchableOpacity>

                            <View style={styles.countdownContainer}>
                                <View style={[styles.countdownBar, { width: `${(countdown / 5) * 100}%` }]} />
                            </View>
                            <Text style={styles.closingText}>Closing in {countdown}s...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.header}>
                                <Image source={{ uri: place.image }} style={styles.businessImage} />
                                <View style={styles.headerInfo}>
                                    <Text style={styles.businessName}>{place.name}</Text>
                                    <View style={styles.stepIndicator}>
                                        <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
                                        <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
                                        <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.questionTitle}>
                                {currentStep === 1 ? QUESTIONS.STEP_1 : QUESTIONS.STEP_2}
                            </Text>

                            <View style={styles.optionsContainer}>
                                {currentStep === 1 ? (
                                    OPEN_OPTIONS.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.id}
                                            style={styles.optionCard}
                                            onPress={() => {
                                                setSelectedOpenStatus(opt.isOpen);
                                                if (opt.isOpen) {
                                                    setCurrentStep(2);
                                                } else {
                                                    // If closed, we can auto-submit with "Closed" status
                                                    handleSubmit({ id: 'closed', label: 'Place is closed', level: 0, color: '#EF4444' });
                                                }
                                            }}
                                        >
                                            <Text style={styles.optionLabel}>{opt.label}</Text>
                                            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    SITUATIONS.map((sit) => (
                                        <TouchableOpacity
                                            key={sit.id}
                                            style={styles.optionCard}
                                            onPress={() => handleSubmit(sit)}
                                            disabled={isSubmitting}
                                        >
                                            <View style={[styles.colorIndicator, { backgroundColor: sit.color }]} />
                                            <Text style={styles.optionLabel}>{sit.label}</Text>
                                            {isSubmitting && <ActivityIndicator size="small" color="#6366F1" />}
                                            {!isSubmitting && <Ionicons name="send" size={18} color="#6366F1" />}
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>

                            {currentStep === 2 && (
                                <TouchableOpacity
                                    style={styles.backLink}
                                    onPress={() => setCurrentStep(1)}
                                >
                                    <Ionicons name="arrow-back" size={16} color="#64748B" />
                                    <Text style={styles.backLinkText}>Back to first question</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}


                    <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
                </KeyboardAvoidingView>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    sheetContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
        minHeight: height * 0.5,
    },
    sheetHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    businessImage: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
    },
    headerInfo: {
        marginLeft: 16,
        flex: 1,
    },
    businessName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 4,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#E2E8F0',
    },
    stepDotActive: {
        backgroundColor: '#6366F1',
    },
    stepLine: {
        width: 30,
        height: 2,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 4,
    },
    stepLineActive: {
        backgroundColor: '#6366F1',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        width: '100%',
        marginBottom: 24,
    },
    questionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 24,
    },
    optionsContainer: {
        marginBottom: 20,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        justifyContent: 'space-between'
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    optionLabel: {
        flex: 1,
        fontSize: 16,
        color: '#334155',
        fontWeight: '600',
    },
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    backLinkText: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 6,
        fontWeight: '500',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    xpBubble: {
        position: 'absolute',
        top: 0,
        backgroundColor: '#6366F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        zIndex: 10,
    },
    xpBubbleText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
    },
    incorrectBtn: {
        marginBottom: 30,
    },
    incorrectBtnText: {
        color: '#6366F1',
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    countdownContainer: {
        width: '100%',
        height: 4,
        backgroundColor: '#F1F5F9',
        borderRadius: 2,
        marginBottom: 10,
        overflow: 'hidden',
    },
    countdownBar: {
        height: '100%',
        backgroundColor: '#6366F1',
    },
    closingText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    }
});
