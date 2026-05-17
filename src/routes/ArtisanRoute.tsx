import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ArtisanRouteProps {
    children: React.ReactNode;
}

/**
 * ArtisanRoute — wraps protected routes to enforce the access-fee gate.
 * If the logged-in user is an ARTISAN with isVerified === false,
 * they are redirected to /onboarding/access-fee.
 * Requirements: US-1.1, P-5
 */
export default function ArtisanRoute({ children }: ArtisanRouteProps) {
    const user = useAuthStore((s) => s.user);
    const location = useLocation();

    // Dev bypass: skip gate in local dev when auth bypass is active
    if (import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
        return <>{children}</>;
    }

    if (user?.userType === 'ARTISAN' && !user.isVerified) {
        return (
            <Navigate
                to="/onboarding/access-fee"
                state={{ from: location }}
                replace
            />
        );
    }

    return <>{children}</>;
}
