import { useLanguage } from '@/context/LanguageContext';
import { usePlaces } from '@/context/PlacesContext';
import { t } from '@/i18n';
import { formatDistance } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const isLatinText = (value: string) => /[A-Za-z]/.test(value) && /^[\x00-\x7F]*$/.test(value);

export default function CategoryScreen() {
    const { id } = useLocalSearchParams() as { id: string };
    const router = useRouter();
    const { language } = useLanguage();
    const { allPlaces, loading } = usePlaces();

    const filtered = useMemo(() => {
        if (!id || !allPlaces.length) return allPlaces || [];
        
        const categoryKey = id.toLowerCase();
        
        return allPlaces.filter(place => {
            const placeCat = (place.category || '').toLowerCase();
            const name = (place.name || '').toLowerCase();
            const desc = (place.description || '').toLowerCase();
            
            // Map common keys to MapsService internal categories
            if (categoryKey === 'food' || categoryKey === 'restaurant') {
                return placeCat === 'restaurant';
            }
            if (categoryKey === 'cafe' || categoryKey === 'coffee') {
                // Since MapsService maps cafes to 'restaurant', we also check keywords
                return placeCat === 'restaurant' && (name.includes('cafe') || name.includes('coffee') || desc.includes('coffee') || desc.includes('cafe'));
            }
            if (categoryKey === 'bars' || categoryKey === 'bar') {
                // Since MapsService maps bars to 'hot'
                return placeCat === 'hot' || placeCat === 'bar' || name.includes('bar') || desc.includes('bar') || name.includes('pub');
            }
            if (categoryKey === 'desserts' || categoryKey === 'dessert') {
                return placeCat === 'restaurant' && (name.includes('cake') || name.includes('dessert') || name.includes('bakery') || desc.includes('sweet'));
            }
            
            return placeCat === categoryKey || name.includes(categoryKey);
        });
    }, [id, allPlaces]);

    const renderCard = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.premiumCard} 
            onPress={() => router.push({ pathname: '/place/[id]', params: { id: item.id } })} 
            activeOpacity={0.9}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.cardCover}
                contentFit="cover"
            />
            <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                    <View style={styles.nameContent}>
                        <Text style={[styles.placeName, language === 'he' && isLatinText(item.name) && styles.ltrText]}>{item.name}</Text>
                        <Text style={styles.placeAddress} numberOfLines={1}>{item.address}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating || 4.5}</Text>
                    </View>
                </View>
                <View style={styles.cardFooter}>
                    <View style={styles.metaRow}>
                        <Ionicons name="location-sharp" size={14} color="#6366F1" />
                        <Text style={styles.distanceText}>{formatDistance(item.distance)} away</Text>
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: item.status === 'vacant' ? '#DCFCE7' : '#F1F5F9' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'vacant' ? '#15803D' : '#64748B' }]}>
                            {item.status === 'vacant' ? 'No Wait' : 'Open'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const getTitle = () => {
        if (!id) return '';
        const catTrans = t(`categories.${id}`);
        if (catTrans !== `categories.${id}`) return catTrans;
        
        const placeTrans = t(`places.${id}`);
        if (placeTrans !== `places.${id}`) return placeTrans;
        
        return id.charAt(0) ? id.charAt(0).toUpperCase() + id.slice(1) : id.toUpperCase();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.title}>{getTitle()}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={filtered}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.emptyText}>{loading ? t('common.loading') : t('places.noMatching')}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    backButton: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: '#F1F5F9', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    title: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
    listContent: { padding: 20, paddingBottom: 40 },
    premiumCard: { 
        backgroundColor: '#fff', 
        borderRadius: 24, 
        overflow: 'hidden', 
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardCover: { width: '100%', height: 180 },
    cardBody: { padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    nameContent: { flex: 1, marginRight: 12 },
    placeName: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
    placeAddress: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    ratingBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#FFFBE8', 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 8,
        gap: 4
    },
    ratingText: { fontSize: 13, fontWeight: '700', color: '#92400E' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    distanceText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, color: '#64748B', marginTop: 16, fontWeight: '600' },
    ltrText: { writingDirection: 'ltr', textAlign: 'left' }
});
