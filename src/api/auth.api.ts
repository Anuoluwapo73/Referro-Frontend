import apiClient from './client';

export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    userType: 'CUSTOMER' | 'ARTISAN' | 'REFERRER';
    referralCode?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export const authApi = {
    register: (data: RegisterData) => apiClient.post('/auth/register', data),
    login: (data: LoginData) => apiClient.post('/auth/send-otp', data),
    getSession: () => apiClient.get('/auth/session'),
    logout: () => apiClient.post('/auth/logout'),
};
