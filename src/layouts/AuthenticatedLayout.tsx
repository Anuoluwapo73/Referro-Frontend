import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

/**
 * AuthenticatedLayout wraps protected pages with a header and role-based sidebar.
 * On desktop: persistent left sidebar. On mobile: slide-in drawer + bottom nav bar.
 * Requirements: 3.1, 20.1, 20.2, 22.1
 */
export default function AuthenticatedLayout() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const userType = user?.userType ?? 'CUSTOMER';

  // Refresh user from server on mount to pick up any score/profile changes
  useEffect(() => {
    authApi.getSession().then((res: any) => {
      const fresh = res?.user ?? res;
      if (fresh?.id) setUser(fresh);
    }).catch(() => {/* non-fatal */});
  }, [setUser]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Skip navigation link for keyboard users - Requirement 22.1 */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      <Header showSidebarToggle />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: on desktop it's static in the flex row; on mobile it's a fixed drawer + bottom nav */}
        <Sidebar userType={userType} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
