import { db } from '@/configs/firebaseConfig';
import { MapsService, PlaceData } from '@/services/MapsService';
import * as ExpoLocation from 'expo-location';
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useLocation } from './LocationContext';
import { useUser } from './UserContext';

interface PlacesContextType {
    allPlaces: PlaceData[];
    trendingPlaces: PlaceData[];
    hotPlaces: PlaceData[];
    restaurants: PlaceData[];
    recommendedPlaces: PlaceData[];
    vibePlaces: PlaceData[];
    searchResults: PlaceData[];
    loading: boolean;
    performSearch: (locationName: string) => Promise<PlaceData[]>;
    searchLocation: (locationName: string) => Promise<void>;
    resetSearch: () => void;
    recordPlaceClick: (place: PlaceData) => Promise<void>;
    getPlaceById: (id: string) => PlaceData | undefined;
    currentSearchCenter: { latitude: number; longitude: number } | null;
    currentSearchName: string | null;
    searchHistory: string[];
    addToHistory: (query: string) => void;
}

const PlacesContext = createContext<PlacesContextType>({
    allPlaces: [],
    trendingPlaces: [],
    hotPlaces: [],
    restaurants: [],
    recommendedPlaces: [],
    vibePlaces: [],
    searchResults: [],
    loading: false,
    performSearch: async () => [],
    searchLocation: async () => { },
    resetSearch: () => { },
    recordPlaceClick: async () => { },
    getPlaceById: () => undefined,
    currentSearchCenter: null,
    currentSearchName: null,
    searchHistory: [],
    addToHistory: () => { },
});

