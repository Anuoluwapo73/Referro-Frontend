import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentApi } from '../../api/payment.api';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';

// Paystack inline popup type (loaded via script tag in index.html)
declare global {
    interface Window {
        PaystackPop: {
            setup: (options: {
                key: string;
                email: string;
                amount: number;
                ref: string;
                currency?: string;
                callback: (response: { reference: string }) => void;
                onClose: () => void;
            }) => { openIframe: () => void };
        };
    }
}

/**
 * AccessFeeGate — shown to unverified artisans on first login.
 * Collects ₦1,000 onboarding fee via Paystack, then unlocks the dashboard.
 * Requirements: US-1.1, P-5
 */
export default function AccessFeeGate() {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore((s) => ({ user: s.user, setUser: s.setUser }));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handlePay() {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            // 1. Initialize payment on backend — gets Paystack reference + public key
            const data = await paymentApi.initializeAccessFee() as unknown as {
                reference: string;
                publicKey: string;
                email: string;
                amount: number;
            };

            // 2. Open Paystack inline popup
            const handler = window.PaystackPop.setup({
                key: data.publicKey,
                email: data.email,
                amount: data.amount, // already in kobo from backend
                ref: data.reference,
                currency: 'NGN',
                callback: async (response) => {
                    // 3. Verify payment and unlock dashboard
                    try {
                        await paymentApi.verifyAccessFee(response.reference);

                        // 4. Refresh session to get updated isVerified + tierLevel
                        const sessionData = await authApi.getSession() as unknown as { user: typeof user };
                        if (sessionData?.user) {
                            setUser(sessionData.user);
                        }

                        navigate('/dashboard', { replace: true });
                    } catch (verifyErr: unknown) {
                        const msg = verifyErr instanceof Error ? verifyErr.message : 'Payment verification failed.';
                        setError(msg);
                        setLoading(false);
                    }
                },
                onClose: () => {
                    setLoading(false);
                },
            });

            handler.openIframe();
        } catch (initErr: unknown) {
            const msg = initErr instanceof Error ? initErr.message : 'Could not initialize payment.';
            setError(msg);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                    <svg
                        className="h-8 w-8 text-primary-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Unlock Your Dashboard</h1>
                <p className="text-gray-500 mb-6">
                    Pay a one-time ₦1,000 access fee to activate your Pro account and start accepting jobs.
                </p>

                {/* Benefits */}
                <ul className="text-left space-y-2 mb-8">
                    {[
                        'Accept job requests from customers',
                        'Get a verified "Pro" badge on your profile',
                        'Access your full artisan dashboard',
                    ].map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-gray-700">
                            <svg
                                className="h-4 w-4 text-green-500 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {benefit}
                        </li>
                    ))}
                </ul>

                {error && (
                    <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        {error}
                    </p>
                )}

                <Button
                    onClick={handlePay}
                    isLoading={loading}
                    size="lg"
                    className="w-full"
                >
                    Pay ₦1,000 via Paystack
                </Button>

                <p className="mt-4 text-xs text-gray-400">
                    Secured by Paystack. Your payment is safe and encrypted.
                </p>
            </div>
        </div>
    );
}
