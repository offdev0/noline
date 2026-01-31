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

export class MapsService {
    /**
     * Fetches places from Google Places API based on a location name or search query.
     * Increased limit and broadened search to ensure multiple categories are populated.
     */
    static async fetchNearbyPlaces(locationName: string): Promise<PlaceData[]> {
        console.log(`Fetching comprehensive real places for: ${locationName}`);

        try {
            // Updated query to be more inclusive of different categories
            const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.photos,places.editorialSummary'
                },
                body: JSON.stringify({
                    // Broadening the query to hit more category types
                    textQuery: `top attractions, restaurants, shopping malls, and entertainment in ${locationName}`,
                    maxResultCount: 20 // Increased count to get more variety
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Google Places API Error:', errorData);
                return [];
            }

            const data = await response.json();
            const places = data.places || [];

            return places.map((p: any, index: number) => {
                // Determine category based on Google's provided types
                let category: PlaceData['category'] = 'mustVisit'; // Default
                
                if (p.types) {
                    // Find the first matching category in our mapping
                    const foundType = p.types.find((t: string) => CATEGORY_MAPPING[t]);
                    if (foundType) {
                        category = CATEGORY_MAPPING[foundType];
                    }
                }

                // Get photo URL with priority to larger images
                let imageUrl = `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800`; // Better default
                if (p.photos && p.photos.length > 0) {
                    imageUrl = `https://places.googleapis.com/v1/${p.photos[0].name}/media?key=${GOOGLE_MAPS_API_KEY}&maxWidthPx=800`;
                } else if (category === 'restaurant') {
                    imageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
                } else if (category === 'shopping') {
                    imageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800';
                }

                // Status randomization for app demonstration
                const statusOptions: PlaceData['status'][] = ['vacant', 'medium', 'loaded'];
                const status = statusOptions[index % statusOptions.length];

                const description = p.editorialSummary?.text || 
                    `${p.displayName?.text || 'A popular spot'} in ${locationName}, known for its ${category} experience.`;

                return {
                    id: p.id,
                    name: p.displayName?.text || 'Great Place',
                    description: description,
                    category: category,
                    distance: `${(index * 0.3 + 0.4).toFixed(1)} km`,
                    status: status,
                    image: imageUrl,
                    rating: p.rating || 4.2,
                    address: p.formattedAddress || 'Address not available'
                };
            });

        } catch (error) {
            console.error('MapsService comprehensive fetch failed:', error);
            return [];
        }
    }
}
