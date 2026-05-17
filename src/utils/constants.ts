// User types
export const USER_TYPES = {
    CUSTOMER: 'CUSTOMER',
    ARTISAN: 'ARTISAN',
    REFERRER: 'REFERRER',
    ADMIN: 'ADMIN',
} as const;

// Tier levels
export const TIER_LEVELS = {
    EXPLORER: 'EXPLORER',
    VERIFIED: 'VERIFIED',
    SHIELD: 'SHIELD',
} as const;

// Job statuses
export const JOB_STATUS = {
    POSTED: 'POSTED',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    DISPUTED: 'DISPUTED',
    CANCELLED: 'CANCELLED',
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    REFUNDED: 'REFUNDED',
    FAILED: 'FAILED',
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT',
    ESCROW_HOLD: 'ESCROW_HOLD',
    ESCROW_RELEASE: 'ESCROW_RELEASE',
    REFERRAL_COMMISSION: 'REFERRAL_COMMISSION',
    WITHDRAWAL: 'WITHDRAWAL',
} as const;

// Transaction statuses
export const TRANSACTION_STATUS = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
} as const;

// Trades/Services
export const TRADES = [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Cleaning',
    'Landscaping',
    'HVAC',
    'Roofing',
    'Masonry',
    'Welding',
    'Other',
] as const;

// API configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    TIMEOUT: 30000,
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
};

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
    CHAT_MESSAGES: 5000,
    NOTIFICATIONS: 10000,
};

// Local storage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER: 'user',
    THEME: 'theme',
};
