import apiClient from './client';

export const notificationApi = {
    getNotifications: () => apiClient.get('/notifications'),
    markAllRead: () => apiClient.patch('/notifications/read-all'),
    markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
};
