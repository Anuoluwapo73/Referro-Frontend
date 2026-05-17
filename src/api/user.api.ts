import apiClient from './client';

export const userApi = {
    // Get user profile
    getProfile: () => apiClient.get('/users/profile'),

    // Update user profile
    updateProfile: (data: any) => apiClient.patch('/users/profile', data),

    // Update user address
    updateAddress: (data: any) => apiClient.patch('/users/address', data),

    // Upgrade to artisan
    upgradeToArtisan: (data: any) => apiClient.post('/users/upgrade', data),

    // Get artisan list
    getArtisans: (params?: any) => apiClient.get('/users/artisans', { params }),

    // Get artisan by ID
    getArtisan: (id: string) => apiClient.get(`/users/artisans/${id}`),

    // Get referrals
    getReferrals: () => apiClient.get('/users/referrals'),
};
