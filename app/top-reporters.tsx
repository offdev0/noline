import { db } from '@/configs/firebaseConfig';
import { ALL_MEDALS, useUser } from '@/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEFAULT_PROFILE_PIC = 'https://imgs.search.brave.com/Fu2vzE7rwzQnr00qao9hegfrI2z1fW5tQy1qs01eMe4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5na2V5LmNvbS9w/bmcvZGV0YWlsLzEy/MS0xMjE5MjMxX3Vz/ZXItZGVmYXVsdC1w/cm9maWxlLnBuZw';

export default function TopReportersScreen() {
    const router = useRouter();
    const [users, setUsers] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(true);

    const { user } = useUser();
    const [error, setError] = useState<string | null>(null);

    const getLevelFromPoints = (points: number) => {
        const thresholds = [0, 50, 150, 300, 500];
        let level = 1;
        for (let i = thresholds.length - 1; i >= 0; i--) {
            if ((points || 0) >= thresholds[i]) {
                level = i + 1;
                break;
            }
        }
        return Math.min(Math.max(level, 1), 5);
    };

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(100));
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
            setUsers(list);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error('TopReporters snapshot error', err);
            setError(err?.message || 'Failed to load leaderboard');
            setUsers([]);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const rawName = item.displayName || item.display_name || (item.email ? item.email.split('@')[0] : 'Explorer');
        const isCurrentUser = !!user && item.id === user.uid;
        const name = isCurrentUser ? 'You' : rawName;
        const avatar = item.photo_url || item.photoURL || DEFAULT_PROFILE_PIC;
        const level = getLevelFromPoints(item.points || 0);
        const medalAsset: any = ALL_MEDALS[level - 1] || ALL_MEDALS[0];

        return (
            <View style={[styles.row, isCurrentUser ? styles.currentUserRow : null]}>
                <View style={styles.rankCircle}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                </View>

                <Image source={{ uri: avatar }} style={styles.avatar} />

                <View style={styles.info}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.name}>{name}</Text>
                        <Image source={medalAsset} style={styles.medalIcon} />
                    </View>
                    <Text style={styles.subtitle}>{item.email || ''}</Text>
                </View>

                <View style={styles.pointsBox}>
                    <Text style={styles.points}>{item.points || 0}</Text>
                    <Text style={styles.pointsLabel}>XP</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Top Reporters</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loading}><ActivityIndicator size="large" color="#6366F1" /></View>
            ) : error ? (
                <View style={{ padding: 20 }}>
                    <Text style={{ color: '#DC2626', fontWeight: '700', marginBottom: 8 }}>Unable to load leaderboard</Text>
                    <Text style={{ color: '#64748B' }}>{error}</Text>
                    <Text style={{ color: '#64748B', marginTop: 8 }}>Check your Firestore rules or sign in with an account that can read the users collection.</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
    backButton: { padding: 8 },
    title: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    currentUserRow: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' },
    rankCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rankText: { fontWeight: '800', color: '#6366F1' },
    avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#F1F5F9' },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    subtitle: { fontSize: 12, color: '#94A3B8' },
    medalIcon: { width: 28, height: 28, marginLeft: 6 },
    pointsBox: { alignItems: 'flex-end' },
    points: { fontSize: 16, fontWeight: '900', color: '#111827' },
    pointsLabel: { fontSize: 12, color: '#94A3B8' },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
