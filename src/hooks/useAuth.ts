import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import toast from 'react-hot-toast';

export const useAuth = () => {
    const navigate = useNavigate();
    const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            if (token && !user) {
                try {
                    const response = await authApi.getSession() as any;
                    const sessionUser = response?.user ?? response?.data?.user;
                    if (sessionUser) {
                        useAuthStore.getState().setUser(sessionUser);
                    }
                    // If no user in response but no error, just continue — don't clear auth
                } catch (error: any) {
                    // Only clear auth on explicit 401 (expired token), not network errors
                    const is401 = error?.message?.includes('session has expired') || error?.message?.includes('log in again');
                    if (is401) {
                        clearAuth();
                    }
                    // Network errors (backend cold start, timeout) — keep existing auth state
                }
            }
            setIsInitializing(false);
        };
        checkSession();
    }, [token, user, clearAuth]);

    const login = useCallback(
        async (email: string, password: string) => {
            setIsLoading(true);
            try {
                const response = await authApi.login({ email, password }) as any;
                const sessionUser = response?.user ?? response?.data?.user;
                const sessionToken = response?.token ?? response?.data?.token;
                if (sessionUser && sessionToken) {
                    setAuth(sessionUser, sessionToken);
                    return { success: true, user: sessionUser };
                }
                throw new Error('Invalid response from server');
            } catch (error: any) {
                toast.error(error.message || 'Login failed');
                return { success: false, error: error.message };
            } finally {
                setIsLoading(false);
            }
        },
        [setAuth]
    );

    const register = useCallback(
        async (data: {
            fullName: string;
            email: string;
            password: string;
            userType: 'CUSTOMER' | 'ARTISAN' | 'REFERRER';
            referralCode?: string;
        }) => {
            setIsLoading(true);
            try {
                const response = await authApi.register(data) as any;
                const sessionUser = response?.user ?? response?.data?.user;
                const sessionToken = response?.token ?? response?.data?.token;
                if (sessionUser && sessionToken) {
                    setAuth(sessionUser, sessionToken);
                    return { success: true, user: sessionUser };
                }
                return { success: true };
            } catch (error: any) {
                toast.error(error.message || 'Registration failed');
                return { success: false, error: error.message };
            } finally {
                setIsLoading(false);
            }
        },
        [setAuth]
    );

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            clearAuth();
            setIsLoading(false);
            navigate('/login');
            toast.success('Logged out successfully');
        }
    }, [clearAuth, navigate]);

    const refreshSession = useCallback(async () => {
        if (!token) return;
        try {
            const response = await authApi.getSession() as any;
            const sessionUser = response?.user ?? response?.data?.user;
            if (sessionUser) {
                useAuthStore.getState().setUser(sessionUser);
            } else {
                clearAuth();
            }
        } catch (error: any) {
            if (error?.message?.includes('session has expired') || error?.message?.includes('log in again')) {
                clearAuth();
            }
        }
    }, [token, clearAuth]);

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        isInitializing,
        login,
        register,
        logout,
        refreshSession,
    };
};