export const usePlaces = () => useContext(PlacesContext);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
    const { language } = useLanguage();
    const { user, completeTask } = useUser();
    const { address, location } = useLocation();
    const [allPlaces, setAllPlaces] = useState<PlaceData[]>([]);
    const [searchResults, setSearchResults] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentSearchCenter, setCurrentSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
    const [currentSearchName, setCurrentSearchName] = useState<string | null>(null);
    const [isManualSearch, setIsManualSearch] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    const addToHistory = (query: string) => {
        if (!query.trim()) return;
        setSearchHistory(prev => {
            const trimmed = query.trim();
            const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
            return [trimmed, ...filtered].slice(0, 7);
        });
    };

    const saveSearchHistory = async (
        query: string,
        searchAddress: string | null,
        businessId: string | null = null,
        imageUrl: string | null = null,
        rating: number | null = null
    ) => {
        if (!user) return;

        try {
            await addDoc(collection(db, 'SearchHistory'), {
                searchedString: query,
                searchedOn: serverTimestamp(),
                searchedBy: doc(db, 'users', user.uid),
                businessRef: businessId ? doc(db, 'Business', businessId) : null,
                searchedAddress: searchAddress || query,
                HsearchedString: query.toLowerCase(),
                imageUrl: imageUrl,
                rating: rating
            });
            console.log('[PlacesContext] Search history saved');
        } catch (error) {
            console.error('[PlacesContext] Error saving search history:', error);
        }
    };

    const recordPlaceClick = async (place: PlaceData) => {
        await saveSearchHistory(place.name, place.address, place.id, place.image, place.rating);
    };

    const fetchByCoordinates = async (lat: number, lng: number, searchName?: string) => {
        console.log(`[PlacesContext] Fetching places at: ${lat}, ${lng} (${searchName || 'GPS Location'})`);
        setLoading(true);

        try {
            const data = await MapsService.fetchPlacesByCoordinates(lat, lng, language);
            console.log(`[PlacesContext] Received ${data.length} places`);
            setAllPlaces(data);
            setCurrentSearchCenter({ latitude: lat, longitude: lng });
            if (searchName) {
                setCurrentSearchName(searchName);
                await saveSearchHistory(searchName, searchName);
            } else {
                setCurrentSearchName(null);
            }
        } catch (error) {
            console.error('[PlacesContext] Error fetching by coordinates:', error);
        } finally {
            setLoading(false);
        }
    };

    const performSearch = async (locationName: string): Promise<PlaceData[]> => {
        const queryWithIsrael = locationName.toLowerCase().includes('israel')
            ? locationName
            : `${locationName}, Israel`;

        console.log(`[PlacesContext] performSearch: "${queryWithIsrael}"`);
        setLoading(true);
        try {
            addToHistory(locationName);

            let targetCoords: { latitude: number; longitude: number } | null = null;
            try {
                const geocodeResults = await ExpoLocation.geocodeAsync(queryWithIsrael);
                if (geocodeResults && geocodeResults.length > 0) {
                    targetCoords = {
                        latitude: geocodeResults[0].latitude,
                        longitude: geocodeResults[0].longitude,
                    };
                }
            } catch (err) { }

            let data: PlaceData[] = [];
            if (targetCoords) {
                data = await MapsService.fetchPlacesByCoordinates(targetCoords.latitude, targetCoords.longitude, language);
            } else {
                data = await MapsService.fetchNearbyPlaces(queryWithIsrael, language);
            }

            if (targetCoords) {
                data.sort((a, b) => {
                    const distA = MapsService.getRawDistance(targetCoords!.latitude, targetCoords!.longitude, a.location.latitude, a.location.longitude);
                    const distB = MapsService.getRawDistance(targetCoords!.latitude, targetCoords!.longitude, b.location.latitude, b.location.longitude);
                    return distA - distB;
                });
            }

            setSearchResults(data);
            await saveSearchHistory(locationName, locationName);
            return data;
        } catch (error) {
            console.error('[PlacesContext] performSearch Error:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const searchLocation = async (locationName: string) => {
        setIsManualSearch(true);
        await performSearch(locationName);
    };

    const resetSearch = () => {
        console.log('[PlacesContext] Resetting search to GPS location');
        setCurrentSearchCenter(null);
        setCurrentSearchName(null);
        setIsManualSearch(false);

        if (location) {
            fetchByCoordinates(location.latitude, location.longitude);
        }
    };

    const getPlaceById = (id: string) => {
        return allPlaces.find(p => p.id === id) || searchResults.find(p => p.id === id);
    };

    useEffect(() => {
        const isFallbackActive = currentSearchName === 'Israel';

        if (!isManualSearch && (!currentSearchName || isFallbackActive)) {
            if (location) {
                console.log(`[PlacesContext] Auto-fetching with GPS: ${location.latitude}, ${location.longitude}`);
                fetchByCoordinates(location.latitude, location.longitude);
            } else if (allPlaces.length === 0 && !loading) {
                const TEL_AVIV_COORDS = { latitude: 32.0853, longitude: 34.7818 };
                console.log('[PlacesContext] Location unavailable, fetching general Israel places (Tel Aviv)');
                fetchByCoordinates(TEL_AVIV_COORDS.latitude, TEL_AVIV_COORDS.longitude, 'Israel');
            }
        }
    }, [location, isManualSearch, currentSearchName, language]);

    const memoizedHotPlaces = useMemo(() => allPlaces.filter(p => p.category === 'hot'), [allPlaces]);
    const memoizedRestaurants = useMemo(() => allPlaces.filter(p => p.category === 'restaurant'), [allPlaces]);
    const memoizedRecommendedPlaces = useMemo(() => {
        const mustVisit = allPlaces.filter(p => p.category === 'mustVisit');
        return mustVisit.length > 0 ? mustVisit : [...allPlaces].sort((a, b) => b.rating - a.rating);
    }, [allPlaces]);
    const memoizedVibePlaces = useMemo(() => {
        const vibes = allPlaces.filter(p => p.category === 'fun' || p.category === 'casino' || p.category === 'shopping');
        return vibes.length > 0 ? vibes : allPlaces.filter(p => p.category === 'hot');
    }, [allPlaces]);

    return (
        <PlacesContext.Provider
            value={{
                allPlaces,
                trendingPlaces: allPlaces,
                hotPlaces: memoizedHotPlaces,
                restaurants: memoizedRestaurants,
                recommendedPlaces: memoizedRecommendedPlaces,
                vibePlaces: memoizedVibePlaces,
                searchResults,
                loading,
                performSearch,
                searchLocation,
                recordPlaceClick,
                resetSearch,
                getPlaceById,
                currentSearchCenter,
                currentSearchName,
                searchHistory,
                addToHistory,
            }}
        >
            {children}
        </PlacesContext.Provider>
    );
};
