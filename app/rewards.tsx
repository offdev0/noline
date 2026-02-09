import { ALL_MEDALS, useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RewardsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {
        user,
        userData,
        level,
        points,
        streak,
        medal,
        medalName,
        nextMedalName,
        xpInLevel,
        targetXp,
        progressToNextLevel,
        isMaxLevel
    } = useUser();

    const userName = userData?.display_name || user?.displayName || user?.email?.split('@')[0] || 'Explorer';
    const DEFAULT_PROFILE_PIC = 'https://imgs.search.brave.com/Fu2vzE7rwzQnr00qao9hegfrI2z1fW5tQy1qs01eMe4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5na2V5LmNvbS9w/bmcvZGV0YWlsLzEy/MS0xMjE5MjMxX3Vz/ZXItZGVmYXVsdC1w/cm9maWxlLnBuZw';
    const profilePic = userData?.photo_url || user?.photoURL || DEFAULT_PROFILE_PIC;

    const reportsLeft = isMaxLevel ? 0 : Math.ceil((targetXp - xpInLevel) / 20); // 20 XP per report (10 + 10)

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.topReportersButton} onPress={() => router.push('/top-reporters')}>
                    <Ionicons name="trophy" size={20} color="#FFD700" />
                    <Text style={styles.topReportersText}>Top Reporters</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.pageTitle}>Your progress</Text>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: profilePic }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{userName}</Text>
                    <View style={[styles.levelBadge, isMaxLevel && { backgroundColor: '#FCD34D' }]}>
                        <Text style={[styles.levelBadgeText, isMaxLevel && { color: '#92400E' }]}>
                            {isMaxLevel ? 'MAX LEVEL' : `Level ${level}`}
                        </Text>
                    </View>
                </View>

                {/* XP Progress Section */}
                <View style={styles.card}>
                    <View style={styles.progressHeader}>
                        <View style={styles.medalIconWrapper}>
                            {medal ? (
                                <Image source={medal} style={styles.progressMedal} resizeMode="cover" />
                            ) : (
                                <Ionicons name="medal" size={32} color="#94A3B8" />
                            )}
                        </View>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressTitle}>
                                {isMaxLevel ? 'Ultimate Legend' : `${medalName} - Keep growing!`}
                            </Text>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBar, { width: `${progressToNextLevel}%` }]} />
                            </View>
                            <Text style={styles.xpText}>
                                {isMaxLevel ? `${points} Total XP` : `${xpInLevel} / ${targetXp} XP to the next level`}
                            </Text>
                            {!isMaxLevel && (
                                <Text style={styles.hintText}>
                                    You're {reportsLeft} reports away from your next medal!
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Streak Card */}
                {streak >= 2 && (
                    <View style={styles.card}>
                        <View style={styles.streakRow}>
                            <View style={styles.streakIconWrapper}>
                                <Ionicons name="flame" size={24} color="#FF6B00" />
                            </View>
                            <View style={styles.streakInfo}>
                                <Text style={styles.streakTitle}>Streak: {streak} days in a row</Text>
                                <Text style={styles.streakSubtitle}>{streak >= 7 ? "You're a legend! Keep it up!" : "Almost a whole week! Crazy."}</Text>
                            </View>
                        </View>
                    </View>
                )}



                {/* Achievements */}
                <View style={styles.achievementsSection}>
                    <Text style={styles.achievementsSectionTitle}>Your achievements</Text>
                    <View style={styles.achievementsGrid}>
                        {ALL_MEDALS.map((medalAsset, index) => {
                            const medalLevel = index + 1;
                            const isEarned = level >= medalLevel;

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.achievementCircle,
                                        isEarned && styles.achievementCircleEarned
                                    ]}
                                >
                                    {isEarned ? (
                                        <TouchableOpacity onPress={() => router.push('/top-reporters')} activeOpacity={0.8}>
                                            <Image
                                                source={medalAsset}
                                                style={styles.achievementMedal}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    ) : (
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={24}
                                            color="#CBD5E1"
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        padding: 8,
    },
    topReportersButton: {
        alignItems: 'center',
    },
    topReportersText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 2,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 20,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
        backgroundColor: '#F1F5F9',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    levelBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    levelBadgeText: {
        color: '#6366F1',
        fontWeight: '700',
        fontSize: 14,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row',
    },
    medalIconWrapper: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    progressMedal: {
        width: 80,
        height: 80,
    },
    progressInfo: {
        flex: 1,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 4,
    },
    xpText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    hintText: {
        fontSize: 12,
        color: '#8B5CF6',
        fontWeight: '600',
        textAlign: 'center',
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    streakInfo: {
        flex: 1,
    },
    streakTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    streakSubtitle: {
        fontSize: 14,
        color: '#64748B',
    },
    missionsButton: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    missionsButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    taskIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    taskSubtitle: {
        fontSize: 14,
        color: '#64748B',
    },
    separator: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 16,
    },
    achievementsSection: {
        marginTop: 24,
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    achievementsSectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 20,
    },
    achievementsGrid: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    achievementCircle: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    achievementCircleEarned: {
        // Remove background and border as per user preference for a "clean" look
    },
    achievementMedal: {
        width: 60,
        height: 60,
    }
});
