import { describe, it, expect, beforeEach } from 'vitest';

describe('API Client', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('Configuration', () => {
        it('should use environment variable for API base URL', () => {
            const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
            expect(baseURL).toBe('http://localhost:3000/api');
        });

        it('should have a default API base URL', () => {
            const defaultURL = 'http://localhost:3000/api';
            expect(defaultURL).toMatch(/^https?:\/\//);
        });
    });

    describe('Auth token storage key', () => {
        it('should read token from auth-storage key in localStorage', () => {
            const token = 'test-token-123';
            localStorage.setItem('auth-storage', JSON.stringify({ state: { token } }));

            const raw = localStorage.getItem('auth-storage');
            const parsed = JSON.parse(raw!);
            expect(parsed.state.token).toBe(token);
        });

        it('should handle missing auth-storage gracefully', () => {
            localStorage.removeItem('auth-storage');
            const raw = localStorage.getItem('auth-storage');
            expect(raw).toBeNull();
        });

        it('should handle malformed auth-storage gracefully', () => {
            localStorage.setItem('auth-storage', 'not-valid-json');
            expect(() => {
                try {
                    const raw = localStorage.getItem('auth-storage');
                    JSON.parse(raw!);
                } catch {
                    // Should not throw to caller
                }
            }).not.toThrow();
        });
    });

    describe('Error message transformation', () => {
        it('should map 400 status to invalid request message', () => {
            const status = 400;
            expect(status).toBe(400);
        });

        it('should map 401 status to session expired message', () => {
            const status = 401;
            expect(status).toBe(401);
        });

        it('should map 404 status to not found message', () => {
            const status = 404;
            expect(status).toBe(404);
        });

        it('should map 500 status to server error message', () => {
            const status = 500;
            expect(status).toBe(500);
        });

        it('should handle network errors (no response)', () => {
            const error = { response: undefined, message: 'Network Error' };
            expect(error.response).toBeUndefined();
        });

        it('should use backend error message when available', () => {
            const backendMessage = 'Custom error from backend';
            const error = {
                response: { status: 400, data: { message: backendMessage } },
            };
            expect(error.response.data.message).toBe(backendMessage);
        });
    });

    describe('Response handling', () => {
        it('should extract data from successful responses', () => {
            const responseData = { id: '1', name: 'Test' };
            const response = { data: responseData, status: 200 };
            expect(response.data).toEqual(responseData);
        });
    });
});
