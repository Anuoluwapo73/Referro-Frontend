import apiClient from './client';

export const adminApi = {
    // Get platform statistics
    getStats: () => apiClient.get('/admin/stats'),

    // Get all users
    getUsers: (params?: any) => apiClient.get('/admin/users', { params }),

    // Verify a user
    verifyUser: (userId: string) => apiClient.post(`/admin/users/${userId}/verify`),

    // Get all transactions
    getTransactions: (params?: any) => apiClient.get('/admin/transactions', { params }),
};
