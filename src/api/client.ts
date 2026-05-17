import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add authentication token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Read token from Zustand persisted storage (key: auth-storage)
        try {
            const raw = localStorage.getItem('auth-storage');
            if (raw) {
                const parsed = JSON.parse(raw);
                const token = parsed?.state?.token;
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch {
            // Ignore parse errors
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Helper function to transform error messages to user-friendly format
const transformErrorMessage = (error: AxiosError<{ message?: string; error?: string }>): string => {
    // No response = backend not reachable
    if (!error.response) {
        return `Cannot reach the server (${API_BASE_URL}). Make sure the backend is running.`;
    }

    const status = error.response.status;
    const data = error.response.data;
    const backendMessage = data?.message || data?.error;

    switch (status) {
        case 400:
            return backendMessage || 'Invalid request. Please check your input and try again.';
        case 401:
            return 'Your session has expired. Please log in again.';
        case 403:
            return backendMessage || 'You do not have permission to perform this action.';
        case 404:
            return backendMessage || 'The requested resource was not found.';
        case 409:
            return backendMessage || 'This action conflicts with existing data.';
        case 422:
            return backendMessage || 'Validation failed. Please check your input.';
        case 429:
            return 'Too many requests. Please wait a moment and try again.';
        case 500:
            return backendMessage || 'Server error. Please try again later.';
        case 503:
            return 'Service temporarily unavailable. Please try again later.';
        default:
            return backendMessage || error.message || 'An unexpected error occurred. Please try again.';
    }
};

// Response interceptor - handle errors and extract data
apiClient.interceptors.response.use(
    (response) => {
        // Return the data directly for successful responses
        return response.data;
    },
    (error: AxiosError<{ message?: string; error?: string }>) => {
        // Log actual error for debugging
        console.error('[API Error]', error.config?.url, error.response?.status, error.response?.data || error.message);

        // Handle 401 Unauthorized - clear auth and redirect to login
        // But NOT for auth endpoints (login/register) — those legitimately return 401
        if (error.response?.status === 401) {
            const url = error.config?.url ?? '';
            const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/send-otp') || url.includes('/auth/register');
            if (!isAuthEndpoint) {
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
            }
        }

        const errorMessage = transformErrorMessage(error);
        return Promise.reject(new Error(errorMessage));
    }
);

export default apiClient;
