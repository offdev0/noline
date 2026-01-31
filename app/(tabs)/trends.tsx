import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const moods = [
    { id: '1', label: 'calm', icon: 'heart', colors: ['#FFF9C4', '#FFF176'], iconColor: '#FBC02D' },
    { id: '2', label: 'social', icon: 'heart', colors: ['#E3F2FD', '#90CAF9'], iconColor: '#1976D2' },
    { id: '3', label: 'adventurous', icon: 'heart', colors: ['#FFEBEE', '#EF9A9A'], iconColor: '#D32F2F' },
    { id: '4', label: 'spontaneous', icon: 'heart', colors: ['#E8F5E9', '#A5D6A7'], iconColor: '#388E3C' },
];

const trendingPlaces = [
    {
        id: '1',
        name: 'Sacher Garden',
        description: 'Peaceful park for morning walks',
        distance: '0.8 km',
        status: 'vacant',
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300'
    },
    {
        id: '2',
        name: 'The Social Club',
        description: 'Vibrant spot for evening drinks',
        distance: '1.5 km',
        status: 'vacant',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300'
    },
];

const favorites = [
    { id: '1', name: 'Coffee House', status: 'loaded', statusColor: '#EF4444', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300' },
    { id: '2', name: 'Uniqlo Store', status: 'loaded', statusColor: '#EF4444', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300' },
    { id: '3', name: 'Tech Store', status: 'loaded', statusColor: '#EF4444', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300' },
];

export default function TrendsScreen() {
    const router = useRouter();

    const handlePlacePress = (id: string) => {
        router.push({
            pathname: '/place/[id]',
            params: { id }
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hamburger Menu */}
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="menu" size={28} color="#333" />
                </TouchableOpacity>

                {/* Main Title */}
                <Text style={styles.mainTitle}>What do you want now?</Text>

                {/* Mood Selection */}
                <View style={styles.moodContainer}>
                    {moods.map((mood) => (
                        <View key={mood.id} style={styles.moodItem}>
                            <TouchableOpacity activeOpacity={0.8}>
                                <LinearGradient
                                    colors={mood.colors as any}
                                    style={styles.moodCircle}
                                >
                                    <Ionicons name={mood.icon as any} size={24} color={mood.iconColor} />
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text style={[styles.moodLabel, { color: mood.iconColor }]}>{mood.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Trending Places */}
                <View style={styles.trendingSection}>
                    {trendingPlaces.map((place, index) => (
                        <TouchableOpacity
                            key={place.id}
                            style={styles.placeCard}
                            onPress={() => handlePlacePress(place.id)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.placeInfo}>
                                <View>
                                    <Text style={styles.placeName}>{place.name}</Text>
                                    <Text style={styles.placeDescription}>[{place.description}]</Text>
                                    <Text style={styles.placeDistance}>[{index + 1}] from you</Text>
                                </View>
                                <View style={styles.placeStatusContainer}>
                                    <View style={styles.statusRow}>
                                        <View style={styles.statusDot} />
                                        <Text style={styles.statusText}>{place.status}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.visitButton}>
                                        <Text style={styles.visitButtonText}>Visit now</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {index === 1 && (
                                <Image source={{ uri: place.image }} style={styles.placeImage} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Favorites Section */}
                <View style={styles.favoritesSection}>
                    <View style={styles.favoritesHeader}>
                        <Ionicons name="heart" size={24} color="#EF4444" />
                        <Text style={styles.favoritesTitle}>Your favorites</Text>
                    </View>
                    <Text style={styles.favoritesSubtitle}>Always available with one click</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favoritesScroll}>
                        {favorites.map((fav) => (
                            <TouchableOpacity
                                key={fav.id}
                                style={styles.favoriteCard}
                                onPress={() => handlePlacePress(fav.id)}
                            >
                                <Image source={{ uri: fav.image }} style={styles.favImage} />
                                <View style={styles.favContent}>
                                    <Text style={styles.favName} numberOfLines={1}>{fav.name}</Text>
                                    <TouchableOpacity style={styles.goBackButton} activeOpacity={0.8}>
                                        <Text style={styles.goBackText}>Go back ...</Text>
                                    </TouchableOpacity>

                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    menuButton: {
        marginTop: 10,
        marginBottom: 20,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 40,
    },
    moodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    moodItem: {
        alignItems: 'center',
        width: (width - 60) / 4,
    },
    moodCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    moodLabel: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    trendingSection: {
        gap: 16,
    },
    placeCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        // marginBottom: 16,
    },
    placeInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    placeDescription: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
    placeDistance: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 8,
    },
    placeStatusContainer: {
        alignItems: 'flex-end',
        gap: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    statusText: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '500',
    },
    visitButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    visitButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    placeImage: {
        width: '100%',
        height: 150,
        borderRadius: 16,
        marginTop: 16,
    },
    favoritesSection: {
        marginTop: 40,
        paddingBottom: 20,
    },
    favoritesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    favoritesTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    favoritesSubtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 4,
        marginBottom: 20,
    },
    favoritesScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    favoriteCard: {
        backgroundColor: '#fff',
        width: 160,
        borderRadius: 20,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
        marginBottom: 16,
    },
    favImage: {
        width: '100%',
        height: 100,
    },
    favContent: {
        padding: 12,
    },
    favName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    goBackButton: {
        backgroundColor: '#F97316',
        paddingVertical: 6,
        borderRadius: 15,
        marginBottom: 8,
    },
    goBackText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    favStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    loadedText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '500',
    },
    favStatusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    bottomPadding: {
        height: 100,
    }
});
