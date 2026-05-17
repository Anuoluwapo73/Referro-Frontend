# State Management

This directory contains Zustand stores for global state management in the Referro React application.

## Stores

### Auth Store (`authStore.ts`)

Manages authentication state including user information and JWT tokens. State is persisted to localStorage.

**State:**
- `user`: Current user object or null
- `token`: JWT authentication token or null
- `isAuthenticated`: Boolean indicating authentication status

**Actions:**
- `setUser(user)`: Update user information
- `setToken(token)`: Update authentication token
- `setAuth(user, token)`: Set both user and token (for login)
- `clearAuth()`: Clear all auth state (for logout)

**Usage:**

```typescript
import { useAuthStore, selectUser, selectIsAuthenticated } from '@/store';

// Using the full store
function MyComponent() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  // ...
}

// Using optimized selectors (recommended for performance)
function MyComponent() {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  // ...
}
```

**Available Selectors:**
- `selectUser`: Get user object
- `selectToken`: Get authentication token
- `selectIsAuthenticated`: Get authentication status
- `selectUserType`: Get user type (CUSTOMER, ARTISAN, etc.)
- `selectUserId`: Get user ID
- `selectUserFullName`: Get user's full name

### UI Store (`uiStore.ts`)

Manages global UI state for sidebar, modals, and other UI elements.

**State:**
- `isSidebarOpen`: Boolean for sidebar visibility
- `isModalOpen`: Boolean for modal visibility
- `modalContent`: React node to render in modal

**Actions:**
- `toggleSidebar()`: Toggle sidebar open/closed
- `openSidebar()`: Open sidebar
- `closeSidebar()`: Close sidebar
- `openModal(content)`: Open modal with content
- `closeModal()`: Close modal and clear content

**Usage:**

```typescript
import { useUIStore, selectIsSidebarOpen } from '@/store';

// Using the full store
function MyComponent() {
  const { isSidebarOpen, toggleSidebar, openModal } = useUIStore();
  // ...
}

// Using optimized selectors (recommended for performance)
function MyComponent() {
  const isSidebarOpen = useUIStore(selectIsSidebarOpen);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  // ...
}
```

**Available Selectors:**
- `selectIsSidebarOpen`: Get sidebar open state
- `selectIsModalOpen`: Get modal open state
- `selectModalContent`: Get modal content

## Best Practices

### 1. Use Selectors for Performance

Always use selectors when you only need specific pieces of state. This prevents unnecessary re-renders:

```typescript
// ❌ Bad - component re-renders on any auth state change
const { user, token, isAuthenticated } = useAuthStore();

// ✅ Good - component only re-renders when user changes
const user = useAuthStore(selectUser);
```

### 2. Persist Only Necessary Data

The auth store persists to localStorage automatically. Only authentication-related data should be stored here.

### 3. Keep UI State Ephemeral

The UI store does NOT persist to localStorage. UI state like sidebar/modal visibility should reset on page refresh.

### 4. Avoid Storing Derived State

Don't store data that can be computed from existing state. Use selectors or useMemo instead:

```typescript
// ❌ Bad - storing derived state
const isAdmin = user?.userType === 'ADMIN';

// ✅ Good - compute when needed
const isAdmin = useAuthStore(state => state.user?.userType === 'ADMIN');
```

## Testing

When testing components that use these stores, you can mock them or reset state between tests:

```typescript
import { useAuthStore } from '@/store';

beforeEach(() => {
  // Reset auth store
  useAuthStore.getState().clearAuth();
});
```

## Requirements Validation

This implementation satisfies the following requirements:

- **24.1**: Global authentication state updates
- **24.2**: Centralized state management for API data
- **24.3**: Shared state accessible from multiple components
- **24.4**: Optimized re-renders via selectors
- **24.5**: State restoration from localStorage on initialization
