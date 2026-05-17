import apiClient from './client';

export const chatApi = {
    // Get messages for a job
    getMessages: (jobId: string) => apiClient.get(`/chat/${jobId}`),

    // Send a message
    sendMessage: (data: { jobId: string; receiverId: string; content: string }) =>
        apiClient.post('/chat/send', data),

    // Mark messages as read
    markAsRead: (jobId: string) => apiClient.post('/chat/read', { jobId }),

    // Get all conversations
    getConversations: () => apiClient.get('/chat/conversations'),
};
