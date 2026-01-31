import CommentsModal from '@/components/CommentsModal';
import { usePlaces } from '@/context/PlacesContext';
import { ReportData, useReports } from '@/context/ReportsContext';
import { useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlacesScreen() {
    const { reports, loading: reportsLoading, toggleLike } = useReports();
    const { loading: placesLoading } = usePlaces();
    const { user } = useUser();

    const [filterVisible, setFilterVisible] = useState(false);
    const [selectedType, setSelectedType] = useState('vacant');
    const [selectedDistance, setSelectedDistance] = useState('1-5 km');
    const [selectedCategory, setSelectedCategory] = useState('everything');

    const [isCommentsVisible, setIsCommentsVisible] = useState(false);
    const [activeReport, setActiveReport] = useState<ReportData | null>(null);

    const formatTimeAgo = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
                {/* Header: Icon, Name, Category, Status Dot */}
                <View style={styles.cardHeader}>
                    <View style={[styles.placeIconBox, { backgroundColor: bannerStyle.bg }]}>
                        <Ionicons name="location" size={24} color={bannerStyle.text} />
                    </View>
                    <View style={styles.placeDetails}>
                        <View style={styles.nameRow}>
                            <Text style={styles.placeName} numberOfLines={1}>{item.placeName}</Text>
                            <View style={[styles.inlineStatusDot, { backgroundColor: type === 'vacant' ? '#22C55E' : type === 'medium' ? '#F59E0B' : '#EF4444' }]} />
                        </View>
                        <Text style={styles.placeCategory}>Community Reported</Text>
                    </View>
                </View>

                {/* Reporter Info */}
                <View style={styles.reporterRow}>
                    <Image source={{ uri: `https://i.pravatar.cc/100?img=${avatarId}` }} style={styles.reporterAvatar} />
                    <Text style={styles.reporterText} numberOfLines={1}>
                        <Text style={styles.boldText}>{item.reportBy?.split('@')[0] || 'User'}</Text> sent an update
                    </Text>
                    <Text style={styles.reportTime}>{formatTimeAgo(item.Timestamp)}</Text>
                </View>

                {/* Mood/Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: bannerStyle.bg, borderColor: bannerStyle.border }]}>
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

                        <View style={styles.statItem}>
                            <Text> </Text>
                        </View>
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
                <Text style={styles.headerTitle}>Real-time reports</Text>
                <TouchableOpacity style={styles.circularButton}>
                    <Ionicons name="search-outline" size={20} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterBar}>
                <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
                    <Ionicons name="options-outline" size={22} color="#1E293B" />
                    <Text style={styles.filterButtonText}>Filter</Text>
                </TouchableOpacity>
            </View>

            {reportsLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={{ color: '#666', marginTop: 12 }}>Syncing community reports...</Text>
                </View>
            ) : reports.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>No reports yet</Text>
                    <Text style={styles.emptySubtitle}>Be the first to report a crowd situation near you!</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderReportCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.scrollList}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryTitle}>Live Feed Updates</Text>
                            <Text style={styles.summarySubtitle}>Check the latest crowd reports from neighboring spots</Text>
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
                            <Text style={styles.sheetTitle}>Refine View</Text>
                            <TouchableOpacity onPress={() => setFilterVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#1E293B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.filterLabel}>Distance</Text>
                            <View style={styles.filterOptions}>
                                {['1-5 km', '5-10 km', '10-20 km', '20+ km'].map(d => (
                                    <TouchableOpacity
                                        key={d}
                                        style={[styles.optionChip, selectedDistance === d && styles.activeChip]}
                                        onPress={() => setSelectedDistance(d)}
                                    >
                                        <Text style={[styles.optionText, selectedDistance === d && styles.activeChipText]}>{d}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.filterLabel}>Crowd Level</Text>
                            <View style={styles.filterOptions}>
                                {[
                                    { id: 'vacant', color: '#22C55E', icon: 'leaf-outline' },
                                    { id: 'medium', color: '#F59E0B', icon: 'people-outline' },
                                    { id: 'loaded', color: '#EF4444', icon: 'flame-outline' }
                                ].map(s => (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[
                                            styles.statusChip,
                                            selectedType === s.id && { backgroundColor: s.color, borderColor: s.color }
                                        ]}
                                        onPress={() => setSelectedType(s.id)}
                                    >
                                        <Ionicons name={s.icon as any} size={16} color={selectedType === s.id ? '#fff' : s.color} />
                                        <Text style={[styles.statusChipText, { color: selectedType === s.id ? '#fff' : s.color }]}>{s.id.charAt(0).toUpperCase() + s.id.slice(1)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.filterLabel}>Store Type</Text>
                            <View style={styles.filterOptions}>
                                {['Food', 'Fun', 'Medical', 'Shopping', 'All'].map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.optionChip, selectedCategory === c && styles.activeChip]}
                                        onPress={() => setSelectedCategory(c)}
                                    >
                                        <Text style={[styles.optionText, selectedCategory === c && styles.activeChipText]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterVisible(false)}>
                                <Text style={styles.applyBtnText}>Apply Filters</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resetBtn} onPress={() => {
                                setSelectedDistance('1-5 km');
                                setSelectedType('vacant');
                                setSelectedCategory('All');
                            }}>
                                <Text style={styles.resetBtnText}>Reset to default</Text>
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
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
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
