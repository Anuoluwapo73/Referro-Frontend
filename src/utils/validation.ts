import { z } from 'zod';

// Phone number validation (Nigerian format)
export const phoneNumberSchema = z
    .string()
    .regex(/^(\+234|0)[789]\d{9}$/, 'Invalid phone number format');

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Registration schema
export const registrationSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: emailSchema,
    password: z.string().min(6, 'Password must be at least 6 characters'),
    userType: z.enum(['CUSTOMER', 'ARTISAN', 'REFERRER']),
    referralCode: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

// Job creation schema
export const jobSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().optional(),
    trade: z.string().min(1, 'Trade is required'),
    budget: z.number().positive('Budget must be positive').optional(),
    location: z.string().min(5, 'Location is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    scheduledDate: z.string().optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    email: emailSchema.optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    lga: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    placeId: z.string().optional(),
});

// Review schema
export const reviewSchema = z.object({
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

// Withdrawal schema
export const withdrawalSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    bankName: z.string().min(1, 'Bank name is required'),
    accountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
    accountName: z.string().min(1, 'Account name is required'),
});
