import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

import { useUser } from './UserContext';

const LOCATION_STORAGE_KEY = '@user_location';
const PROMPT_HISTORY_KEY = '@location_prompt_history';

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

            if (existingStatus !== Location.PermissionStatus.GRANTED) {
                // Check prompt frequency
                const promptData = await AsyncStorage.getItem(PROMPT_HISTORY_KEY);
                const now = Date.now();
                let prompts: number[] = promptData ? JSON.parse(promptData) : [];

                // Filter out prompts older than 24 hours
                prompts = prompts.filter(p => now - p < 24 * 60 * 60 * 1000);
                const promptsInLast24Hrs = prompts.length;

                if (promptsInLast24Hrs >= 2) {
                    // Check if the very first prompt of these 2 was more than 5 mins ago
                    const firstPromptOfPeriod = prompts[0];
                    if (now - firstPromptOfPeriod < 15 * 60 * 1000) {
                        // We already did 2 prompts in the "grace" 5-min window
                        console.log('[LocationContext] Skipping prompt: Already did 2 in 5-min window');
                        setLoading(false);
                        return;
                    }

                    // If we are outside the 5-min window, we only allow one per 24h
                    // Since we already have >= 1 prompt in last 24h, we skip
                    console.log('[LocationContext] Skipping prompt: Once per 24h limit reached');
                    setLoading(false);
                    return;
                } else if (promptsInLast24Hrs === 1) {
                    // We allowed one prompt, checking if we can allow a second one
                    const firstPrompt = prompts[0];
                    if (now - firstPrompt > 15 * 60 * 1000) {
                        // Only 1 prompt allowed per 24h after the initial 5-min window
                        console.log('[LocationContext] Skipping prompt: Initial 5-min window closed, 24h limit applies');
                        setLoading(false);
                        return;
                    }
                    // Proceed with second prompt within 5 mins
                }

                // Request permission
                const { status } = await Location.requestForegroundPermissionsAsync();
                setPermissionStatus(status);

                // Save this prompt attempt
                prompts.push(now);
                await AsyncStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(prompts));

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

    // Auto-request location when user logs in or app state changes
    useEffect(() => {
        if (!user || loading || permissionStatus === Location.PermissionStatus.GRANTED) return;

        // Initial prompt after a short delay
        const timer = setTimeout(() => {
            requestLocation();
        }, 1000);

        // Re-check periodically in first 5 mins to handle the "twice in 5 mins" requirement
        const interval = setInterval(() => {
            Location.getForegroundPermissionsAsync().then(({ status }) => {
                if (status !== Location.PermissionStatus.GRANTED) {
                    requestLocation();
                }
            });
        }, 60 * 1000); // Check every 1 min (less aggressive than before)

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [user, permissionStatus]); // Removed 'loading' and 'requestLocation' to prevent infinite loops

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
