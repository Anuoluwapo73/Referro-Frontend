import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../auth.api';
import { userApi } from '../user.api';
import { jobApi } from '../job.api';
import { paymentApi } from '../payment.api';
import { escrowApi } from '../escrow.api';
import { walletApi } from '../wallet.api';
import { chatApi } from '../chat.api';
import { reviewApi } from '../review.api';
import { placesApi } from '../places.api';
import { adminApi } from '../admin.api';
import apiClient from '../client';

// Mock the API client
vi.mock('../client', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('API Service Modules', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Auth API', () => {
        it('should have register method', () => {
            expect(authApi.register).toBeDefined();
            expect(typeof authApi.register).toBe('function');
        });

        it('should have login method', () => {
            expect(authApi.login).toBeDefined();
            expect(typeof authApi.login).toBe('function');
        });

        it('should have getSession method', () => {
            expect(authApi.getSession).toBeDefined();
            expect(typeof authApi.getSession).toBe('function');
        });

        it('should have logout method', () => {
            expect(authApi.logout).toBeDefined();
            expect(typeof authApi.logout).toBe('function');
        });
    });

    describe('User API', () => {
        it('should have getProfile method', () => {
            expect(userApi.getProfile).toBeDefined();
            expect(typeof userApi.getProfile).toBe('function');
        });

        it('should have updateProfile method', () => {
            expect(userApi.updateProfile).toBeDefined();
            expect(typeof userApi.updateProfile).toBe('function');
        });

        it('should have updateAddress method', () => {
            expect(userApi.updateAddress).toBeDefined();
            expect(typeof userApi.updateAddress).toBe('function');
        });

        it('should have getArtisans method', () => {
            expect(userApi.getArtisans).toBeDefined();
            expect(typeof userApi.getArtisans).toBe('function');
        });

        it('should have getArtisan method', () => {
            expect(userApi.getArtisan).toBeDefined();
            expect(typeof userApi.getArtisan).toBe('function');
        });
    });

    describe('Job API', () => {
        it('should have getJobs method', () => {
            expect(jobApi.getJobs).toBeDefined();
            expect(typeof jobApi.getJobs).toBe('function');
        });

        it('should have createJob method', () => {
            expect(jobApi.createJob).toBeDefined();
            expect(typeof jobApi.createJob).toBe('function');
        });

        it('should have assignArtisan method', () => {
            expect(jobApi.assignArtisan).toBeDefined();
            expect(typeof jobApi.assignArtisan).toBe('function');
        });

        it('should have startJob method', () => {
            expect(jobApi.startJob).toBeDefined();
            expect(typeof jobApi.startJob).toBe('function');
        });

        it('should have completeJob method', () => {
            expect(jobApi.completeJob).toBeDefined();
            expect(typeof jobApi.completeJob).toBe('function');
        });

        it('should have cancelJob method', () => {
            expect(jobApi.cancelJob).toBeDefined();
            expect(typeof jobApi.cancelJob).toBe('function');
        });

        it('should have findNearbyJobs method', () => {
            expect(jobApi.findNearbyJobs).toBeDefined();
            expect(typeof jobApi.findNearbyJobs).toBe('function');
        });
    });

    describe('Payment API', () => {
        it('should have initializePayment method', () => {
            expect(paymentApi.initializePayment).toBeDefined();
            expect(typeof paymentApi.initializePayment).toBe('function');
        });

        it('should have verifyPayment method', () => {
            expect(paymentApi.verifyPayment).toBeDefined();
            expect(typeof paymentApi.verifyPayment).toBe('function');
        });
    });

    describe('Escrow API', () => {
        it('should have getEscrow method', () => {
            expect(escrowApi.getEscrow).toBeDefined();
            expect(typeof escrowApi.getEscrow).toBe('function');
        });

        it('should have releaseEscrow method', () => {
            expect(escrowApi.releaseEscrow).toBeDefined();
            expect(typeof escrowApi.releaseEscrow).toBe('function');
        });

        it('should have createDispute method', () => {
            expect(escrowApi.createDispute).toBeDefined();
            expect(typeof escrowApi.createDispute).toBe('function');
        });

        it('should have getEscrowHistory method', () => {
            expect(escrowApi.getEscrowHistory).toBeDefined();
            expect(typeof escrowApi.getEscrowHistory).toBe('function');
        });
    });

    describe('Wallet API', () => {
        it('should have getWallet method', () => {
            expect(walletApi.getWallet).toBeDefined();
            expect(typeof walletApi.getWallet).toBe('function');
        });

        it('should have getTransactions method', () => {
            expect(walletApi.getTransactions).toBeDefined();
            expect(typeof walletApi.getTransactions).toBe('function');
        });

        it('should have requestWithdrawal method', () => {
            expect(walletApi.requestWithdrawal).toBeDefined();
            expect(typeof walletApi.requestWithdrawal).toBe('function');
        });
    });

    describe('Chat API', () => {
        it('should have getMessages method', () => {
            expect(chatApi.getMessages).toBeDefined();
            expect(typeof chatApi.getMessages).toBe('function');
        });

        it('should have sendMessage method', () => {
            expect(chatApi.sendMessage).toBeDefined();
            expect(typeof chatApi.sendMessage).toBe('function');
        });

        it('should have markAsRead method', () => {
            expect(chatApi.markAsRead).toBeDefined();
            expect(typeof chatApi.markAsRead).toBe('function');
        });

        it('should have getConversations method', () => {
            expect(chatApi.getConversations).toBeDefined();
            expect(typeof chatApi.getConversations).toBe('function');
        });
    });

    describe('Review API', () => {
        it('should have createReview method', () => {
            expect(reviewApi.createReview).toBeDefined();
            expect(typeof reviewApi.createReview).toBe('function');
        });

        it('should have getUserReviews method', () => {
            expect(reviewApi.getUserReviews).toBeDefined();
            expect(typeof reviewApi.getUserReviews).toBe('function');
        });

        it('should have getReview method', () => {
            expect(reviewApi.getReview).toBeDefined();
            expect(typeof reviewApi.getReview).toBe('function');
        });
    });

    describe('Places API', () => {
        it('should have autocomplete method', () => {
            expect(placesApi.autocomplete).toBeDefined();
            expect(typeof placesApi.autocomplete).toBe('function');
        });

        it('should have geocode method', () => {
            expect(placesApi.geocode).toBeDefined();
            expect(typeof placesApi.geocode).toBe('function');
        });
    });

    describe('Admin API', () => {
        it('should have getStats method', () => {
            expect(adminApi.getStats).toBeDefined();
            expect(typeof adminApi.getStats).toBe('function');
        });

        it('should have getUsers method', () => {
            expect(adminApi.getUsers).toBeDefined();
            expect(typeof adminApi.getUsers).toBe('function');
        });

        it('should have verifyUser method', () => {
            expect(adminApi.verifyUser).toBeDefined();
            expect(typeof adminApi.verifyUser).toBe('function');
        });

        it('should have getTransactions method', () => {
            expect(adminApi.getTransactions).toBeDefined();
            expect(typeof adminApi.getTransactions).toBe('function');
        });
    });
});
