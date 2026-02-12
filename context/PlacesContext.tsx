import { db } from '@/configs/firebaseConfig';
import { MapsService, PlaceData } from '@/services/MapsService';
import * as ExpoLocation from 'expo-location';
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
});

export const usePlaces = () => useContext(PlacesContext);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, completeTask } = useUser();
    const { address, location } = useLocation();
    const [allPlaces, setAllPlaces] = useState<PlaceData[]>([]);
    const [searchResults, setSearchResults] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentSearchCenter, setCurrentSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
    const [currentSearchName, setCurrentSearchName] = useState<string | null>(null);
    const [isManualSearch, setIsManualSearch] = useState(false);

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



    // Fetch places using coordinates (used for GPS-based and geocoded searches)
    const fetchByCoordinates = async (lat: number, lng: number, searchName?: string) => {
        console.log(`[PlacesContext] Fetching places at: ${lat}, ${lng} (${searchName || 'GPS Location'})`);
        setLoading(true);

        try {
            const data = await MapsService.fetchPlacesByCoordinates(lat, lng);
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

    // Dedicated search function that returns data without affecting Home state
    const performSearch = async (locationName: string): Promise<PlaceData[]> => {
        console.log(`[PlacesContext] performSearch: "${locationName}"`);
        setLoading(true);
        try {
            let targetCoords: { latitude: number; longitude: number } | null = null;
            try {
                const geocodeResults = await ExpoLocation.geocodeAsync(locationName);
                if (geocodeResults && geocodeResults.length > 0) {
                    targetCoords = {
                        latitude: geocodeResults[0].latitude,
                        longitude: geocodeResults[0].longitude,
                    };
                }
            } catch (err) { }

            let data: PlaceData[] = [];
            if (targetCoords) {
                data = await MapsService.fetchPlacesByCoordinates(targetCoords.latitude, targetCoords.longitude);
            } else {
                data = await MapsService.fetchNearbyPlaces(locationName);
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

    // Legacy searchLocation - now uses performSearch but doesn't update allPlaces
    const searchLocation = async (locationName: string) => {
        await performSearch(locationName);
    };

    const resetSearch = () => {
        console.log('[PlacesContext] Resetting search to GPS location');
        setCurrentSearchCenter(null);
        setCurrentSearchName(null);
        setIsManualSearch(false);

        // Re-fetch using device GPS
        if (location) {
            fetchByCoordinates(location.latitude, location.longitude);
        }
    };

    const getPlaceById = (id: string) => {
        return allPlaces.find(p => p.id === id) || searchResults.find(p => p.id === id);
    };

    // Auto-fetch places when GPS location becomes available (and no manual search is active)
    useEffect(() => {
        const isFallbackActive = currentSearchName === 'Israel';

        if (!isManualSearch && (!currentSearchName || isFallbackActive)) {
            if (location) {
                // If we have a real location, and we haven't already fetched it (or we are on fallback)
                console.log(`[PlacesContext] Auto-fetching with GPS: ${location.latitude}, ${location.longitude}`);
                fetchByCoordinates(location.latitude, location.longitude);
            } else if (allPlaces.length === 0 && !loading) {
                // FALLBACK: Fetch general Israel places if location is denied or still loading
                const TEL_AVIV_COORDS = { latitude: 32.0853, longitude: 34.7818 };
                console.log('[PlacesContext] Location unavailable, fetching general Israel places (Tel Aviv)');
                fetchByCoordinates(TEL_AVIV_COORDS.latitude, TEL_AVIV_COORDS.longitude, 'Israel');
            }
        }
    }, [location, isManualSearch, currentSearchName]); // Removed 'loading' to prevent infinite loops

    // Memoize filtered arrays to prevent re-renders
    // Memoize filtered arrays to match Requirement 11 (4 rows)
    // Updated to prioritize "going-out" use case (bars, cafes, restaurants)
    const hotPlaces = useMemo(() => allPlaces.filter(p => p.category === 'hot'), [allPlaces]);
    const restaurants = useMemo(() => allPlaces.filter(p => p.category === 'restaurant'), [allPlaces]);

    const recommendedPlaces = useMemo(() => {
        const mustVisit = allPlaces.filter(p => p.category === 'mustVisit');
        // Fallback: If no "must visit" attractions, show top-rated places from any category
        return mustVisit.length > 0 ? mustVisit : [...allPlaces].sort((a, b) => b.rating - a.rating);
    }, [allPlaces]);

    const vibePlaces = useMemo(() => {
        const vibes = allPlaces.filter(p => p.category === 'fun' || p.category === 'casino' || p.category === 'shopping');
        // Fallback: If no specific "vibe" categories, show nightlife/bars (hot category)
        return vibes.length > 0 ? vibes : allPlaces.filter(p => p.category === 'hot');
    }, [allPlaces]);

    const trendingPlaces = allPlaces;

    return (
        <PlacesContext.Provider
            value={{
                allPlaces,
                trendingPlaces,
                hotPlaces,
                restaurants,
                recommendedPlaces,
                vibePlaces,
                searchResults,
                loading,
                performSearch,
                searchLocation,
                recordPlaceClick,
                resetSearch,
                getPlaceById,
                currentSearchCenter,
                currentSearchName,
            }}
        >
            {children}
        </PlacesContext.Provider>
    );
};
