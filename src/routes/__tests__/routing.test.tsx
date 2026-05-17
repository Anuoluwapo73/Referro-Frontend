import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
import AdminRoute from '../AdminRoute';

// Mock the react-router-dom to avoid dual React instance issues
vi.mock('react-router-dom', () => ({
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
    useLocation: () => ({ pathname: '/test', state: null }),
}));

// Mock the auth store
vi.mock('../../store/authStore', () => ({
    useAuthStore: vi.fn((selector: (state: any) => any) => {
        return selector({ isAuthenticated: false, user: null });
    }),
}));

import { useAuthStore } from '../../store/authStore';

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render children when user is authenticated', () => {
        vi.mocked(useAuthStore).mockImplementation((selector: any) =>
            selector({ isAuthenticated: true, user: { userType: 'CUSTOMER' } })
        );

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
        vi.mocked(useAuthStore).mockImplementation((selector: any) =>
            selector({ isAuthenticated: false, user: null })
        );

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );

        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});

describe('AdminRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render children when user is authenticated and is admin', () => {
        vi.mocked(useAuthStore).mockImplementation((selector: any) =>
            selector({ isAuthenticated: true, user: { userType: 'ADMIN' } })
        );

        render(
            <AdminRoute>
                <div>Admin Content</div>
            </AdminRoute>
        );

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
        vi.mocked(useAuthStore).mockImplementation((selector: any) =>
            selector({ isAuthenticated: false, user: null })
        );

        render(
            <AdminRoute>
                <div>Admin Content</div>
            </AdminRoute>
        );

        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('should redirect to dashboard when user is authenticated but not admin', () => {
        vi.mocked(useAuthStore).mockImplementation((selector: any) =>
            selector({ isAuthenticated: true, user: { userType: 'CUSTOMER' } })
        );

        render(
            <AdminRoute>
                <div>Admin Content</div>
            </AdminRoute>
        );

        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/dashboard');
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
});
