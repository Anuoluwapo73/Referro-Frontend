import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../common/Input';
import Button from '../common/Button';
import AddressSearch, { AddressSearchValue } from '../common/AddressSearch';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

// ── Trade list ────────────────────────────────────────────────────────────────
const TRADES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Welder',
  'Mason / Bricklayer',
  'Tiler',
  'Roofer',
  'AC Technician',
  'Generator Technician',
  'Auto Mechanic',
  'Vulcanizer',
  'Tailor / Fashion Designer',
  'Barber',
  'Hair Stylist',
  'Make-up Artist',
  'Photographer',
  'Videographer',
  'Graphic Designer',
  'Web Developer',
  'Caterer / Chef',
  'Event Decorator',
  'Cleaner / Housekeeper',
  'Security Guard',
  'Laundry / Dry Cleaning',
  'Fumigator / Pest Control',
  'Gardener / Landscaper',
  'Nanny / Babysitter',
  'Tutor / Teacher',
  'Nurse / Caregiver',
  'Others',
];

const registerSchema = z.object({
    lastName: z.string().min(1, 'Surname is required'),
    firstName: z.string().min(1, 'First name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    userType: z.enum(['CUSTOMER', 'ARTISAN', 'REFERRER'], {
        required_error: 'Please select a user type',
    }),
    referralCode: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [addressData, setAddressData] = useState<AddressSearchValue | null>(null);
    const [selectedTrade, setSelectedTrade] = useState('');
    const [customTrade, setCustomTrade] = useState('');
    const [tradeError, setTradeError] = useState('');
    const setAuth = useAuthStore((state) => state.setAuth);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const userType = watch('userType');
    const isArtisan = userType === 'ARTISAN';
    const isOther = selectedTrade === 'Others';
    const effectiveTrade = isOther ? customTrade.trim() : selectedTrade;

    const onSubmit = async (data: RegisterFormData) => {
        // Validate trade for artisans
        if (data.userType === 'ARTISAN') {
            if (!selectedTrade) { setTradeError('Please select your service'); return; }
            if (isOther && !customTrade.trim()) { setTradeError('Please describe your service'); return; }
        }
        setTradeError('');
        setIsLoading(true);

        try {
            const fullName = `${data.lastName} ${data.firstName}`.trim();
            const payload: any = {
                firstName: data.firstName,
                lastName: data.lastName,
                fullName,
                email: data.email,
                password: data.password,
                userType: data.userType,
                referralCode: data.referralCode || undefined,
            };

            if (data.userType === 'ARTISAN') {
                payload.trade = effectiveTrade;
            }

            if (addressData) {
                payload.address = addressData.address;
                payload.city = addressData.city;
                payload.state = addressData.state;
                payload.lga = addressData.lga;
                payload.latitude = addressData.latitude;
                payload.longitude = addressData.longitude;
                payload.placeId = addressData.placeId;
            }

            const response = await authApi.register(payload) as any;
            const user = response?.user ?? response?.data?.user;
            const token = response?.token ?? response?.data?.token;

            if (user && token) {
                setAuth(user, token);
                toast.success('Account created successfully!');
                if (onSuccess) onSuccess();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <Input
                        {...register('lastName')}
                        type="text"
                        label="Surname"
                        placeholder="e.g. Adeyemi"
                        error={errors.lastName?.message}
                        disabled={isLoading}
                        autoComplete="family-name"
                    />
                    <p className="mt-0.5 text-xs text-slate-light">Your family / last name</p>
                </div>
                <div>
                    <Input
                        {...register('firstName')}
                        type="text"
                        label="First Name"
                        placeholder="e.g. Chukwuemeka"
                        error={errors.firstName?.message}
                        disabled={isLoading}
                        autoComplete="given-name"
                    />
                    <p className="mt-0.5 text-xs text-slate-light">Your given / first name</p>
                </div>
            </div>

            <Input
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                error={errors.email?.message}
                disabled={isLoading}
                autoComplete="email"
            />
            <Input
                {...register('password')}
                type="password"
                label="Password"
                placeholder="At least 6 characters"
                error={errors.password?.message}
                disabled={isLoading}
                autoComplete="new-password"
            />

            {/* Role selector */}
            <div>
                <label className="block text-sm font-medium text-ink mb-1">
                    I am a <span className="text-error">*</span>
                </label>
                <select
                    {...register('userType')}
                    className={`w-full px-3 py-3 border-[1.5px] rounded-[10px] text-base focus:outline-none focus:ring-2 focus:ring-primary-600/10 transition-colors min-h-[44px] ${
                        errors.userType ? 'border-error' : 'border-line focus:border-primary-600'
                    } ${isLoading ? 'bg-[#F8FAFC] cursor-not-allowed' : 'bg-white'}`}
                    disabled={isLoading}
                >
                    <option value="">Select your role...</option>
                    <option value="CUSTOMER">Customer — I need services</option>
                    <option value="ARTISAN">Artisan — I provide services</option>
                    <option value="REFERRER">Referrer — I refer artisans</option>
                </select>
                {errors.userType && (
                    <p className="mt-1 text-sm text-error">{errors.userType.message}</p>
                )}
            </div>

            {/* Trade selector — only shown for artisans */}
            {isArtisan && (
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 space-y-3 animate-in fade-in">
                    <div>
                        <label className="block text-sm font-medium text-ink mb-1">
                            What service do you offer? <span className="text-error">*</span>
                        </label>
                        <p className="text-xs text-slate mb-2">Choose the one that best describes your main skill.</p>
                        <select
                            value={selectedTrade}
                            onChange={(e) => {
                                setSelectedTrade(e.target.value);
                                setCustomTrade('');
                                setTradeError('');
                            }}
                            disabled={isLoading}
                            className={`w-full px-3 py-3 border-[1.5px] rounded-[10px] text-base focus:outline-none focus:ring-2 focus:ring-primary-600/10 min-h-[44px] bg-white ${
                                tradeError && !selectedTrade ? 'border-error' : 'border-line focus:border-primary-600'
                            }`}
                        >
                            <option value="">Select a service...</option>
                            {TRADES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        {tradeError && (
                            <p className="mt-1 text-sm text-error">{tradeError}</p>
                        )}
                    </div>

                    {/* Custom trade input — shown when "Others" is selected */}
                    {isOther && (
                        <div>
                            <label className="block text-sm font-medium text-ink mb-1">
                                Describe your service <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                value={customTrade}
                                onChange={(e) => { setCustomTrade(e.target.value); setTradeError(''); }}
                                placeholder="e.g. Solar Panel Installer, CCTV Technician..."
                                disabled={isLoading}
                                maxLength={60}
                                className={`w-full px-3 py-3 border-[1.5px] rounded-[10px] text-base focus:outline-none focus:ring-2 focus:ring-primary-600/10 min-h-[44px] ${
                                    tradeError && isOther && !customTrade.trim() ? 'border-error' : 'border-line focus:border-primary-600'
                                }`}
                            />
                            <p className="mt-0.5 text-xs text-slate-light">This will appear on your profile for customers to see.</p>
                        </div>
                    )}

                    {/* Preview */}
                    {effectiveTrade && (
                        <div className="flex items-center gap-2 text-sm text-primary-700 bg-white rounded-lg px-3 py-2 border border-primary-100">
                            <span>🛠️</span>
                            <span>Your service: <strong>{effectiveTrade}</strong></span>
                        </div>
                    )}
                </div>
            )}

            <Input
                {...register('referralCode')}
                type="text"
                label="Referral Code (Optional)"
                placeholder="Enter referral code if you have one"
                error={errors.referralCode?.message}
                disabled={isLoading}
            />

            <div className="border-t border-line pt-4">
                <p className="text-xs text-slate mb-2">Address (optional — helps match you with local artisans)</p>
                <AddressSearch
                    id="register-address"
                    label="Your Address"
                    value={addressData?.address ?? ''}
                    onChange={setAddressData}
                    placeholder="Search for your address..."
                    disabled={isLoading}
                />
                {addressData && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate">
                        <span className="bg-[#F8FAFC] rounded px-2 py-1">State: {addressData.state}</span>
                        {addressData.lga && (
                            <span className="bg-[#F8FAFC] rounded px-2 py-1">LGA: {addressData.lga}</span>
                        )}
                    </div>
                )}
            </div>

            <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
            >
                Create Account
            </Button>
        </form>
    );
};

export default RegisterForm;
