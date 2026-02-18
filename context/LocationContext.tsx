import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';

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

    // Load saved location and check permission on mount
    useEffect(() => {
        const initLocation = async () => {
            try {
                // Check current permission status immediately
                const { status } = await Location.getForegroundPermissionsAsync();
                setPermissionStatus(status);

                const storedData = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
                if (storedData) {
                    const parsed: StoredLocation = JSON.parse(storedData);
                    console.log('Loaded stored location:', parsed);
                    setLocation(parsed.coords);
                    setAddress(parsed.address);
                }
            } catch (err) {
                console.log('Error initializing location:', err);
            }
        };

        initLocation();
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

            if (existingStatus !== Location.PermissionStatus.GRANTED) {
                // Request permission
                const { status } = await Location.requestForegroundPermissionsAsync();
                setPermissionStatus(status);

                if (status !== Location.PermissionStatus.GRANTED) {
                    setError('Location permission denied');
                    Alert.alert(
                        'Location Required',
                        'We value your privacy, but NoLine works best with location to show you real-time queues nearby in Israel. Still want to proceed without it?',
                        [
                            { text: 'Keep Disabled', style: 'cancel' },
                            {
                                text: 'Enable in Settings', onPress: () => {
                                    if (Platform.OS === 'ios') Linking.openURL('app-settings:');
                                    else Linking.openSettings();
                                }
                            }
                        ]
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
        if (permissionStatus === Location.PermissionStatus.GRANTED || permissionStatus === null) {
            await requestLocation();
        }
    }, [permissionStatus, requestLocation]);

    // Auto-request location when app state changes or on mount
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active') {
                Location.getForegroundPermissionsAsync().then(({ status }) => {
                    setPermissionStatus(status);
                    if (status !== Location.PermissionStatus.GRANTED && user) {
                        requestLocation();
                    }
                });
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Initial check if user is logged in
        if (user && permissionStatus !== Location.PermissionStatus.GRANTED && !loading) {
            requestLocation();
        }

        return () => {
            subscription.remove();
        };
    }, [user, permissionStatus, requestLocation]);

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
