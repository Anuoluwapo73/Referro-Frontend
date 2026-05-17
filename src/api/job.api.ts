import apiClient from './client';

export const jobApi = {
    // Get all jobs with optional filters
    getJobs: (params?: any) => apiClient.get('/jobs', { params }),

    // Get job by ID
    getJob: (jobId: string) => apiClient.get(`/jobs/${jobId}`),

    // Create a new job
    createJob: (data: any) => apiClient.post('/jobs', data),

    // Update job
    updateJob: (jobId: string, data: any) => apiClient.patch(`/jobs/${jobId}`, data),

    // Assign artisan to job
    assignArtisan: (jobId: string, artisanId: string) =>
        apiClient.post(`/jobs/${jobId}/assign`, { artisanId }),

    // Start job
    startJob: (jobId: string) => apiClient.post(`/jobs/${jobId}/start`),

    // Complete job
    completeJob: (jobId: string) => apiClient.post(`/jobs/${jobId}/complete`),

    // Cancel job
    cancelJob: (jobId: string, reason?: string) =>
        apiClient.post(`/jobs/${jobId}/cancel`, { reason }),

    // Find nearby jobs
    findNearbyJobs: (latitude: number, longitude: number, radius: number = 50) =>
        apiClient.get('/jobs/nearby', { params: { latitude, longitude, radius } }),

    // Calculate cost breakdown (budget + waybill + insurance)
    calculateCost: (jobId: string) =>
        apiClient.post(`/jobs/${jobId}/calculate-cost`),

    // Artisan requests completion (customer must confirm)
    requestCompletion: (jobId: string) =>
        apiClient.post(`/jobs/${jobId}/request-completion`),

    // Artisan applies for an open job
    applyForJob: (jobId: string, note?: string) =>
        apiClient.post(`/jobs/${jobId}/apply`, { note }),

    // Customer gets all applications for their job
    getApplications: (jobId: string) =>
        apiClient.get(`/jobs/${jobId}/applications`),

    // Customer accepts or rejects an application
    decideApplication: (jobId: string, applicationId: string, status: 'ACCEPTED' | 'REJECTED') =>
        apiClient.patch(`/jobs/${jobId}/applications/${applicationId}`, { status }),
};
