import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FavoritesSectionProps {
    favorites: any[];
    language: string;
    onViewAll: () => void;
    onPressPlace: (place: any) => void;
}

const isLatinText = (value: string) => /[A-Za-z]/.test(value) && /^[\x00-\x7F]*$/.test(value);

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
    favorites,
    language,
    onViewAll,
    onPressPlace,
}) => {
    const favoritePreview = favorites.slice(0, 6);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('trends.yourFavorites')}</Text>
                {favorites.length > 0 && (
                    <TouchableOpacity onPress={onViewAll}>
                        <Text style={styles.seeMore}>{t('trends.seeAll')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {favorites.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Ionicons name="heart-outline" size={40} color="#CBD5E1" />
                    <Text style={styles.emptyText}>{t('trends.favoritesEmpty')}</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {favoritePreview.map((place) => (
                        <TouchableOpacity
                            key={place.id}
                            style={styles.card}
                            onPress={() => onPressPlace(place)}
                            activeOpacity={0.9}
                        >
                            <Image
                                source={{ uri: place.image }}
                                style={styles.image}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                transition={200}
                            />
                            <View style={styles.content}>
                                <Text
                                    style={[
                                        styles.name,
                                        language === 'he' && isLatinText(place.name) && styles.ltrText
                                    ]}
                                    numberOfLines={1}
                                >
                                    {place.name}
                                </Text>
                                <View style={styles.meta}>
                                    <View style={styles.ratingGroup}>
                                        <Ionicons name="star" size={12} color="#FFD700" />
                                        <Text style={styles.rating}>{place.rating?.toFixed(1) || '4.5'}</Text>
                                    </View>
                                    <View style={[styles.statusGroup, {
                                        backgroundColor: place.status === 'vacant' ? '#DCFCE7'
                                            : place.status === 'medium' ? '#FEF3C7' : '#FEE2E2'
                                    }]}>
                                        <View style={[styles.statusDot, {
                                            backgroundColor: place.status === 'vacant' ? '#22C55E'
                                                : place.status === 'medium' ? '#F59E0B' : '#EF4444'
                                        }]} />
                                        <Text style={[styles.statusText, {
                                            color: place.status === 'vacant' ? '#166534'
                                                : place.status === 'medium' ? '#92400E' : '#991B1B'
                                        }]}>
                                            {t(`places.${place.status}`)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    seeMore: { fontSize: 13, fontWeight: '800', color: '#6366F1' },
    emptyBox: {
        paddingVertical: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    emptyText: {
        marginTop: 10,
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 110,
    },
    content: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    ratingGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 12,
        fontWeight: '800',
        color: '#1E293B',
    },
    statusGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'capitalize',
    },
    ltrText: {
        writingDirection: 'ltr',
        textAlign: 'left',
    },
});
