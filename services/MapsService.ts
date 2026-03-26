import { t } from '@/i18n';

export interface PlaceData {
    id: string;
    name: string;
    description: string;
    category: 'mustVisit' | 'restaurant' | 'casino' | 'hot' | 'shopping' | 'fun';
    distance: string;
    status: 'vacant' | 'medium' | 'loaded';
    image: string;
    rating: number;
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    hours?: string;
    isLeisure?: boolean;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyDlLpauOduyhpqXWPzczYs9Ad3MfvJ35EM';

const CATEGORY_MAPPING: Record<string, PlaceData['category']> = {
    'bar': 'hot',
    'night_club': 'hot',
    'liquor_store': 'hot',
    'restaurant': 'restaurant',
    'cafe': 'restaurant',
    'bakery': 'restaurant',
    'meal_takeaway': 'restaurant',
    'food': 'restaurant',
    'ice_cream_shop': 'restaurant',
    'supermarket': 'shopping',
    'park': 'mustVisit',
    'tourist_attraction': 'mustVisit',
    'museum': 'mustVisit',
    'zoo': 'mustVisit',
    'aquarium': 'mustVisit',
};

// Category-specific search queries to get diverse results
const SEARCH_CATEGORIES = [
    { query: 'best cocktail bars and rooftop lounges', category: 'hot' as const },
    { query: 'top-rated restaurants and fine dining', category: 'restaurant' as const },
    { query: 'specialty coffee shops and cozy cafes', category: 'restaurant' as const },
    { query: 'popular nightclubs and dance floors', category: 'hot' as const },
    { query: 'craft beer pubs and wine bars', category: 'hot' as const },
    { query: 'trendy brunch spots and bistros', category: 'restaurant' as const },
    { query: 'unique bakeries and dessert parlors', category: 'restaurant' as const },
    { query: 'popular organic food markets and deli', category: 'shopping' as const },
    { query: 'beautiful parks, gardens and nature walks', category: 'mustVisit' as const },
    { query: 'top tourist attractions and museums', category: 'mustVisit' as const },
];

export class MapsService {
    /**
     * Calculates distance between two points in km
     */
    static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
        const d = this.getRawDistance(lat1, lon1, lat2, lon2);
        return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
    }

    /**
     * Returns raw distance in km
     */
    static getRawDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Israel bounding box for strict region restriction
    private static readonly ISRAEL_BOUNDS = {
        low: { latitude: 29.5, longitude: 34.2 },
        high: { latitude: 33.3, longitude: 35.9 },
    };

