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

export default function SearchBar() {
    const router = useRouter();
    const { searchLocation } = usePlaces();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            router.push('/map');
            return;
        }

        Keyboard.dismiss();
        setIsSearching(true);

        try {
            // Updated global places based on search
            await searchLocation(searchQuery.trim());

            // Geocode for map navigation
            const results = await Location.geocodeAsync(searchQuery.trim());
            if (results && results.length > 0) {
                const { latitude, longitude } = results[0];
                router.push({
                    pathname: '/map',
                    params: {
                        searchQuery: searchQuery.trim(),
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                    }
                });
            }
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
                source={{ uri: 'https://i.pravatar.cc/100?img=33' }}
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
