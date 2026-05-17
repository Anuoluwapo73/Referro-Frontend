# Common UI Components

This directory contains reusable UI components used throughout the Referro React application.

## Components

### Button
A versatile button component with multiple variants and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (default: false)
- All standard HTML button attributes

**Usage:**
```tsx
import { Button } from '@/components/common';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

<Button variant="outline" size="lg" isLoading={isSubmitting}>
  Submit
</Button>
```

### Input
An input component with label, error states, and helper text support.

**Props:**
- `label`: string (optional)
- `error`: string (optional)
- `helperText`: string (optional)
- All standard HTML input attributes

**Usage:**
```tsx
import { Input } from '@/components/common';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  helperText="We'll never share your email"
/>
```

### Card
A container component for content with customizable padding and shadow.

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `shadow`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `hover`: boolean (default: false)
- `className`: string (optional)

**Usage:**
```tsx
import { Card } from '@/components/common';

<Card padding="lg" shadow="lg" hover>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Modal
A modal dialog component with overlay and close functionality.

**Props:**
- `isOpen`: boolean (required)
- `onClose`: () => void (required)
- `title`: string (optional)
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `showCloseButton`: boolean (default: true)

**Usage:**
```tsx
import { Modal } from '@/components/common';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-2 mt-4">
    <Button onClick={handleConfirm}>Confirm</Button>
    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
      Cancel
    </Button>
  </div>
</Modal>
```

### Spinner
A loading spinner component with various sizes and colors.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `color`: 'primary' | 'secondary' | 'white' | 'gray' (default: 'primary')
- `fullScreen`: boolean (default: false)
- `label`: string (default: 'Loading...')

**Usage:**
```tsx
import { Spinner } from '@/components/common';

<Spinner size="lg" color="primary" />

<Spinner fullScreen label="Loading data..." />
```

### Toast
A toast notification system using react-hot-toast.

**Methods:**
- `showToast.success(message, options?)`
- `showToast.error(message, options?)`
- `showToast.warning(message, options?)`
- `showToast.info(message, options?)`
- `showToast.loading(message, options?)`
- `showToast.dismiss(toastId?)`
- `showToast.promise(promise, messages, options?)`

**Usage:**
```tsx
import { showToast, ToastContainer } from '@/components/common';

// In your App.tsx, add the ToastContainer
<ToastContainer />

// In your components
showToast.success('Job created successfully!');
showToast.error('Failed to create job');
showToast.warning('Please verify your email');
showToast.info('New message received');

// For async operations
const loadingToast = showToast.loading('Creating job...');
// ... after operation
showToast.dismiss(loadingToast);
showToast.success('Job created!');

// Or use promise helper
showToast.promise(
  createJobApi(data),
  {
    loading: 'Creating job...',
    success: 'Job created successfully!',
    error: 'Failed to create job',
  }
);
```

### ErrorBoundary
A React error boundary component that catches JavaScript errors in the component tree.

**Props:**
- `children`: ReactNode (required)
- `fallback`: ReactNode (optional)
- `onError`: (error: Error, errorInfo: ErrorInfo) => void (optional)

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/common';

// Wrap your app or specific components
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to error tracking service
    console.error('Error caught:', error, errorInfo);
  }}
>
  <App />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  fallback={
    <div>
      <h1>Something went wrong</h1>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  }
>
  <MyComponent />
</ErrorBoundary>
```

## Accessibility

All components follow WCAG 2.1 AA accessibility guidelines:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader compatibility
- Semantic HTML elements

## Styling

Components use Tailwind CSS utility classes and follow the design system defined in `tailwind.config.js`. All components support custom className props for additional styling.
