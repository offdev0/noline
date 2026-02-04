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
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyDlLpauOduyhpqXWPzczYs9Ad3MfvJ35EM';

const CATEGORY_MAPPING: Record<string, PlaceData['category']> = {
    'restaurant': 'restaurant',
    'cafe': 'restaurant',
    'food': 'restaurant',
    'bar': 'hot',
    'night_club': 'hot',
    'casino': 'casino',
    'shopping_mall': 'shopping',
    'department_store': 'shopping',
    'clothing_store': 'shopping',
    'store': 'shopping',
    'amusement_park': 'fun',
    'entertainment_center': 'fun',
    'movie_theater': 'fun',
    'tourist_attraction': 'mustVisit',
    'park': 'mustVisit',
    'museum': 'mustVisit',
    'art_gallery': 'mustVisit',
    'stadium': 'mustVisit'
};

// Category-specific search queries to get diverse results
const SEARCH_CATEGORIES = [
    { query: 'popular restaurants', category: 'restaurant' as const },
    { query: 'cafes and coffee shops', category: 'restaurant' as const },
    { query: 'tourist attractions landmarks', category: 'mustVisit' as const },
    { query: 'shopping malls', category: 'shopping' as const },
    { query: 'nightlife bars clubs', category: 'hot' as const },
    { query: 'entertainment parks fun activities', category: 'fun' as const },
];

export class MapsService {
    /**
     * Calculates distance between two points in km
     */
    static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; 
        return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
    }

    /**
     * Fetches places using coordinates (lat/lng) with multiple category searches
     */
    static async fetchPlacesByCoordinates(
        latitude: number,
        longitude: number,
        radiusMeters: number = 10000
    ): Promise<PlaceData[]> {
        console.log(`[MapsService] Fetching places near: ${latitude}, ${longitude}`);

        const allPlaces: PlaceData[] = [];
        const seenIds = new Set<string>();

        // Make parallel requests for different categories
        const promises = SEARCH_CATEGORIES.map(async ({ query, category }) => {
            try {
                const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.photos,places.editorialSummary,places.location'
                    },
                    body: JSON.stringify({
                        textQuery: query,
                        locationBias: {
                            circle: {
                                center: { latitude, longitude },
                                radius: radiusMeters
                            }
                        },
                        maxResultCount: 10
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

        console.log(`[MapsService] Total raw places fetched: ${flatResults.length}`);

        // Process and deduplicate
        flatResults.forEach((p: any, index: number) => {
            if (!p.location?.latitude || !p.location?.longitude) return;
            if (seenIds.has(p.id)) return;
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
                description: p.editorialSummary?.text || `A popular ${category} spot in this area.`,
                category,
                distance: this.calculateDistance(latitude, longitude, p.location.latitude, p.location.longitude),
                status: statusOptions[index % statusOptions.length],
                image: imageUrl,
                rating: p.rating || 4.2,
                address: p.formattedAddress || 'Address not available',
                location: {
                    latitude: p.location.latitude,
                    longitude: p.location.longitude,
                }
            });
        });

        console.log(`[MapsService] Returning ${allPlaces.length} unique places`);
        return allPlaces;
    }

    /**
     * Legacy method - now uses coordinates internally
     */
    static async fetchNearbyPlaces(locationName: string): Promise<PlaceData[]> {
        console.log(`[MapsService] fetchNearbyPlaces called with: "${locationName}"`);
        
        // This method is kept for backward compatibility but now the PlacesContext
        // should prefer using fetchPlacesByCoordinates directly
        try {
            const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.photos,places.editorialSummary,places.location'
                },
                body: JSON.stringify({
                    textQuery: `top attractions restaurants cafes and spots in ${locationName}`,
                    maxResultCount: 20
                })
            });

            if (!response.ok) {
                console.error('[MapsService] API Error:', await response.text());
                return [];
            }

            const data = await response.json();
            const places = data.places || [];

            console.log(`[MapsService] Found ${places.length} places for "${locationName}"`);

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
                        description: p.editorialSummary?.text || `A popular spot in ${locationName}.`,
                        category,
                        distance: '--- km', // Need user location for this
                        status: statusOptions[index % statusOptions.length],
                        image: imageUrl,
                        rating: p.rating || 4.2,
                        address: p.formattedAddress || 'Address not available',
                        location: {
                            latitude: p.location.latitude,
                            longitude: p.location.longitude,
                        }
                    };
                });
        } catch (error) {
            console.error('[MapsService] Error:', error);
            return [];
        }
    }
}
