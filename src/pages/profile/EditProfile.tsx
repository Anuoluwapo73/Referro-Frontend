import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { userApi } from '../../api/user.api';
import { useAuthStore } from '../../store/authStore';
import { profileUpdateSchema } from '../../utils/validation';
import { User } from '../../types';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import AddressSearch, { AddressSearchValue } from '../../components/common/AddressSearch';

type ProfileFormData = z.infer<typeof profileUpdateSchema>;
type FormErrors = Partial<Record<keyof ProfileFormData, string>>;

function validate(data: ProfileFormData): FormErrors {
  const result = profileUpdateSchema.safeParse(data);
  if (result.success) return {};
  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ProfileFormData;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
}

const Field: React.FC<FieldProps> = ({ id, label, value, onChange, error, type = 'text', placeholder, required, readOnly }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-3 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] ${
        error ? 'border-red-400' : 'border-gray-300'
      } ${readOnly ? 'bg-gray-50 text-gray-500 cursor-default' : ''}`}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={!!error}
    />
    {error && (
      <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">{error}</p>
    )}
  </div>
);

export default function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const storeUser = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await userApi.getProfile() as any;
      return res?.user ?? res?.data ?? res;
    },
    initialData: storeUser ?? undefined,
  });

  const [form, setForm] = useState<ProfileFormData>({
    fullName: '', email: '', address: '', city: '', state: '',
    lga: '', latitude: undefined, longitude: undefined, placeId: '',
  });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setForm({
        fullName: user.fullName ?? '',
        email: user.email ?? '',
        address: user.address ?? '',
        city: user.city ?? '',
        state: user.state ?? '',
        lga: (user as any).lga ?? '',
        latitude: user.latitude,
        longitude: user.longitude,
        placeId: (user as any).placeId ?? '',
      });
    }
  }, [user]);

  /** Handle photo file selection — converts to base64 and saves */
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return; }
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const res = await userApi.updateProfile({ photoUrl: dataUrl }) as any;
        const updated: User = res?.user ?? res?.data ?? res;
        if (updated?.id) { setUser(updated); queryClient.setQueryData(['profile'], updated); }
        toast.success('Photo updated!');
      } catch { toast.error('Failed to upload photo'); }
      setUploadingPhoto(false);
    };
    reader.onerror = () => { toast.error('Failed to read file'); setUploadingPhoto(false); };
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: (data: any) => userApi.updateProfile(data),
    onSuccess: (res: any) => {
      const updated: User = res?.user ?? res?.data ?? res;
      if (updated?.id) {
        setUser(updated);
        queryClient.setQueryData(['profile'], updated);
      } else {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
      toast.success('Profile updated successfully');
      navigate('/profile');
    },
    onError: (err: any) => {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') setErrors(serverErrors);
      toast.error(err?.response?.data?.message ?? err?.message ?? 'Failed to update profile');
    },
  });

  const setField = (key: keyof ProfileFormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const handleAddressSelect = (value: AddressSearchValue) => {
    setForm((prev) => ({
      ...prev,
      address: value.address, city: value.city, state: value.state,
      lga: value.lga ?? '', latitude: value.latitude, longitude: value.longitude, placeId: value.placeId,
    }));
    setIsDirty(true);
    setErrors((prev) => { const next = { ...prev }; delete next.address; delete next.state; return next; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    const fullName = lastName && firstName ? `${lastName} ${firstName}` : form.fullName;
    const payload: any = Object.fromEntries(
      Object.entries({ ...form, fullName, firstName, lastName }).filter(([, v]) => v !== '' && v !== undefined && v !== null)
    );
    mutation.mutate(payload);
  };

  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  if (isLoading && !user) {
    return <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-600 transition-colors p-1" aria-label="Back to profile">
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Photo upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-700 text-2xl font-bold">{initials}</span>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {uploadingPhoto ? 'Uploading...' : user?.photoUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF · Max 2MB</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Field id="lastName" label="Surname" value={lastName} onChange={(v) => { setLastName(v); setIsDirty(true); }} placeholder="Your family name" required />
              <p className="mt-0.5 text-xs text-gray-400">Your family / last name</p>
            </div>
            <div>
              <Field id="firstName" label="First Name" value={firstName} onChange={(v) => { setFirstName(v); setIsDirty(true); }} placeholder="Your given name" required />
              <p className="mt-0.5 text-xs text-gray-400">Your given / first name</p>
            </div>
          </div>
          <Field id="email" label="Email" type="email" value={form.email ?? ''} onChange={setField('email')} error={errors.email} placeholder="your@email.com" />
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Address</h2>
          <AddressSearch
            id="address-search"
            label="Search Address"
            value={form.address ?? ''}
            onChange={handleAddressSelect}
            error={errors.address}
            placeholder="Start typing your address..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="city" label="City" value={form.city ?? ''} onChange={setField('city')} error={errors.city} placeholder="Auto-filled from address" readOnly={!!form.placeId} />
            <Field id="state" label="State" value={form.state ?? ''} onChange={setField('state')} error={errors.state} placeholder="Auto-filled from address" readOnly={!!form.placeId} />
          </div>
          {form.lga && (
            <Field id="lga" label="LGA" value={form.lga} onChange={setField('lga')} placeholder="Local Government Area" readOnly={!!form.placeId} />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/profile')} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={mutation.isPending} disabled={mutation.isPending || !isDirty}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
