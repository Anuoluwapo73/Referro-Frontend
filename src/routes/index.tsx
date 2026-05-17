import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import ProtectedRoute from './ProtectedRoute';
import ArtisanRoute from './ArtisanRoute';
import AdminRoute from './AdminRoute';
import PublicLayout from '../layouts/PublicLayout';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import AdminLayout from '../layouts/AdminLayout';

// Code-split all page components — Requirements: 23.3
const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Search = lazy(() => import('../pages/Search'));
const ArtisanProfilePage = lazy(() => import('../pages/ArtisanProfilePage'));
const EscrowHistoryPage = lazy(() => import('../pages/escrow/EscrowHistoryPage'));
const ChatPage = lazy(() => import('../pages/chat/Chat'));
const CreateReviewPage = lazy(() => import('../pages/reviews/CreateReviewPage'));
const WalletPage = lazy(() => import('../pages/wallet/WalletPage'));
const ReferralsPage = lazy(() => import('../pages/referrals/ReferralsPage'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const AdminDashboard = lazy(() => import('../pages/dashboard/AdminDashboard'));
const Profile = lazy(() => import('../pages/profile/Profile'));
const EditProfile = lazy(() => import('../pages/profile/EditProfile'));
const JobList = lazy(() => import('../pages/jobs/JobList'));
const JobDetailsPage = lazy(() => import('../pages/jobs/JobDetailsPage'));
const CreateJob = lazy(() => import('../pages/jobs/CreateJob'));
const AccessFeeGate = lazy(() => import('../pages/onboarding/AccessFeeGate'));

/** Full-page loading fallback shown while lazy chunks are fetched */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Main route configuration for the application.
 * Defines all routes with appropriate guards and redirects.
 * All page components are lazy-loaded for code splitting (Requirements: 23.3).
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public routes with shared header/footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Onboarding: access-fee gate (authenticated but unverified artisans) */}
      <Route
        path="/onboarding/access-fee"
        element={
          <ProtectedRoute>
            <AccessFeeGate />
          </ProtectedRoute>
        }
      />

      {/* Protected routes with sidebar layout */}
      <Route
        element={
          <ProtectedRoute>
            <ArtisanRoute>
              <AuthenticatedLayout />
            </ArtisanRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/artisans/:id" element={<ArtisanProfilePage />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/create" element={<CreateJob />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/escrow/history" element={<EscrowHistoryPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:jobId" element={<ChatPage />} />
        <Route path="/reviews/create" element={<CreateReviewPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
      </Route>

      {/* Admin routes with admin sidebar layout */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}
