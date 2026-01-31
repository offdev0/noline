import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useUser } from './UserContext';

const LOCATION_STORAGE_KEY = '@user_location';

export interface LocationCoords {
    latitude: number;
    longitude: number;
}

export interface StoredLocation {
    coords: LocationCoords;
    address: string | null;
    updatedAt: string;
}

interface LocationContextType {
    location: LocationCoords | null;
    address: string | null;
    loading: boolean;
    error: string | null;
    permissionStatus: Location.PermissionStatus | null;
    requestLocation: () => Promise<void>;
    refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
    location: null,
    address: null,
    loading: false,
    error: null,
    permissionStatus: null,
    requestLocation: async () => { },
    refreshLocation: async () => { },
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const [location, setLocation] = useState<LocationCoords | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

    // Load saved location from AsyncStorage on mount
    useEffect(() => {
        const loadStoredLocation = async () => {
            try {
                const storedData = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
                if (storedData) {
                    const parsed: StoredLocation = JSON.parse(storedData);
                    console.log('Loaded stored location:', parsed);
                    setLocation(parsed.coords);
                    setAddress(parsed.address);
                }
            } catch (err) {
                console.log('Error loading stored location:', err);
            }
        };

        loadStoredLocation();
    }, []);

    // Save location to AsyncStorage
    const saveLocationLocally = useCallback(async (coords: LocationCoords, addr: string | null) => {
        try {
            const dataToStore: StoredLocation = {
                coords,
                address: addr,
                updatedAt: new Date().toISOString(),
            };
            await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(dataToStore));
            console.log('Location saved locally');
        } catch (err) {
            console.error('Error saving location locally:', err);
        }
    }, []);

    // Get reverse geocoded address
    const getAddress = useCallback(async (coords: LocationCoords): Promise<string | null> => {
        try {
            const [result] = await Location.reverseGeocodeAsync({
                latitude: coords.latitude,
                longitude: coords.longitude,
            });

            if (result) {
                const addressParts = [
                    result.street,
                    result.city,
                    result.region,
                ].filter(Boolean);
                return addressParts.join(', ') || 'Unknown location';
            }
            return 'Location available';
        } catch (err) {
            console.log('Could not get address:', err);
            return 'Location available';
        }
    }, []);

    // Request location permission and get current location
    const requestLocation = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Check current permission status
            const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

            if (existingStatus !== 'granted') {
                // Request permission
                const { status } = await Location.requestForegroundPermissionsAsync();
                setPermissionStatus(status);

                if (status !== 'granted') {
                    setError('Location permission denied');
                    Alert.alert(
                        'Location Permission',
                        'Please enable location permissions in your device settings to see places near you.',
                        [{ text: 'OK' }]
                    );
                    setLoading(false);
                    return;
                }
            } else {
                setPermissionStatus(existingStatus);
            }

            // Get current location
            console.log('Getting current location...');
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const coords: LocationCoords = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            };

            console.log('Location obtained:', coords);
            setLocation(coords);

            // Get address
            const addr = await getAddress(coords);
            setAddress(addr);

            // Save locally
            await saveLocationLocally(coords, addr);

        } catch (err: any) {
            console.error('Error getting location:', err);
            setError(err.message || 'Failed to get location');
        } finally {
            setLoading(false);
        }
    }, [getAddress, saveLocationLocally]);

    // Refresh location (when user manually wants to update)
    const refreshLocation = useCallback(async () => {
        if (permissionStatus === 'granted' || permissionStatus === null) {
            await requestLocation();
        }
    }, [permissionStatus, requestLocation]);

    // Auto-request location when user logs in
    useEffect(() => {
        if (user && !location && !loading) {
            // Small delay to let the app settle
            const timer = setTimeout(() => {
                requestLocation();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    return (
        <LocationContext.Provider
            value={{
                location,
                address,
                loading,
                error,
                permissionStatus,
                requestLocation,
                refreshLocation,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};
