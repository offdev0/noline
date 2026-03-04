import type { LanguageCode } from '@/context/LanguageContext';
import { I18n } from 'i18n-js';
import { I18nManager } from 'react-native';
import { translations } from './translations';

const i18n = new I18n(translations);
i18n.enableFallback = true;

export const configureI18n = (language: LanguageCode) => {
    i18n.locale = language;

    // Apply RTL settings without reloading — takes effect on next cold start
    const shouldBeRTL = language === 'he';
    if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
    }
};

export const t = (key: string, options?: Record<string, any>) => i18n.t(key, options);
