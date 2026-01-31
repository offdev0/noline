import { MapsService, PlaceData } from '@/services/MapsService';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from './LocationContext';

interface PlacesContextType {
    trendingPlaces: PlaceData[];
    mustVisitPlaces: PlaceData[];
    restaurants: PlaceData[];
    casinos: PlaceData[];
    hotPlaces: PlaceData[];
    shopping: PlaceData[];
    funPlaces: PlaceData[];
    loading: boolean;
    searchLocation: (locationName: string) => Promise<void>;
}

const PlacesContext = createContext<PlacesContextType>({
    trendingPlaces: [],
    mustVisitPlaces: [],
    restaurants: [],
    casinos: [],
    hotPlaces: [],
    shopping: [],
    funPlaces: [],
    loading: false,
    searchLocation: async () => { },
});

export const usePlaces = () => useContext(PlacesContext);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
    const { address } = useLocation();
    const [allPlaces, setAllPlaces] = useState<PlaceData[]>([]);
    const [loading, setLoading] = useState(false);

    const searchLocation = async (locationName: string) => {
        setLoading(true);
        try {
            const data = await MapsService.fetchNearbyPlaces(locationName);
            setAllPlaces(data);
        } catch (error) {
            console.error('Error searching location:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-search when location address changes
    useEffect(() => {
        if (address && address !== 'Location available' && address !== 'Unknown location') {
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
                trendingPlaces,
                mustVisitPlaces,
                restaurants,
                casinos,
                hotPlaces,
                shopping,
                funPlaces,
                loading,
                searchLocation,
            }}
        >
            {children}
        </PlacesContext.Provider>
    );
};
