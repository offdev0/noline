import { db } from '@/configs/firebaseConfig';
import { useLanguage } from '@/context/LanguageContext';
import { usePlaces } from '@/context/PlacesContext';
import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDocs, limit, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RecentPlace {
    id: string;
    name: string;
    address: string;
    rating: number;
    image: string;
    searchedOn: Date;
}

const isLatinText = (value: string) => /[A-Za-z]/.test(value) && /^[\x00-\x7F]*$/.test(value);

export default function HistoryScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { language } = useLanguage();
    const { getPlaceById } = usePlaces();
    const [recentlyVisited, setRecentlyVisited] = useState<RecentPlace[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const fetchSearchHistory = async () => {
        if (!user) {
            setLoadingHistory(false);
            return;
        }
        try {
            const userRef = doc(db, 'users', user.uid);
            const historyQuery = query(
                collection(db, 'SearchHistory'),
                where('searchedBy', '==', userRef),
                limit(50)
            );
            const snapshot = await getDocs(historyQuery);
            const places: RecentPlace[] = [];
            const seenPlaceIds = new Set<string>();
            const processedData = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as any))
                .filter(d => {
                    const uid = d.searchedBy?.id || d.searchedBy?.path?.split('/').pop();
                    return uid === user.uid && d.businessRef;
                })
                .sort((a, b) => (b.searchedOn?.seconds || 0) - (a.searchedOn?.seconds || 0));

            for (const data of processedData) {
                const businessRef = data.businessRef;
                const placeId = businessRef.id || businessRef.path?.split('/').pop();
                if (!placeId || seenPlaceIds.has(placeId)) continue;
                seenPlaceIds.add(placeId);
                const placeFromContext = getPlaceById(placeId);
                places.push({
                    id: placeId,
                    name: data.searchedString || 'Unknown Place',
                    address: data.searchedAddress || 'Address not available',
                    rating: placeFromContext?.rating || data.rating || 4.2,
                    image: placeFromContext?.image || data.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
                    searchedOn: data.searchedOn?.toDate() || new Date(),
                });
                if (places.length >= 20) break;
            }
            setRecentlyVisited(places);
        } catch (error) {
            console.error('Error fetching search history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchSearchHistory(); }, [user]));

    const handleNavigate = (placeId: string) => {
        router.push({ pathname: '/place/[id]', params: { id: placeId } });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.history')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loadingHistory ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="small" color="#6366F1" />
                    </View>
                ) : recentlyVisited.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Ionicons name="location-outline" size={40} color="#CBD5E1" />
                        <Text style={styles.emptyText}>{t('route.noHistory')}</Text>
                    </View>
                ) : (
                    recentlyVisited.map((place) => (
                        <TouchableOpacity
                            key={place.id}
                            style={styles.recentCard}
                            onPress={() => handleNavigate(place.id)}
                            activeOpacity={0.9}
                        >
                            <Image
                                source={{ uri: place.image }}
                                style={styles.recentImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                transition={200}
                            />
                            <View style={styles.recentContent}>
                                <Text style={[styles.recentName, language === 'he' && isLatinText(place.name) && styles.ltrText]} numberOfLines={1}>{place.name}</Text>
                                <Text style={styles.recentAddress} numberOfLines={1}>{place.address}</Text>
                                <View style={styles.recentMeta}>
                                    <Ionicons name="star" size={12} color="#FFD700" />
                                    <Text style={styles.recentRating}>{place.rating.toFixed(1)}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    scrollContent: { padding: 20 },
    loadingBox: { paddingVertical: 30, alignItems: 'center' },
    emptyBox: {
        paddingVertical: 30,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    emptyText: { marginTop: 10, fontSize: 14, color: '#94A3B8', fontWeight: '500' },
    recentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    recentImage: { width: 60, height: 60, borderRadius: 14 },
    recentContent: { flex: 1, marginLeft: 14 },
    recentName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
    recentAddress: { fontSize: 12, color: '#64748B', marginBottom: 4 },
    recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    recentRating: { fontSize: 12, fontWeight: '700', color: '#92400E' },
    ltrText: { writingDirection: 'ltr', textAlign: 'left' },
});
