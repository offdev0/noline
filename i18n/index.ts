import type { LanguageCode } from '@/context/LanguageContext';
import { I18n } from 'i18n-js';
import { DevSettings, I18nManager } from 'react-native';
import { translations } from './translations';

const i18n = new I18n(translations);

export const configureI18n = (language: LanguageCode) => {
    i18n.enableFallback = true;
    i18n.locale = language;

    const shouldBeRTL = language === 'he';
    if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        if (DevSettings?.reload) {
            DevSettings.reload();
        }
    }
};

export const t = (key: string, options?: Record<string, any>) => i18n.t(key, options);
