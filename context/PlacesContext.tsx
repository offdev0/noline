import { MapsService, PlaceData } from '@/services/MapsService';
import * as ExpoLocation from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from './LocationContext';

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
    getPlaceById: () => undefined,
    currentSearchCenter: null,
    currentSearchName: null,
});

export const usePlaces = () => useContext(PlacesContext);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
    const { address } = useLocation();
    const [allPlaces, setAllPlaces] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentSearchCenter, setCurrentSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
    const [currentSearchName, setCurrentSearchName] = useState<string | null>(null);

    const searchLocation = async (locationName: string) => {
        setLoading(true);
        setCurrentSearchName(locationName);
        try {
            // 1. Fetch places first - this gives us actual venue data and a fallback location
            const data = await MapsService.fetchNearbyPlaces(locationName);
            setAllPlaces(data);

            // 2. Try to geocode for the exact city center
            try {
                const geocodeResults = await ExpoLocation.geocodeAsync(locationName);
                if (geocodeResults && geocodeResults.length > 0) {
                    setCurrentSearchCenter({
                        latitude: geocodeResults[0].latitude,
                        longitude: geocodeResults[0].longitude,
                    });
                } else if (data.length > 0) {
                    // Fallback to first place location if geocoding yields no results
                    setCurrentSearchCenter(data[0].location);
                }
            } catch (geocodeError) {
                console.warn('Native geocoding failed, using place fallback:', geocodeError);
                if (data.length > 0) {
                    setCurrentSearchCenter(data[0].location);
                }
            }
        } catch (error) {
            console.error('Error searching location:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetSearch = () => {
        setCurrentSearchCenter(null);
        setCurrentSearchName(null);
        if (address) {
            searchLocation(address);
        }
    };

    const getPlaceById = (id: string) => {
        return allPlaces.find(p => p.id === id);
    };

    // Auto-search when location address changes
    useEffect(() => {
        if (address && address !== 'Location available' && address !== 'Unknown location' && !currentSearchName) {
            searchLocation(address);
        }
    }, [address]);

    const mustVisitPlaces = allPlaces.filter(p => p.category === 'mustVisit');
    const restaurants = allPlaces.filter(p => p.category === 'restaurant');
    const casinos = allPlaces.filter(p => p.category === 'casino');
    const hotPlaces = allPlaces.filter(p => p.category === 'hot');
    const shopping = allPlaces.filter(p => p.category === 'shopping');
    const funPlaces = allPlaces.filter(p => p.category === 'fun');
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
