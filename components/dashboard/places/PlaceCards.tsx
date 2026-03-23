import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlaceBadge } from './PlaceBadge';

const { width } = Dimensions.get('window');
export const CARD_MARGIN = 20;
export const FULL_CARD_WIDTH = width - (CARD_MARGIN * 2);
export const GRID_CARD_WIDTH = (width - (CARD_MARGIN * 2) - 12) / 2;

export interface PlaceProps {
    id: string;
    name: string;
    rating: number;
    category: string;
    queueStatus: string;
    distance: string;
    image: string;
    status: string;
}

export const FeaturedCard = ({ place, onPress }: { place: PlaceProps; onPress: () => void }) => (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.cardImageContainer}>
            <Image source={{ uri: place.image }} style={styles.cardImage} contentFit="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardGradient} />

            <View style={styles.topBadgeContainer}>
                <PlaceBadge type="hot" text={t('places.hotStatus')} />
                <PlaceBadge type="star" text={place.rating} />
            </View>

            <View style={styles.cardContentOverlay}>
                <Text style={styles.cardNameLarge}>{place.name}</Text>
                <Text style={styles.cardDetailText}>{t('places.veryPopular')} • {place.queueStatus} • {place.distance} {t('places.away')}</Text>
            </View>
        </View>
        <View style={styles.cardFooter}>
            <Ionicons name="star" size={14} color="#94A3B8" />
            <Text style={styles.footerText}>{place.distance} • {place.queueStatus}</Text>
        </View>
    </TouchableOpacity>
);

export const GridCard = ({ place, onPress }: { place: PlaceProps; onPress: () => void }) => (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.gridImageContainer}>
            <Image source={{ uri: place.image }} style={styles.gridImage} contentFit="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.cardGradient} />

            <View style={styles.topBadgeContainer}>
                {place.status === 'vacant' && <PlaceBadge type="nowait" text={t('places.noWaitStatus')} />}
                <View style={{ flex: 1 }} />
                <PlaceBadge type="star" text={place.rating} />
            </View>

            <View style={styles.cardContentOverlaySmall}>
                <Text style={styles.cardNameSmall} numberOfLines={1}>{place.name}</Text>
                <Text style={styles.cardDetailTextSmall} numberOfLines={1}>
                    {place.status === 'vacant' ? t('places.greatForDate') : t('places.greatDrinks')}
                </Text>
                <View style={styles.inlineDistance}>
                    <Ionicons name="location-sharp" size={10} color="#fff" />
                    <Text style={styles.cardDetailTextSmall}> {place.distance} • {t('places.open')}</Text>
                </View>
            </View>
        </View>
        <View style={styles.cardFooter}>
            <Ionicons name="location-sharp" size={12} color="#94A3B8" />
            <Text style={styles.footerTextSmall}>{place.distance} • {t('places.open')}</Text>
        </View>
    </TouchableOpacity>
);

export const ListCard = ({ place, onPress }: { place: PlaceProps; onPress: () => void }) => (
    <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.listImageContainer}>
            <Image source={{ uri: place.image }} style={styles.listImage} contentFit="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.cardGradient} />
            <View style={styles.topBadgeContainer}>
                <View style={{ flex: 1 }} />
                <PlaceBadge type="star" text={place.rating} />
            </View>
            <View style={styles.cardContentOverlay}>
                <Text style={styles.cardNameLarge}>{place.name}</Text>
                <Text style={styles.cardDetailText}>{place.queueStatus} • {place.distance} {t('places.away')}</Text>
            </View>
        </View>
        <View style={styles.cardFooter}>
            <Ionicons name="location-sharp" size={14} color="#94A3B8" />
            <Text style={styles.footerText}>{place.distance} • {place.queueStatus}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    cardGradient: { ...StyleSheet.absoluteFillObject },
    topBadgeContainer: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    featuredCard: {
        width: FULL_CARD_WIDTH,
        marginHorizontal: CARD_MARGIN,
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    cardImageContainer: { height: 160, position: 'relative' },
    cardImage: { width: '100%', height: '100%' },
    cardContentOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16 },
    cardNameLarge: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
    cardDetailText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
    cardFooter: { height: 38, backgroundColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    footerText: { color: '#64748B', fontWeight: '600', fontSize: 14, marginLeft: 6 },
    gridCard: {
        width: GRID_CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    gridImageContainer: { height: 120, position: 'relative' },
    gridImage: { width: '100%', height: '100%' },
    cardContentOverlaySmall: { position: 'absolute', bottom: 10, left: 10, right: 10 },
    cardNameSmall: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
    cardDetailTextSmall: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    inlineDistance: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    footerTextSmall: { color: '#64748B', fontWeight: '600', fontSize: 12, marginLeft: 4 },
    listCard: {
        width: FULL_CARD_WIDTH,
        marginHorizontal: CARD_MARGIN,
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
    listImageContainer: { height: 160, position: 'relative' },
    listImage: { width: '100%', height: '100%' },
});
