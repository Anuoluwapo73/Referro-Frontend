import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../common/NotificationBell';

interface HeaderProps {
  showSidebarToggle?: boolean;
}

export default function Header({ showSidebarToggle = false }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-ink sticky top-0 z-40 border-b border-white/10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {showSidebarToggle && (
              <button
                onClick={toggleSidebar}
                aria-label="Toggle sidebar navigation"
                className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <Link
              to="/"
              aria-label="Referro home"
              className="flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
            >
              <span className="font-display text-xl font-bold text-white tracking-tight">Referro</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mb-1 flex-shrink-0" aria-hidden="true" />
            </Link>
          </div>

          {/* Right: nav links or user menu */}
          <nav aria-label="User navigation">
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-1">
                  <NotificationBell />
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                      aria-label={`${user.fullName} account menu`}
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="menu"
                      className="flex items-center gap-2 p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 min-h-[44px]"
                    >
                      <div className="w-9 h-9 bg-primary-600/20 text-primary-400 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0 border border-primary-600/30" aria-hidden="true">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(user.fullName)
                        )}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-white/80 max-w-[120px] truncate">
                        {user.fullName}
                      </span>
                      <svg className="hidden sm:block h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isUserMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsUserMenuOpen(false)}
                          aria-hidden="true"
                        />
                        <div
                          role="menu"
                          aria-label="User account options"
                          className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-md border border-line z-20 py-1"
                        >
                          <div className="px-4 py-3 border-b border-line" role="none">
                            <p className="text-sm font-medium text-ink truncate">{user.fullName}</p>
                            <p className="text-xs text-slate capitalize">{user.userType.toLowerCase()}</p>
                          </div>
                          <Link
                            to="/profile"
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-3 text-sm text-ink hover:bg-primary-50 focus:outline-none focus-visible:bg-primary-50 transition-colors"
                          >
                            Profile
                          </Link>
                          <Link
                            to="/dashboard"
                            role="menuitem"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-3 text-sm text-ink hover:bg-primary-50 focus:outline-none focus-visible:bg-primary-50 transition-colors"
                          >
                            Dashboard
                          </Link>
                          <button
                            role="menuitem"
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-error hover:bg-red-50 focus:outline-none focus-visible:bg-red-50 transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-white/70 hover:text-white px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 min-h-[44px] flex items-center transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-ink min-h-[44px] flex items-center shadow-blue"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
