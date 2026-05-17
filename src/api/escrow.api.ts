import apiClient from './client';

export const escrowApi = {
    // Get escrow details for a job
    getEscrow: (jobId: string) => apiClient.get(`/escrow/${jobId}`),

    // Release escrow funds
    releaseEscrow: (jobId: string) => apiClient.post('/escrow/release', { jobId }),

    // Create dispute
    createDispute: (data: { jobId: string; reason: string }) =>
        apiClient.post('/escrow/dispute', data),

    // Get escrow history
    getEscrowHistory: () => apiClient.get('/escrow/history'),
};
