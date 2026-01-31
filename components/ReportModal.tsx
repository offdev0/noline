import { useLocation } from '@/context/LocationContext';
import { useReports } from '@/context/ReportsContext';
import { useUser } from '@/context/UserContext';
import { PlaceData } from '@/services/MapsService';
import { Ionicons } from '@expo/vector-icons';
import { GeoPoint } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

interface ReportModalProps {
    isVisible: boolean;
    onClose: () => void;
    place: PlaceData;
}

const SITUATIONS = [
    { id: '1', label: 'calm 🙂', level: 1 },
    { id: '2', label: 'Little pressure / fast service ⚡', level: 2 },
    { id: '3', label: 'Slow service ⏳', level: 3 },
    { id: '4', label: 'The place is closed ❌', level: 4, isClosed: true },
];

export default function ReportModal({ isVisible, onClose, place }: ReportModalProps) {
    const { addReport } = useReports();
    const { user } = useUser();
    const { location } = useLocation();
    const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!selectedSituation) return;

        const sit = SITUATIONS.find(s => s.id === selectedSituation);
        if (!sit) return;

        setIsSubmitting(true);
        try {
            await addReport({
                placeName: place.name,
                isOpen: !sit.isClosed,
                location: new GeoPoint(
                    location?.latitude || 0,
                    location?.longitude || 0
                ),
                description: `User reported situation: ${sit.label}`,
                notes: '',
                irrelevant: '',
                businessRef: place.id,
                reportNumberCount: 1,
                reportBy: user?.email || 'Guest',
                Hplacename: place.name,
                crowdLevel: sit.level,
                liveSituation: sit.label,
            });

            setShowSuccess(true);
            setTimeout(() => {
                handleReset();
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Report submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedSituation(null);
        setShowSuccess(false);
        setIsSubmitting(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalBackdrop}>
                <TouchableOpacity
                    style={styles.dismissArea}
                    activeOpacity={1}
                    onPress={handleClose}
                    disabled={isSubmitting}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.sheetContent}
                >
                    <View style={styles.sheetHandle} />

                    {showSuccess ? (
                        <View style={styles.successContainer}>
                            <View style={styles.successIconCircle}>
                                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                            </View>
                            <Text style={styles.successTitle}>Thank You!</Text>
                            <Text style={styles.successSubtitle}>
                                Your report for <Text style={{ fontWeight: '700' }}>{place.name}</Text> has been submitted.
                            </Text>
                            <Text style={styles.successPoints}>+10 Community Points Earned ⚡</Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.header}>
                                <Image source={{ uri: place.image }} style={styles.businessImage} />
                                <View style={styles.headerInfo}>
                                    <Text style={styles.businessName}>{place.name}</Text>
                                    <View style={styles.badgeRow}>
                                        <View style={styles.openBadge}>
                                            <Text style={styles.openBadgeText}>open</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: '#FCD34D' }]}>
                                            <Text style={styles.statusBadgeText}>
                                                {place.status.charAt(0).toUpperCase() + place.status.slice(1)} load
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.questionTitle}>What is the situation there?</Text>

                            <View style={styles.optionsContainer}>
                                {SITUATIONS.map((sit) => (
                                    <TouchableOpacity
                                        key={sit.id}
                                        style={styles.optionRow}
                                        onPress={() => setSelectedSituation(sit.id)}
                                        disabled={isSubmitting}
                                    >
                                        <View style={[
                                            styles.radioCircle,
                                            selectedSituation === sit.id && styles.radioCircleActive
                                        ]}>
                                            {selectedSituation === sit.id && <View style={styles.radioInner} />}
                                        </View>
                                        <Text style={[
                                            styles.optionLabel,
                                            selectedSituation === sit.id && styles.optionLabelActive
                                        ]}>
                                            {sit.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.submitBtn,
                                    (!selectedSituation || isSubmitting) && styles.submitBtnDisabled
                                ]}
                                disabled={!selectedSituation || isSubmitting}
                                onPress={handleSubmit}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Send Update</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
                </KeyboardAvoidingView>
            </View>
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
        minHeight: height * 0.4,
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
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    headerInfo: {
        marginLeft: 16,
        flex: 1,
    },
    businessName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    openBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    openBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusBadgeText: {
        color: '#1E293B',
        fontSize: 12,
        fontWeight: '700',
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
        marginBottom: 32,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleActive: {
        borderColor: '#6366F1',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#6366F1',
    },
    optionLabel: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    optionLabelActive: {
        color: '#1E293B',
        fontWeight: '600',
    },
    submitBtn: {
        backgroundColor: '#6366F1',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        minHeight: 56,
        justifyContent: 'center'
    },
    submitBtnDisabled: {
        backgroundColor: '#E2E8F0',
        shadowOpacity: 0,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    successIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#065F46',
        marginBottom: 10,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 24,
        marginBottom: 20,
    },
    successPoints: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6366F1',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    }
});