    /**
     * Fetches places using coordinates (lat/lng) with multiple category searches
     */
    static async fetchPlacesByCoordinates(
        latitude: number,
        longitude: number,
        languageCode: string = 'en',
        radiusMeters: number = 100,
        restrictToIsrael: boolean = false
    ): Promise<PlaceData[]> {
        console.log(`[MapsService] Fetching places near: ${latitude}, ${longitude} (Language: ${languageCode}, restrictToIsrael: ${restrictToIsrael})`);

        const allPlaces: PlaceData[] = [];
        const seenIds = new Set<string>();

        const promises = SEARCH_CATEGORIES.map(async ({ query, category }) => {
            try {
                // Build location constraint: use restriction (strict) for Israel fallback, bias for GPS
                const locationConstraint = restrictToIsrael
                    ? {
                        locationRestriction: {
                            rectangle: this.ISRAEL_BOUNDS
                        }
                    }
                    : {
                        locationBias: {
                            circle: {
                                center: { latitude, longitude },
                                radius: radiusMeters
                            }
                        }
                    };

                const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.photos,places.editorialSummary,places.location',
                        'X-Goog-Language-Code': languageCode
                    },
                    body: JSON.stringify({
                        textQuery: restrictToIsrael ? `${query} in Israel` : query,
                        ...locationConstraint,
                        maxResultCount: 20,
                        languageCode: languageCode
                    })
                });

                if (!response.ok) {
                    console.error(`[MapsService] API error for "${query}":`, await response.text());
                    return [];
                }

                const data = await response.json();
                return (data.places || []).map((p: any) => ({
                    ...p,
                    _forcedCategory: category
                }));
            } catch (err) {
                console.error(`[MapsService] Fetch error for "${query}":`, err);
                return [];
            }
        });

        const results = await Promise.all(promises);
        const flatResults = results.flat();

        const radiusKm = radiusMeters / 1000;

        flatResults.forEach((p: any, index: number) => {
            if (!p.location?.latitude || !p.location?.longitude) return;
            if (seenIds.has(p.id)) return;

            // Hard-filter anything beyond the radius to prevent distant foreign or far-away places
            const dist = this.getRawDistance(latitude, longitude, p.location.latitude, p.location.longitude);
            if (dist > radiusKm * 1.5) return; // allow 50% slack for radius bias behavior

            // For Israel fallback: hard-filter to Israel bounding box
            if (restrictToIsrael) {
                const lat = p.location.latitude;
                const lng = p.location.longitude;
                if (lat < this.ISRAEL_BOUNDS.low.latitude || lat > this.ISRAEL_BOUNDS.high.latitude ||
                    lng < this.ISRAEL_BOUNDS.low.longitude || lng > this.ISRAEL_BOUNDS.high.longitude) {
                    return;
                }
            }

            seenIds.add(p.id);

            let category: PlaceData['category'] = p._forcedCategory || 'mustVisit';
            if (p.types) {
                const foundType = p.types.find((t: string) => CATEGORY_MAPPING[t]);
                if (foundType) {
                    category = CATEGORY_MAPPING[foundType];
                }
            }

            let imageUrl = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800';
            if (p.photos && p.photos.length > 0) {
                imageUrl = `https://places.googleapis.com/v1/${p.photos[0].name}/media?key=${GOOGLE_MAPS_API_KEY}&maxWidthPx=800`;
            }

            const statusOptions: PlaceData['status'][] = ['vacant', 'medium', 'loaded'];

            allPlaces.push({
                id: p.id,
                name: p.displayName?.text || 'Great Place',
                description: p.editorialSummary?.text || t('places.popularSpot', { category: t(`categories.${category}`) }),
                category,
                distance: this.calculateDistance(latitude, longitude, p.location.latitude, p.location.longitude),
                status: statusOptions[index % statusOptions.length],
                image: imageUrl,
                rating: p.rating || 4.2,
                address: p.formattedAddress || 'Address not available',
                location: {
                    latitude: p.location.latitude,
                    longitude: p.location.longitude,
                },
                isLeisure: ['park', 'museum', 'zoo', 'aquarium', 'tourist_attraction'].some(type => p.types?.includes(type))
            });
        });

        return allPlaces;
    }

    /**
     * Legacy method - now uses coordinates internally
     */
    static async fetchNearbyPlaces(locationName: string, languageCode: string = 'en'): Promise<PlaceData[]> {
        console.log(`[MapsService] fetchNearbyPlaces called for: "${locationName}" (Language: ${languageCode})`);

        try {
            const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.photos,places.editorialSummary,places.location',
                    'X-Goog-Language-Code': languageCode
                },
                body: JSON.stringify({
                    textQuery: `best bars, cafes, restaurants, and nightlife in ${locationName}`,
                    maxResultCount: 20,
                    languageCode: languageCode
                })
            });

            if (!response.ok) {
                console.error('[MapsService] API Error:', await response.text());
                return [];
            }

            const data = await response.json();
            const places = data.places || [];

            return places
                .filter((p: any) => p.location?.latitude && p.location?.longitude)
                .map((p: any, index: number) => {
                    let category: PlaceData['category'] = 'mustVisit';
                    if (p.types) {
                        const foundType = p.types.find((t: string) => CATEGORY_MAPPING[t]);
                        if (foundType) {
                            category = CATEGORY_MAPPING[foundType];
                        }
                    }

                    let imageUrl = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800';
                    if (p.photos && p.photos.length > 0) {
                        imageUrl = `https://places.googleapis.com/v1/${p.photos[0].name}/media?key=${GOOGLE_MAPS_API_KEY}&maxWidthPx=800`;
                    }

                    const statusOptions: PlaceData['status'][] = ['vacant', 'medium', 'loaded'];

                    return {
                        id: p.id,
                        name: p.displayName?.text || 'Great Place',
                        description: p.editorialSummary?.text || t('places.popularSpot', { category: t(`categories.${category}`) }),
                        category,
                        distance: '--- km',
                        status: statusOptions[index % statusOptions.length],
                        image: imageUrl,
                        rating: p.rating || 4.2,
                        address: p.formattedAddress || 'Address not available',
                        location: {
                            latitude: p.location.latitude,
                            longitude: p.location.longitude,
                        },
                        isLeisure: ['park', 'museum', 'zoo', 'aquarium', 'tourist_attraction'].some(type => p.types?.includes(type))
                    };
                });
        } catch (error) {
            console.error('[MapsService] Error:', error);
            return [];
        }
    }

    /**
     * Fetches details for a single place by ID
     */
    static async fetchPlaceById(placeId: string, languageCode: string = 'en'): Promise<PlaceData | null> {
        console.log(`[MapsService] fetchPlaceById: ${placeId} (${languageCode})`);
        try {
            const url = `https://places.googleapis.com/v1/places/${placeId}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,types,photos,editorialSummary,location',
                }
            });

            if (!response.ok) {
                console.error(`[MapsService] Error fetching place ${placeId}:`, await response.text());
                return null;
            }

            const p = await response.json();
            if (!p.location?.latitude) return null;

            let category: PlaceData['category'] = 'mustVisit';
            if (p.types) {
                const foundType = p.types.find((t: string) => CATEGORY_MAPPING[t]);
                if (foundType) {
                    category = CATEGORY_MAPPING[foundType];
                }
            }

            let imageUrl = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800';
            if (p.photos && p.photos.length > 0) {
                imageUrl = `https://places.googleapis.com/v1/${p.photos[0].name}/media?key=${GOOGLE_MAPS_API_KEY}&maxWidthPx=800`;
            }

            return {
                id: p.id,
                name: p.displayName?.text || 'Great Place',
                description: p.editorialSummary?.text || 'A popular local spot.',
                category,
                distance: '--- km',
                status: 'medium',
                image: imageUrl,
                rating: p.rating || 4.2,
                address: p.formattedAddress || 'Address not available',
                location: {
                    latitude: p.location.latitude,
                    longitude: p.location.longitude,
                },
                isLeisure: ['park', 'museum', 'zoo', 'aquarium', 'tourist_attraction'].some(type => p.types?.includes(type))
            };
        } catch (error) {
            console.error('[MapsService] fetchPlaceById Exception:', error);
            return null;
        }
    }
}
