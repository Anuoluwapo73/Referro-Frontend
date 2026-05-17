import apiClient from './client';

export const paymentApi = {
    // Initialize payment
    initializePayment: (data: { jobId: string; amount: number }) =>
        apiClient.post('/payments/initialize', data),

    // Verify payment
    verifyPayment: (reference: string) =>
        apiClient.post('/payments/verify', { reference }),

    // Access fee: initialize ₦1,000 onboarding payment
    initializeAccessFee: () =>
        apiClient.post('/payments/access-fee/initialize'),

    // Access fee: verify reference and unlock dashboard
    verifyAccessFee: (reference: string) =>
        apiClient.post('/payments/access-fee/verify', { reference }),
};
