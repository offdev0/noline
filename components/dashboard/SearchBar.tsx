import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { usePlaces } from '@/context/PlacesContext';
import { useUser } from '@/context/UserContext';
import { t } from '@/i18n';

export default function SearchBar() {
    const router = useRouter();
    const { userData } = useUser();
    const { searchLocation, allPlaces } = usePlaces();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const displayName = userData?.display_name || userData?.email?.split('@')[0] || t('places.user');
    const profilePic = userData?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366F1&color=fff&size=80`;

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            router.push('/map');
            return;
        }

        Keyboard.dismiss();
        setIsSearching(true);

        try {
            // 1. Update global places and search center in context
            // searchLocation now handles its own internal geocoding with fallbacks
            await searchLocation(searchQuery.trim());

            // 2. Try to get coordinates for deep navigation
            let targetCoords = null;
            try {
                const results = await Location.geocodeAsync(searchQuery.trim());
                if (results && results.length > 0) {
                    targetCoords = {
                        latitude: results[0].latitude,
                        longitude: results[0].longitude,
                    };
                }
            } catch (err) {
                console.warn('Geocoding failed in SearchBar, using context fallback');
            }

            // 3. Navigate to dedicated search results page
            router.push({
                pathname: '/search-results',
                params: {
                    query: searchQuery.trim(),
                    lat: targetCoords?.latitude.toString(),
                    lon: targetCoords?.longitude.toString(),
                }
            });
        } catch (error: any) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInputFocus = () => {
        // Optionally navigate to a dedicated search screen
        // For now, we'll keep the inline search
    };

    return (
        <View style={styles.searchContainer}>
            <Image
                source={{ uri: profilePic }}
                style={styles.avatar}
            />
            <TextInput
                placeholder={t('search.placeholder')}
                style={styles.searchInput}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCorrect={false}
                editable={!isSearching}
            />
            <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                disabled={isSearching}
            >
                {isSearching ? (
                    <ActivityIndicator size="small" color="#5356FF" />
                ) : (
                    <Ionicons name="search" size={20} color="#5356FF" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 30,
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 24,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 10 : 0, // Prevent Android clipping
        fontSize: 16,
        color: '#333',
        height: 50,
        textAlignVertical: 'center', // Ensure vertical alignment
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF0FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
