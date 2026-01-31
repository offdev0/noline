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
    mustVisitPlaces: PlaceData[];
    restaurants: PlaceData[];
    casinos: PlaceData[];
    hotPlaces: PlaceData[];
    shopping: PlaceData[];
    funPlaces: PlaceData[];
    loading: boolean;
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
    mustVisitPlaces: [],
    restaurants: [],
    casinos: [],
    hotPlaces: [],
    shopping: [],
    funPlaces: [],
    loading: false,
    searchLocation: async () => { },
    resetSearch: () => { },
    recordPlaceClick: async () => { },
    getPlaceById: () => undefined,
    currentSearchCenter: null,
    currentSearchName: null,
});

export const usePlaces = () => useContext(PlacesContext);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const { address, location } = useLocation();
    const [allPlaces, setAllPlaces] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentSearchCenter, setCurrentSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
    const [currentSearchName, setCurrentSearchName] = useState<string | null>(null);
    const [isManualSearch, setIsManualSearch] = useState(false);

    const saveSearchHistory = async (query: string, searchAddress: string | null, businessId: string | null = null) => {
        if (!user) return;

        try {
            await addDoc(collection(db, 'SearchHistory'), {
                searchedString: query,
                searchedOn: serverTimestamp(),
                searchedBy: doc(db, 'users', user.uid),
                businessRef: businessId ? doc(db, 'Business', businessId) : null,
                searchedAddress: searchAddress || query,
                HsearchedString: query.toLowerCase(),
            });
            console.log('[PlacesContext] Search history saved');
        } catch (error) {
            console.error('[PlacesContext] Error saving search history:', error);
        }
    };

    const recordPlaceClick = async (place: PlaceData) => {
        await saveSearchHistory(place.name, place.address, place.id);
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
            }
        } catch (error) {
            console.error('[PlacesContext] Error fetching by coordinates:', error);
        } finally {
            setLoading(false);
        }
    };

    // Main search function - geocodes city name to coordinates first
    const searchLocation = async (locationName: string, isManual: boolean = true) => {
        console.log(`[PlacesContext] searchLocation: "${locationName}", isManual: ${isManual}`);

        if (isManual) {
            setIsManualSearch(true);
        }
        setLoading(true);
        setCurrentSearchName(locationName);

        try {
            // Step 1: Geocode the location name to get coordinates
            let targetCoords: { latitude: number; longitude: number } | null = null;

            try {
                const geocodeResults = await ExpoLocation.geocodeAsync(locationName);
                if (geocodeResults && geocodeResults.length > 0) {
                    targetCoords = {
                        latitude: geocodeResults[0].latitude,
                        longitude: geocodeResults[0].longitude,
                    };
                    console.log(`[PlacesContext] Geocoded "${locationName}" to: ${targetCoords.latitude}, ${targetCoords.longitude}`);
                }
            } catch (geocodeError) {
                console.warn('[PlacesContext] Geocoding failed:', geocodeError);
            }

            // Step 2: If we have coordinates, use coordinate-based fetch for richer results
            if (targetCoords) {
                const data = await MapsService.fetchPlacesByCoordinates(
                    targetCoords.latitude,
                    targetCoords.longitude
                );
                console.log(`[PlacesContext] Fetched ${data.length} places for ${locationName}`);
                setAllPlaces(data);
                setCurrentSearchCenter(targetCoords);
            } else {
                // Fallback to text-based search
                console.log('[PlacesContext] Using text-based fallback');
                const data = await MapsService.fetchNearbyPlaces(locationName);
                setAllPlaces(data);
                if (data.length > 0) {
                    setCurrentSearchCenter(data[0].location);
                }
            }

            // Save to history
            await saveSearchHistory(locationName, locationName);

        } catch (error) {
            console.error('[PlacesContext] Error in searchLocation:', error);
        } finally {
            setLoading(false);
        }
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
        return allPlaces.find(p => p.id === id);
    };

    // Auto-fetch places when GPS location becomes available (and no manual search is active)
    useEffect(() => {
        if (location && !isManualSearch && !currentSearchName && allPlaces.length === 0) {
            console.log(`[PlacesContext] Auto-fetching with GPS: ${location.latitude}, ${location.longitude}`);
            fetchByCoordinates(location.latitude, location.longitude);
        }
    }, [location, isManualSearch, currentSearchName]);

    // Memoize filtered arrays to prevent re-renders
    const mustVisitPlaces = useMemo(() => allPlaces.filter(p => p.category === 'mustVisit'), [allPlaces]);
    const restaurants = useMemo(() => allPlaces.filter(p => p.category === 'restaurant'), [allPlaces]);
    const casinos = useMemo(() => allPlaces.filter(p => p.category === 'casino'), [allPlaces]);
    const hotPlaces = useMemo(() => allPlaces.filter(p => p.category === 'hot'), [allPlaces]);
    const shopping = useMemo(() => allPlaces.filter(p => p.category === 'shopping'), [allPlaces]);
    const funPlaces = useMemo(() => allPlaces.filter(p => p.category === 'fun'), [allPlaces]);
    const trendingPlaces = allPlaces;

    return (
        <PlacesContext.Provider
            value={{
                allPlaces,
                trendingPlaces,
                mustVisitPlaces,
                restaurants,
                casinos,
                hotPlaces,
                shopping,
                funPlaces,
                loading,
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
