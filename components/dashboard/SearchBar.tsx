import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { usePlaces } from '@/context/PlacesContext';
import { useUser } from '@/context/UserContext';

const DEFAULT_PROFILE_PIC = 'https://imgs.search.brave.com/Fu2vzE7rwzQnr00qao9hegfrI2z1fW5tQy1qs01eMe4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5na2V5LmNvbS9w/bmcvZGV0YWlsLzEy/MS0xMjE5MjMxX3Vz/ZXItZGVmYXVsdC1w/cm9maWxlLnBuZw';

export default function SearchBar() {
    const router = useRouter();
    const { userData } = useUser();
    const { searchLocation, allPlaces } = usePlaces();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const profilePic = userData?.photo_url || DEFAULT_PROFILE_PIC;

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

            // 3. Navigate with the best available data
            router.push({
                pathname: '/map',
                params: {
                    searchQuery: searchQuery.trim(),
                    latitude: targetCoords?.latitude.toString(),
                    longitude: targetCoords?.longitude.toString(),
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
                placeholder="Search for a place or address"
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
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#333',
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
