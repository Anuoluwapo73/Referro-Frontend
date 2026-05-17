import toast, { Toaster, ToastOptions } from 'react-hot-toast';

// Toast configuration
const defaultOptions: ToastOptions = {
  duration: 5000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
  },
};

// Toast utility functions
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      ...defaultOptions,
      ...options,
      icon: '✓',
      style: {
        ...defaultOptions.style,
        background: '#10b981',
        color: '#fff',
      },
    });
  },
  
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      ...defaultOptions,
      ...options,
      icon: '✕',
      style: {
        ...defaultOptions.style,
        background: '#ef4444',
        color: '#fff',
      },
    });
  },
  
  warning: (message: string, options?: ToastOptions) => {
    toast(message, {
      ...defaultOptions,
      ...options,
      icon: '⚠',
      style: {
        ...defaultOptions.style,
        background: '#f59e0b',
        color: '#fff',
      },
    });
  },
  
  info: (message: string, options?: ToastOptions) => {
    toast(message, {
      ...defaultOptions,
      ...options,
      icon: 'ℹ',
      style: {
        ...defaultOptions.style,
        background: '#3b82f6',
        color: '#fff',
      },
    });
  },
  
  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options,
    });
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      messages,
      {
        ...defaultOptions,
        ...options,
      }
    );
  },
};

// Toaster component to be added to App root
export const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 5000,
        style: {
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
        },
      }}
    />
  );
};

export default showToast;
