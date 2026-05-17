// User types
export type UserType = 'CUSTOMER' | 'ARTISAN' | 'REFERRER' | 'ADMIN';
export type TierLevel = 'EXPLORER' | 'VERIFIED' | 'SHIELD';

export interface User {
    id: string;
    phoneNumber: string;
    email?: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    userType: UserType;
    tierLevel: TierLevel;
    trustScore: number;
    isVerified: boolean;
    address?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    updatedAt: string;
}

// Artisan profile
export interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
}

export interface ArtisanProfile {
    id: string;
    userId: string;
    trade: string;
    specialization?: string;
    yearsOfExperience?: number;
    dailyRate?: number;
    hourlyRate?: number;
    rating: number;
    reviewCount: number;
    completedJobs: number;
    portfolio?: PortfolioItem[];
}

// Job types
export type JobStatus = 'POSTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface Job {
    id: string;
    title: string;
    description?: string;
    trade: string;
    budget?: number;
    quotedPrice?: number;
    finalPrice?: number;
    status: JobStatus;
    paymentStatus: PaymentStatus;
    location?: {
        address: string;
        city: string;
        state: string;
    };
    latitude?: number;
    longitude?: number;
    scheduledDate?: string;
    customerId: string;
    customer?: User;
    artisanId?: string;
    artisan?: User;
    createdAt: string;
    updatedAt: string;
}

// Message types
export interface Message {
    id: string;
    jobId: string;
    senderId: string;
    sender: User;
    receiverId: string;
    receiver: User;
    content: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

// Wallet types
export type TransactionType =
    | 'CREDIT'
    | 'DEBIT'
    | 'ESCROW_HOLD'
    | 'ESCROW_RELEASE'
    | 'REFERRAL_COMMISSION'
    | 'WITHDRAWAL';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    ledger: number;
}

export interface Transaction {
    id: string;
    walletId: string;
    amount: number;
    type: TransactionType;
    status: TransactionStatus;
    reference: string;
    description?: string;
    createdAt: string;
}

// Review types
export interface Review {
    id: string;
    jobId: string;
    reviewerId: string;
    reviewer: User;
    revieweeId: string;
    reviewee: User;
    rating: number;
    comment: string;
    createdAt: string;
}

// Escrow types
export interface Escrow {
    id: string;
    jobId: string;
    totalAmount: number;
    releasedAmount: number;
    escrowBalance: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
