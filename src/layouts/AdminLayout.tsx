import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

/**
 * AdminLayout wraps admin-only pages with a header and admin sidebar.
 * Requirements: 17.1, 20.1, 20.2, 22.1
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Skip navigation link for keyboard users - Requirement 22.1 */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      <Header showSidebarToggle />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar userType="ADMIN" />
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
