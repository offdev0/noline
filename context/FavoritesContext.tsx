import { PlaceData } from '@/services/MapsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

interface FavoritesContextType {
    favorites: PlaceData[];
    toggleFavorite: (place: PlaceData) => Promise<void>;
    isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
    favorites: [],
    toggleFavorite: async () => { },
    isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoritesContext);

const FAVORITES_STORAGE_KEY = '@jyoti_favorites';

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
    const { completeTask } = useUser();
    const [favorites, setFavorites] = useState<PlaceData[]>([]);

    // Load favorites from AsyncStorage on mount
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
                if (storedFavorites) {
                    setFavorites(JSON.parse(storedFavorites));
                }
            } catch (error) {
                console.error('Error loading favorites:', error);
            }
        };
        loadFavorites();
    }, []);

    const toggleFavorite = async (place: PlaceData) => {
        try {
            let nextFavorites;
            const exists = favorites.some(f => f.id === place.id);

            if (exists) {
                nextFavorites = favorites.filter(f => f.id !== place.id);
            } else {
                nextFavorites = [...favorites, place];
            }

            setFavorites(nextFavorites);
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const isFavorite = (id: string) => {
        return favorites.some(f => f.id === id);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
