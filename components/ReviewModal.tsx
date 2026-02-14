import { useLocation } from '@/context/LocationContext';
import { useReports } from '@/context/ReportsContext';
import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';
import { PlaceData } from '@/services/MapsService';
import { Ionicons } from '@expo/vector-icons';
import { GeoPoint } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const { height, width } = Dimensions.get('window');

interface ReviewModalProps {
    isVisible: boolean;
    onClose: () => void;
    place: PlaceData;
}

export default function ReviewModal({ isVisible, onClose, place }: ReviewModalProps) {
    const { addReport } = useReports();
    const { user } = useUser();
    const { location } = useLocation();

    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [xpAnim] = useState(new Animated.Value(0));
    const [modalFade] = useState(new Animated.Value(1));

    const handleSubmit = async () => {
        if (rating === 0) {
            alert(t('common.selectRating'));
            return;
        }

        setIsSubmitting(true);
        try {
            await addReport({
                placeName: place.name,
                isOpen: true,
                location: new GeoPoint(
                    location?.latitude || 0,
                    location?.longitude || 0
                ),
                description: reviewText || t('reviewModal.description'),
                notes: '',
                irrelevant: '',
                businessRef: place.id,
                reportNumberCount: 1,
                reportBy: user?.email || t('places.user'),
                Hplacename: place.name,
                crowdLevel: 0, // Not a crowd report
                liveSituation: t('reviewModal.title'),
                rating: rating
            });

            setShowSuccess(true);
            startSuccessFlow();
        } catch (error: any) {
            console.error("Review submission failed:", error);
            alert(t('common.failedToSubmit'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const startSuccessFlow = () => {
        Animated.timing(xpAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

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

    const handleClose = () => {
        setRating(0);
        setReviewText('');
        setShowSuccess(false);
        setCountdown(5);
        xpAnim.setValue(0);
        modalFade.setValue(1);
        onClose();
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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                                    <Ionicons name="star" size={50} color="#F59E0B" />
                                </View>
                                <Text style={styles.successTitle}>{t('reviewModal.success')}</Text>
                                <Text style={styles.successSubtitle}>
                                    {t('reportModal.successDesc')}
                                </Text>

                                <View style={styles.countdownContainer}>
                                    <View style={[styles.countdownBar, { width: `${(countdown / 5) * 100}%` }]} />
                                </View>
                                <Text style={styles.closingText}>{t('reportModal.closingIn', { count: countdown })}</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.header}>
                                    <Image source={{ uri: place.image }} style={styles.businessImage} />
                                    <View style={styles.headerInfo}>
                                        <Text style={styles.businessName}>{place.name}</Text>
                                        <Text style={styles.subtitle}>{t('reviewModal.rating')}</Text>
                                    </View>
                                </View>

                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <TouchableOpacity
                                            key={s}
                                            onPress={() => setRating(s)}
                                            style={styles.starBtn}
                                        >
                                            <Ionicons
                                                name={s <= rating ? "star" : "star-outline"}
                                                size={42}
                                                color={s <= rating ? "#F59E0B" : "#CBD5E1"}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder={t('reviewModal.description')}
                                        multiline
                                        numberOfLines={4}
                                        value={reviewText}
                                        onChangeText={setReviewText}
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting || rating === 0}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>{t('reviewModal.submit')}</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                        <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
                    </KeyboardAvoidingView>
                </Animated.View>
            </TouchableWithoutFeedback>
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
        marginBottom: 25,
    },
    businessImage: {
        width: 60,
        height: 60,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
    },
    headerInfo: {
        marginLeft: 15,
        flex: 1,
    },
    businessName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 30,
    },
    starBtn: {
        padding: 4,
    },
    inputWrapper: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 15,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    textInput: {
        height: 100,
        fontSize: 15,
        color: '#1E293B',
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#6366F1',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: '#CBD5E1',
        shadowOpacity: 0,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 40,
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
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 10,
    },
    successSubtitle: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
        paddingHorizontal: 20
    },
    countdownContainer: {
        width: '100%',
        height: 4,
        backgroundColor: '#F1F5F9',
        borderRadius: 2,
        marginBottom: 12,
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
