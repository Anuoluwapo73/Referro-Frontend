import { useState, useEffect } from 'react';

export interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    isLoading: boolean;
}

/**
 * useGeolocation hook — requests the browser's Geolocation API and returns
 * the user's current coordinates.
 * Requirements: 13.3
 */
export function useGeolocation(): GeolocationState {
    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        error: null,
        isLoading: true,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState({
                latitude: null,
                longitude: null,
                error: 'Geolocation is not supported by your browser.',
                isLoading: false,
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                    isLoading: false,
                });
            },
            (err) => {
                setState({
                    latitude: null,
                    longitude: null,
                    error: err.message,
                    isLoading: false,
                });
            }
        );
    }, []);

    return state;
}
