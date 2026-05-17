import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import CustomerDashboard from './CustomerDashboard';
import ArtisanDashboard from './ArtisanDashboard';

/**
 * Dashboard — routes to the appropriate dashboard based on user type.
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 17.1
 */
export default function Dashboard() {
    const userType = useAuthStore((s) => s.user?.userType);

    if (userType === 'ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (userType === 'ARTISAN') {
        return <ArtisanDashboard />;
    }

    // CUSTOMER, REFERRER, and any other type get the customer dashboard
    return <CustomerDashboard />;
}
