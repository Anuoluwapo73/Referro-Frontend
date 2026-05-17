# Routing and Navigation

This directory contains the routing configuration and route guard components for the Referro React application.

## Components

### ProtectedRoute
Guards routes that require authentication. Redirects unauthenticated users to the login page while preserving the intended destination in location state.

**Usage:**
```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

**Behavior:**
- If user is authenticated: renders children
- If user is not authenticated: redirects to `/login` with `state.from` containing the original location

### AdminRoute
Guards routes that require admin privileges. Redirects non-admin users to their dashboard and unauthenticated users to login.

**Usage:**
```tsx
<Route
  path="/admin/dashboard"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>
```

**Behavior:**
- If user is authenticated and is admin: renders children
- If user is not authenticated: redirects to `/login` with `state.from` containing the original location
- If user is authenticated but not admin: redirects to `/dashboard`

### AppRoutes
Main route configuration component that defines all application routes.

**Features:**
- Public routes (login, register)
- Protected routes (dashboard)
- Admin routes (admin dashboard)
- 404 Not Found page for invalid routes
- Automatic redirects based on authentication state

## Redirect After Login

Both Login and Register pages handle redirect after successful authentication:

1. Check if there's a `location.state.from` value (set by ProtectedRoute or AdminRoute)
2. If yes, redirect to that location
3. If no, redirect to the appropriate dashboard based on user type:
   - ADMIN → `/admin/dashboard`
   - CUSTOMER/ARTISAN/REFERRER → `/dashboard`

## Requirements Validation

This implementation satisfies the following requirements:

- **20.1**: Routes map to page components via React Router
- **20.2**: Navigation links update URL and render target page
- **20.3**: Unauthenticated users accessing protected routes are redirected to login
- **20.4**: Browser back button navigates to previous page (handled by React Router)
- **20.5**: Invalid routes display 404 error page

## Testing

To test the routing functionality:

1. **Protected Route Access Control**
   - Navigate to `/dashboard` without being logged in
   - Should redirect to `/login`
   - After login, should redirect back to `/dashboard`

2. **Admin Route Access Control**
   - Navigate to `/admin/dashboard` without being logged in
   - Should redirect to `/login`
   - Login as non-admin user
   - Should redirect to `/dashboard` instead of admin dashboard
   - Login as admin user
   - Should access `/admin/dashboard` successfully

3. **404 Not Found**
   - Navigate to any invalid route (e.g., `/invalid-route`)
   - Should display 404 page with navigation links

4. **Browser Navigation**
   - Use browser back/forward buttons
   - Should navigate through history correctly
