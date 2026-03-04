import { configureI18n } from '@/i18n';
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
                    configureI18n(stored);
                } else {
                    configureI18n('en');
                }
            } catch {
                // Ignore storage errors and fall back to default
                configureI18n('en');
            } finally {
                setLoading(false);
            }
        };

        loadLanguage();
    }, []);

    const setLanguage = useCallback(async (next: LanguageCode) => {
        setLoading(true);

        // Give the UI a moment to show the loading screen before the heavy re-render
        setTimeout(async () => {
            configureI18n(next);
            setLanguageState(next);

            try {
                await AsyncStorage.setItem(STORAGE_KEY, next);
            } catch {
                // Ignore storage errors
            }

            // Keep loading for a brief moment to ensure all components have re-rendered
            setTimeout(() => {
                setLoading(false);
            }, 600);
        }, 100);
    }, []);

    const value = useMemo(() => ({ language, loading, setLanguage }), [language, loading, setLanguage]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
