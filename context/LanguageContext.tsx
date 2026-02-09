import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type LanguageCode = 'en' | 'he';

interface LanguageContextType {
    language: LanguageCode;
    loading: boolean;
    setLanguage: (language: LanguageCode) => Promise<void>;
}

const STORAGE_KEY = 'app.language';

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    loading: true,
    setLanguage: async () => { },
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<LanguageCode>('en');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored === 'en' || stored === 'he') {
                    setLanguageState(stored);
                }
            } catch {
                // Ignore storage errors and fall back to default
            } finally {
                setLoading(false);
            }
        };

        loadLanguage();
    }, []);

    const setLanguage = useCallback(async (next: LanguageCode) => {
        setLanguageState(next);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Ignore storage errors
        }
    }, []);

    const value = useMemo(() => ({ language, loading, setLanguage }), [language, loading, setLanguage]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
