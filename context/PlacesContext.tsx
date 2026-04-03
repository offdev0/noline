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
    leisurePlaces: PlaceData[];
    searchResults: PlaceData[];
    loading: boolean;
    performSearch: (locationName: string) => Promise<PlaceData[]>;
    searchLocation: (locationName: string) => Promise<void>;
    resetSearch: () => void;
    recordPlaceClick: (place: PlaceData) => Promise<void>;
    getPlaceById: (id: string) => PlaceData | undefined;
    fetchPlaceByIdAsync: (id: string) => Promise<PlaceData | null>;
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
    leisurePlaces: [],
    searchResults: [],
    loading: false,
    performSearch: async () => [],
    searchLocation: async () => { },
    resetSearch: () => { },
    recordPlaceClick: async () => { },
    getPlaceById: () => undefined,
    fetchPlaceByIdAsync: async () => null,
    currentSearchCenter: null,
    currentSearchName: null,
    searchHistory: [],
    addToHistory: () => { },
});

export const usePlaces = () => useContext(PlacesContext);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
    const { language } = useLanguage();
    const { user, completeTask } = useUser();
    const { address, location, permissionStatus } = useLocation();
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

    const fetchByCoordinates = async (lat: number, lng: number, searchName?: string, isIsraelFallback?: boolean) => {
        console.log(`[PlacesContext] Fetching places at: ${lat}, ${lng} (${searchName || 'GPS Location'})`);
        setLoading(true);

        try {
            let data: PlaceData[];

            if (isIsraelFallback) {
                // For Israel fallback (no GPS): restrict strictly to Israel bounding box
                data = await MapsService.fetchPlacesByCoordinates(lat, lng, language, 15000, true);
            } else {
                // For GPS location: start with 10km, expand to 20km if not enough results
                data = await MapsService.fetchPlacesByCoordinates(lat, lng, language, 10000, false);
                if (data.length < 10) {
                    console.log(`[PlacesContext] Only ${data.length} results within 10km, expanding to 20km`);
                    data = await MapsService.fetchPlacesByCoordinates(lat, lng, language, 20000, false);
                }
            }

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

    // Track last fetched location to prevent jitter updates
    const lastFetchedCoords = React.useRef<{ lat: number, lng: number } | null>(null);

    const fetchByCoordinatesWithCheck = async (lat: number, lng: number, searchName?: string, isIsraelFallback?: boolean) => {
        if (lastFetchedCoords.current) {
            const dist = MapsService.getRawDistance(lat, lng, lastFetchedCoords.current.lat, lastFetchedCoords.current.lng);
            if (dist < 0.5 && !searchName) { // Don't re-fetch if moved less than 500m
                console.log('[PlacesContext] Skipping fetch, user moved < 500m');
                return;
            }
        }
        lastFetchedCoords.current = { lat, lng };
        return fetchByCoordinates(lat, lng, searchName, isIsraelFallback);
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

            // Recalculate distances from user's actual base location (GPS or Israel fallback)
            const baseCoords = (permissionStatus === 'granted' && location)
                ? location
                : { latitude: 32.0853, longitude: 34.7818 };

            data = data.map(place => ({
                ...place,
                distance: MapsService.calculateDistance(
                    baseCoords.latitude,
                    baseCoords.longitude,
                    place.location.latitude,
                    place.location.longitude
                )
            }));

            setSearchResults(data);
            // Sync with allPlaces removed to keep dashboard on current location
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
        setSearchResults([]);
    };

    const getPlaceById = (id: string) => {
        return allPlaces.find(p => p.id === id) || searchResults.find(p => p.id === id);
    };

    const fetchPlaceByIdAsync = async (id: string): Promise<PlaceData | null> => {
        // First check in current lists
        const existing = getPlaceById(id);
        if (existing) return existing;

        try {
            const fetched = await MapsService.fetchPlaceById(id, language);
            if (fetched) {
                // Prepend to allPlaces so it is cached in the local current session
                setAllPlaces(prev => [fetched, ...prev]);
                return fetched;
            }
        } catch (error) {
            console.error('[PlacesContext] fetchPlaceByIdAsync Error:', error);
        }
        return null;
    };

    useEffect(() => {
        const isFallbackActive = currentSearchName === 'Israel';

        // Auto-fetch logic: only use GPS if permission is explicitly granted
        if (!isManualSearch && (!currentSearchName || isFallbackActive)) {
            if (location && permissionStatus === 'granted') {
                console.log(`[PlacesContext] Auto-fetching with GPS: ${location.latitude}, ${location.longitude}`);
                fetchByCoordinatesWithCheck(location.latitude, location.longitude, undefined, false);
            } else if (!loading && (permissionStatus === 'denied' || (permissionStatus && permissionStatus !== 'granted') || (!location && permissionStatus))) {
                // When GPS is OFF or denied → strictly Israel only (Tel Aviv)
                const TEL_AVIV_COORDS = { latitude: 32.0853, longitude: 34.7818 };
                console.log(`[PlacesContext] Location unavailable (status: ${permissionStatus}), fetching Israel-only places`);
                fetchByCoordinatesWithCheck(TEL_AVIV_COORDS.latitude, TEL_AVIV_COORDS.longitude, 'Israel', true);
            }
        }
    }, [location, permissionStatus, isManualSearch, currentSearchName, language]);

    const filteredPlaces = useMemo(() => allPlaces.filter(p => !p.isLeisure), [allPlaces]);
    const leisurePlaces = useMemo(() => allPlaces.filter(p => p.isLeisure), [allPlaces]);

    const memoizedHotPlaces = useMemo(() => filteredPlaces.filter(p => p.category === 'hot'), [filteredPlaces]);
    const memoizedRestaurants = useMemo(() => filteredPlaces.filter(p => p.category === 'restaurant'), [filteredPlaces]);
    const memoizedRecommendedPlaces = useMemo(() => {
        const mustVisit = filteredPlaces.filter(p => p.category === 'mustVisit');
        return mustVisit.length > 0 ? mustVisit : [...filteredPlaces].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }, [filteredPlaces]);
    const memoizedVibePlaces = useMemo(() => {
        const vibes = filteredPlaces.filter(p => p.category === 'fun' || p.category === 'casino' || p.category === 'shopping');
        return vibes.length > 0 ? vibes : filteredPlaces.filter(p => p.category === 'hot');
    }, [filteredPlaces]);

    return (
        <PlacesContext.Provider
            value={{
                allPlaces,
                trendingPlaces: filteredPlaces,
                hotPlaces: memoizedHotPlaces,
                restaurants: memoizedRestaurants,
                recommendedPlaces: memoizedRecommendedPlaces,
                vibePlaces: memoizedVibePlaces,
                leisurePlaces,
                searchResults,
                loading,
                performSearch,
                searchLocation,
                recordPlaceClick,
                resetSearch,
                getPlaceById,
                fetchPlaceByIdAsync,
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
