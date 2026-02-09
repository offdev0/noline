import CommentsModal from '@/components/CommentsModal';
import { useLocation } from '@/context/LocationContext';
import { usePlaces } from '@/context/PlacesContext';
import { ReportData, useReports } from '@/context/ReportsContext';
import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlacesScreen() {
    const router = useRouter();
    const { reports, loading: reportsLoading, toggleLike } = useReports();
    const { trendingPlaces: allPlaces, getPlaceById } = usePlaces();
    const { user } = useUser();
    const { location: userLocation } = useLocation();

    const [filterVisible, setFilterVisible] = useState(false);

    // Filter States
    const [selectedType, setSelectedType] = useState('All');
    const [selectedDistance, setSelectedDistance] = useState('Any');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [isCommentsVisible, setIsCommentsVisible] = useState(false);
    const [activeReport, setActiveReport] = useState<ReportData | null>(null);

    // Helper to calculate distance in km
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const formatTimeAgo = (timestamp: any) => {
        if (!timestamp) return t('time.justNow');
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return t('time.secondsAgo', { count: diffInSeconds });
        if (diffInSeconds < 3600) return t('time.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
        if (diffInSeconds < 86400) return t('time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
        return t('time.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
    };

    const getStatusType = (level: number) => {
        if (level === 1) return 'vacant';
        if (level === 2 || level === 3) return 'medium';
        return 'loaded';
    };

    const openComments = (report: ReportData) => {
        setActiveReport(report);
        setIsCommentsVisible(true);
    };

    // Main Filtering Logic
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            // 0. Exclude User Reviews from the main feed
            if (report.liveSituation === 'User Review') return false;

            // 1. Filter by Crowd Level
            if (selectedType !== 'All') {
                const type = getStatusType(report.crowdLevel);
                if (type !== selectedType) return false;
            }

            // 2. Filter by Category
            if (selectedCategory !== 'All') {
                const place = getPlaceById(report.businessRef);
                const cat = place?.category?.toLowerCase() || '';

                const filterCat = selectedCategory.toLowerCase();
                if (filterCat === 'food' && cat !== 'restaurant') return false;
                if (filterCat === 'fun' && !['fun', 'casino', 'hot'].includes(cat)) return false;
                if (filterCat === 'shopping' && cat !== 'shopping') return false;
                if (filterCat === 'medical' && cat !== 'medical') return false; // Mock data doesn't have medical yet
            }

            // 3. Filter by Distance
            if (selectedDistance !== 'Any' && userLocation && report.location) {
                const dist = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    report.location.latitude,
                    report.location.longitude
                );

                if (selectedDistance === '1-5 km' && (dist < 1 || dist > 5)) return false;
                if (selectedDistance === '5-10 km' && (dist < 5 || dist > 10)) return false;
                if (selectedDistance === '10-20 km' && (dist < 10 || dist > 20)) return false;
                if (selectedDistance === '20+ km' && dist < 20) return false;
            }

            return true;
        });
    }, [reports, selectedType, selectedDistance, selectedCategory, userLocation, getPlaceById]);

    const renderReportCard = ({ item }: { item: ReportData }) => {
        const type = getStatusType(item.crowdLevel);
        const bannerStyle = {
            bg: type === 'vacant' ? '#F0FDF4' : type === 'medium' ? '#FFFBEB' : '#FEF2F2',
            text: type === 'vacant' ? '#16A34A' : type === 'medium' ? '#D97706' : '#DC2626',
            border: type === 'vacant' ? '#DCFCE7' : type === 'medium' ? '#FEF3C7' : '#FEE2E2'
        };

        const isLiked = item.likes?.includes(user?.email || '');
        const avatarId = (item.reportBy?.length || 0) % 70;

        return (
            <View style={styles.card}>
                {/* Header: Place Image, Name, Category, Status Dot */}
                <View style={styles.cardHeader}>
                    <View style={styles.placeIconBox}>
                        <Image
                            source={{ uri: getPlaceById(item.businessRef)?.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100' }}
                            style={styles.placeImage}
                        />
                    </View>
                    <View style={styles.placeDetails}>
                        <View style={styles.nameRow}>
                            <Text style={styles.placeName} numberOfLines={1}>{item.placeName}</Text>
                            <View style={[styles.inlineStatusDot, { backgroundColor: type === 'vacant' ? '#22C55E' : type === 'medium' ? '#F59E0B' : '#EF4444' }]} />
                        </View>
                        <Text style={styles.placeCategory}>{t('places.communityReported')}</Text>
                    </View>
                </View>

                {/* Reporter Info */}
                <View style={styles.reporterRow}>
                    <Image
                        source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.reportBy?.split('@')[0] || t('places.user'))}&background=6366F1&color=fff` }}
                        style={styles.reporterAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.boldText}>{item.reportBy?.split('@')[0] || t('places.user')}</Text>
                            <Text style={styles.reportTime}>{formatTimeAgo(item.Timestamp)}</Text>
                        </View>
                        {/* <Text style={styles.reporterText} numberOfLines={2}>
                            {item.description || item.liveSituation}
                        </Text> */}
                    </View>
                </View>

                {/* Mood/Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: bannerStyle.bg, borderColor: bannerStyle.border }]}>
                    {/* <Ionicons name="flash" size={14} color={bannerStyle.text} style={{ marginRight: 6 }} /> */}
                    <Text style={[styles.statusBannerText, { color: bannerStyle.text }]}>{item.liveSituation}</Text>
                </View>

                {/* Footer: Stats and Type Badge */}
                <View style={styles.cardFooter}>
                    <View style={styles.statsContainer}>
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => toggleLike(item.id)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={20}
                                color={isLiked ? "#EF4444" : "#64748B"}
                            />
                            <Text style={[styles.statLabel, isLiked && { color: "#EF4444" }]}>
                                {item.likes?.length || 0}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => openComments(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
                            <Text style={styles.statLabel}>{item.commentsCount || 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={() => router.push(`/place/${item.businessRef}`)}
                        >
                            <Ionicons name="information-circle-outline" size={18} color="#64748B" />
                            <Text style={styles.statLabel}>{t('places.details')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: type === 'vacant' ? '#22C55E' : type === 'medium' ? '#F59E0B' : '#EF4444' }]}>
                        <Text style={styles.typeBadgeText}>{type.toUpperCase()}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('places.title')}</Text>
                <TouchableOpacity style={styles.circularButton}>
                    <Ionicons name="search-outline" size={20} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterBar}>
                <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
                    <Ionicons name="options-outline" size={22} color="#1E293B" />
                    <Text style={styles.filterButtonText}>{t('places.filter')}</Text>
                </TouchableOpacity>
            </View>

            {reportsLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={{ color: '#666', marginTop: 12 }}>{t('places.syncing')}</Text>
                </View>
            ) : filteredReports.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>{t('places.noMatching')}</Text>
                    <Text style={styles.emptySubtitle}>{t('places.adjustFilters')}</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredReports}
                    renderItem={renderReportCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.scrollList}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryTitle}>
                                {selectedType === 'All'
                                    ? t('places.liveFeedUpdates')
                                    : `${t('places.crowdLevel')}: ${t(`places.${selectedType}`)}`}
                            </Text>
                            <Text style={styles.summarySubtitle}>{t('places.showingReports', { count: filteredReports.length })}</Text>
                        </View>
                    )}
                />
            )}

            <CommentsModal
                isVisible={isCommentsVisible}
                onClose={() => setIsCommentsVisible(false)}
                report={activeReport}
            />

            {/* Queue Filtering Modal */}
            <Modal
                visible={filterVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFilterVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <TouchableOpacity
                        style={styles.modalDismissArea}
                        activeOpacity={1}
                        onPress={() => setFilterVisible(false)}
                    />
                    <View style={styles.filterSheet}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>{t('places.refineView')}</Text>
                            <TouchableOpacity onPress={() => setFilterVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#1E293B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.filterLabel}>{t('places.distance')}</Text>
                            <View style={styles.filterOptions}>
                                {[
                                    { value: 'Any', label: t('places.any') },
                                    { value: '1-5 km', label: t('places.distance1_5') },
                                    { value: '5-10 km', label: t('places.distance5_10') },
                                    { value: '10-20 km', label: t('places.distance10_20') },
                                    { value: '20+ km', label: t('places.distance20_plus') },
                                ].map(({ value, label }) => (
                                    <TouchableOpacity
                                        key={value}
                                        style={[styles.optionChip, selectedDistance === value && styles.activeChip]}
                                        onPress={() => setSelectedDistance(value)}
                                    >
                                        <Text style={[styles.optionText, selectedDistance === value && styles.activeChipText]}>{label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.filterLabel}>{t('places.crowdLevel')}</Text>
                            <View style={styles.filterOptions}>
                                {['All', 'vacant', 'medium', 'loaded'
                                ].map(s => {
                                    const color = s === 'vacant' ? '#22C55E' : s === 'medium' ? '#F59E0B' : s === 'loaded' ? '#EF4444' : '#64748B';
                                    const icon = s === 'vacant' ? 'leaf-outline' : s === 'medium' ? 'people-outline' : s === 'loaded' ? 'flame-outline' : 'apps-outline';
                                    const labelKey = s === 'All' ? 'places.all' : `places.${s}`;
                                    return (
                                        <TouchableOpacity
                                            key={s}
                                            style={[
                                                styles.statusChip,
                                                selectedType === s && { backgroundColor: color, borderColor: color }
                                            ]}
                                            onPress={() => setSelectedType(s)}
                                        >
                                            <Ionicons name={icon as any} size={16} color={selectedType === s ? '#fff' : color} />
                                            <Text style={[styles.statusChipText, { color: selectedType === s ? '#fff' : color }]}>{t(labelKey)}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={styles.filterLabel}>{t('places.storeType')}</Text>
                            <View style={styles.filterOptions}>
                                {[
                                    { value: 'All', label: t('places.all') },
                                    { value: 'Food', label: t('places.food') },
                                    { value: 'Fun', label: t('places.fun') },
                                    { value: 'Medical', label: t('places.medical') },
                                    { value: 'Shopping', label: t('places.shopping') },
                                ].map(({ value, label }) => (
                                    <TouchableOpacity
                                        key={value}
                                        style={[styles.optionChip, selectedCategory === value && styles.activeChip]}
                                        onPress={() => setSelectedCategory(value)}
                                    >
                                        <Text style={[styles.optionText, selectedCategory === value && styles.activeChipText]}>{label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterVisible(false)}>
                                <Text style={styles.applyBtnText}>{t('places.applyFilters')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resetBtn} onPress={() => {
                                setSelectedDistance('Any');
                                setSelectedType('All');
                                setSelectedCategory('All');
                            }}>
                                <Text style={styles.resetBtnText}>{t('places.resetDefault')}</Text>
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    circularButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 6,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    scrollList: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100,
    },
    summaryBox: {
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    summarySubtitle: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    placeIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
    },
    placeImage: {
        width: '100%',
        height: '100%',
    },
    placeDetails: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    placeName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        flex: 1,
    },
    inlineStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginLeft: 10,
    },
    placeCategory: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 1,
    },
    reporterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        backgroundColor: '#F8FAFC',
        padding: 8,
        borderRadius: 10,
    },
    reporterAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#fff',
    },
    reporterText: {
        fontSize: 13,
        color: '#334155',
        flex: 1,
    },
    boldText: {
        fontWeight: '700',
        color: '#0F172A',
    },
    reportTime: {
        fontSize: 12,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    statusBanner: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 16,
    },
    statusBannerText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statLabel: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end',
    },
    modalDismissArea: {
        flex: 1,
    },
    filterSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingTop: 12,
        maxHeight: '80%',
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 12,
        marginTop: 8,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    optionChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activeChip: {
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
    optionText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    activeChipText: {
        color: '#fff',
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        gap: 6,
    },
    statusChipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    applyBtn: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    applyBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    resetBtn: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    resetBtnText: {
        color: '#6366F1',
        fontSize: 14,
        fontWeight: '700',
    },
});
