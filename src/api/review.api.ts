import apiClient from './client';

export const reviewApi = {
    // Create a review
    createReview: (data: { jobId: string; rating: number; comment: string }) =>
        apiClient.post('/reviews', data),

    // Get reviews for a user
    getUserReviews: (userId: string) => apiClient.get(`/reviews/user/${userId}`),

    // Get review by ID
    getReview: (reviewId: string) => apiClient.get(`/reviews/${reviewId}`),
};
