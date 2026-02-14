import { t } from '@/i18n';

/**
 * Formats a distance string (e.g., "1.2km", "300m") with localized units.
 */
export const formatDistance = (distStr: string) => {
    if (!distStr) return '';
    const num = parseFloat(distStr);
    if (isNaN(num)) return distStr;

    if (distStr.toLowerCase().includes('km')) {
        return `${num.toFixed(1)} ${t('places.km')}`;
    }
    if (distStr.toLowerCase().includes('m')) {
        return `${num.toFixed(0)} ${t('places.m')}`;
    }
    return distStr;
};

/**
 * Capitalizes the first letter of a string.
 */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
