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
    Text,
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
    const { searchHistory, performSearch } = usePlaces();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const displayName = userData?.display_name || userData?.email?.split('@')[0] || t('places.user');
    const profilePic = userData?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366F1&color=fff&size=80`;

    const handleSearch = async (queryOverride?: string) => {
        const query = (queryOverride || searchQuery).trim();
        if (!query) {
            router.push('/map');
            return;
        }

        Keyboard.dismiss();
        setIsSearching(true);

        try {
            await performSearch(query);

            let targetCoords = null;
            try {
                const results = await Location.geocodeAsync(query);
                if (results && results.length > 0) {
                    targetCoords = {
                        latitude: results[0].latitude,
                        longitude: results[0].longitude,
                    };
                }
            } catch (err) {
                console.warn('Geocoding failed in SearchBar, using context fallback');
            }

            router.push({
                pathname: '/search-results',
                params: {
                    query: query,
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

    return (
        <View style={styles.container}>
            <View style={styles.searchBarWrapper}>
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
                    onSubmitEditing={() => handleSearch()}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    returnKeyType="search"
                    autoCorrect={false}
                    editable={!isSearching}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => handleSearch()}
                    disabled={isSearching}
                >
                    {isSearching ? (
                        <ActivityIndicator size="small" color="#5356FF" />
                    ) : (
                        <Ionicons name="search" size={20} color="#5356FF" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Recent Searches - Only show when focused */}
            {isFocused && searchHistory.length > 0 && (
                <View style={styles.historyContainer}>
                    <Text style={styles.historyTitle}>{t('search.recentSearches')}</Text>
                    <View style={styles.historyChips}>
                        {searchHistory.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.historyChip}
                                onPress={() => {
                                    setSearchQuery(item);
                                    handleSearch(item);
                                }}
                            >
                                <Ionicons name="time-outline" size={14} color="#6366F1" />
                                <Text style={styles.historyChipText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    searchBarWrapper: {
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
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 10 : 0,
        fontSize: 16,
        color: '#333',
        height: 50,
        textAlignVertical: 'center',
    },
    clearIcon: {
        padding: 4,
        marginRight: 4,
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF0FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyContainer: {
        marginTop: 12,
        marginHorizontal: 25,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    historyTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    historyChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    historyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        gap: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    historyChipText: {
        fontSize: 13,
        color: '#1E293B',
        fontWeight: '600',
    },
});
