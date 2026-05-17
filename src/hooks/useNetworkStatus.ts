import { useState, useEffect } from 'react';
import showToast from '../components/common/Toast';

/**
 * Hook to detect network connectivity status.
 * Shows toast notifications when connectivity changes.
 */
export const useNetworkStatus = () => {
    // Default to true — only flip to false when an actual 'offline' event fires.
    // navigator.onLine can be unreliable (returns false on local-only networks).
    const [isOnline, setIsOnline] = useState<boolean>(true);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            showToast.success('Connection restored. You are back online.');
        };

        const handleOffline = () => {
            setIsOnline(false);
            showToast.error('No internet connection. Please check your network.', {
                duration: Infinity,
                id: 'network-offline',
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isOnline };
};

export default useNetworkStatus;
