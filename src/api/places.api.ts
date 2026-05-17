import apiClient from './client';

export interface PlaceSuggestion {
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
}

export interface GeocodeResult {
    address: string;
    city: string;
    state: string;
    lga?: string;
    latitude: number;
    longitude: number;
    placeId: string;
}

export const placesApi = {
    // Get address autocomplete suggestions
    // Backend expects ?input= and returns { suggestions: [] }
    autocomplete: async (input: string): Promise<{ results: PlaceSuggestion[] }> => {
        const res: any = await apiClient.get('/places/autocomplete', { params: { input } });
        // Normalise backend shape { suggestions } → { results }
        const raw = res?.suggestions ?? res?.results ?? res?.data?.suggestions ?? [];
        return { results: raw };
    },

    // Geocode an address by placeId
    // Backend returns { result: GeocodeResult }
    geocode: async (placeId: string): Promise<GeocodeResult> => {
        const res: any = await apiClient.get('/places/geocode', { params: { placeId } });
        return res?.result ?? res?.data?.result ?? res;
    },
};
