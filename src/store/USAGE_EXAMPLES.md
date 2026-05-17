# Store Usage Examples

This document provides practical examples of how to use the Zustand stores in the Referro application.

## Auth Store Examples

### Example 1: Login Flow

```typescript
import { useAuthStore } from '@/store';
import { authApi } from '@/api';

function LoginComponent() {
  const setAuth = useAuthStore(state => state.setAuth);
  
  const handleLogin = async (phoneNumber: string, otp: string) => {
    try {
      const response = await authApi.verifyOTP(phoneNumber, otp);
      // Store user and token after successful login
      setAuth(response.user, response.token);
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    // ... login form
  );
}
```

### Example 2: Logout Flow

```typescript
import { useAuthStore } from '@/store';

function LogoutButton() {
  const clearAuth = useAuthStore(state => state.clearAuth);
  
  const handleLogout = () => {
    clearAuth(); // Clears user, token, and sets isAuthenticated to false
    navigate('/login');
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

### Example 3: Protected Route

```typescript
import { useAuthStore, selectIsAuthenticated } from '@/store';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Using selector for optimal performance
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}
```

### Example 4: Display User Info

```typescript
import { useAuthStore, selectUser, selectUserFullName } from '@/store';

function UserProfile() {
  // Option 1: Get full user object
  const user = useAuthStore(selectUser);
  
  // Option 2: Get specific field (more optimized)
  const fullName = useAuthStore(selectUserFullName);
  
  return (
    <div>
      <h1>Welcome, {fullName}!</h1>
      <p>Email: {user?.email}</p>
      <p>Trust Score: {user?.trustScore}</p>
    </div>
  );
}
```

### Example 5: Role-Based Access

```typescript
import { useAuthStore, selectUserType } from '@/store';

function AdminPanel() {
  const userType = useAuthStore(selectUserType);
  
  if (userType !== 'ADMIN') {
    return <div>Access Denied</div>;
  }
  
  return (
    <div>
      {/* Admin content */}
    </div>
  );
}
```

### Example 6: Token for API Requests

```typescript
import { useAuthStore, selectToken } from '@/store';
import axios from 'axios';

function useApiRequest() {
  const token = useAuthStore(selectToken);
  
  const makeRequest = async (url: string) => {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  };
  
  return { makeRequest };
}
```

## UI Store Examples

### Example 1: Sidebar Toggle

```typescript
import { useUIStore, selectIsSidebarOpen } from '@/store';

function Sidebar() {
  const isSidebarOpen = useUIStore(selectIsSidebarOpen);
  const closeSidebar = useUIStore(state => state.closeSidebar);
  
  return (
    <aside className={isSidebarOpen ? 'open' : 'closed'}>
      <button onClick={closeSidebar}>Close</button>
      {/* Sidebar content */}
    </aside>
  );
}

function Header() {
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  
  return (
    <header>
      <button onClick={toggleSidebar}>Menu</button>
    </header>
  );
}
```

### Example 2: Modal Management

```typescript
import { useUIStore, selectIsModalOpen, selectModalContent } from '@/store';

function ModalContainer() {
  const isModalOpen = useUIStore(selectIsModalOpen);
  const modalContent = useUIStore(selectModalContent);
  const closeModal = useUIStore(state => state.closeModal);
  
  if (!isModalOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {modalContent}
        <button onClick={closeModal}>Close</button>
      </div>
    </div>
  );
}

function PaymentButton() {
  const openModal = useUIStore(state => state.openModal);
  
  const handlePayment = () => {
    openModal(
      <div>
        <h2>Payment</h2>
        <p>Enter payment details...</p>
      </div>
    );
  };
  
  return <button onClick={handlePayment}>Make Payment</button>;
}
```

### Example 3: Confirmation Dialog

```typescript
import { useUIStore } from '@/store';

function useConfirmDialog() {
  const openModal = useUIStore(state => state.openModal);
  const closeModal = useUIStore(state => state.closeModal);
  
  const confirm = (message: string, onConfirm: () => void) => {
    openModal(
      <div>
        <p>{message}</p>
        <button onClick={() => {
          onConfirm();
          closeModal();
        }}>
          Confirm
        </button>
        <button onClick={closeModal}>Cancel</button>
      </div>
    );
  };
  
  return { confirm };
}

function DeleteButton() {
  const { confirm } = useConfirmDialog();
  
  const handleDelete = () => {
    confirm('Are you sure you want to delete this item?', () => {
      // Perform delete operation
      console.log('Item deleted');
    });
  };
  
  return <button onClick={handleDelete}>Delete</button>;
}
```

## Combined Store Usage

### Example: Complete Authentication Flow

```typescript
import { useAuthStore, useUIStore } from '@/store';
import { authApi } from '@/api';

function AuthFlow() {
  const setAuth = useAuthStore(state => state.setAuth);
  const openModal = useUIStore(state => state.openModal);
  const closeModal = useUIStore(state => state.closeModal);
  
  const handleLogin = async (phoneNumber: string) => {
    try {
      // Send OTP
      await authApi.sendOTP(phoneNumber);
      
      // Open OTP verification modal
      openModal(
        <OTPVerificationModal
          phoneNumber={phoneNumber}
          onVerify={async (otp) => {
            const response = await authApi.verifyOTP(phoneNumber, otp);
            setAuth(response.user, response.token);
            closeModal();
            navigate('/dashboard');
          }}
        />
      );
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    // ... login form
  );
}
```

## Performance Tips

### 1. Use Selectors for Specific Data

```typescript
// ❌ Bad - component re-renders on any auth change
function UserName() {
  const { user } = useAuthStore();
  return <span>{user?.fullName}</span>;
}

// ✅ Good - component only re-renders when fullName changes
function UserName() {
  const fullName = useAuthStore(selectUserFullName);
  return <span>{fullName}</span>;
}
```

### 2. Create Custom Selectors

```typescript
// Create a custom selector for complex logic
const selectIsAdmin = (state: AuthState) => 
  state.user?.userType === 'ADMIN';

function AdminButton() {
  const isAdmin = useAuthStore(selectIsAdmin);
  if (!isAdmin) return null;
  return <button>Admin Panel</button>;
}
```

### 3. Combine Multiple Selectors

```typescript
function UserCard() {
  const fullName = useAuthStore(selectUserFullName);
  const userType = useAuthStore(selectUserType);
  const isSidebarOpen = useUIStore(selectIsSidebarOpen);
  
  return (
    <div className={isSidebarOpen ? 'expanded' : 'collapsed'}>
      <h3>{fullName}</h3>
      <p>{userType}</p>
    </div>
  );
}
```

## Testing Examples

### Example: Testing with Store

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.getState().clearAuth();
  });
  
  it('should set authentication state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      id: '1',
      fullName: 'John Doe',
      userType: 'CUSTOMER',
      // ... other user fields
    };
    const mockToken = 'test-token';
    
    act(() => {
      result.current.setAuth(mockUser, mockToken);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
  });
  
  it('should clear authentication state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    // Set auth first
    act(() => {
      result.current.setAuth(mockUser, mockToken);
    });
    
    // Then clear
    act(() => {
      result.current.clearAuth();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```
