import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../common/Button';
import FormField from '../forms/FormField';
import AddressInput, { AddressValue } from '../forms/AddressInput';
import { TRADES } from '../../utils/constants';

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  trade: z.string().min(1, 'Please select a trade'),
  budget: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: 'Budget must be a positive number',
    }),
  address: z.string().min(3, 'Address is required').max(200, 'Address too long'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  placeId: z.string().optional(),
  scheduledDate: z.string().optional(),
});

export type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  initialData?: Partial<JobFormValues>;
  onSubmit: (data: JobFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  /** When true, hides the trade dropdown (already known from artisan profile) */
  hideTrade?: boolean;
  /** The artisan's trade — shown as a read-only label when hideTrade is true */
  artisanTrade?: string;
}

const JobForm: React.FC<JobFormProps> = ({ initialData, onSubmit, onCancel, isLoading = false, submitLabel, hideTrade = false, artisanTrade }) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const handleAddressChange = (value: AddressValue) => {
    setValue('address', value.address, { shouldValidate: true });
    setValue('city', value.city, { shouldValidate: true });
    setValue('state', value.state, { shouldValidate: true });
    setValue('latitude', value.latitude, { shouldValidate: true });
    setValue('longitude', value.longitude, { shouldValidate: true });
    setValue('placeId', value.placeId, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField
        label="Job Title"
        placeholder="e.g. Fix leaking kitchen pipe"
        error={errors.title?.message}
        registration={register('title')}
      />

      <div className="w-full">
        <label htmlFor="job-trade" className="block text-sm font-medium text-gray-700 mb-1">
          Trade / Service
        </label>
        {hideTrade && artisanTrade ? (
          // Read-only trade badge when hiring a specific artisan
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-lg">🛠️</span>
            <span className="text-gray-900 font-medium">{artisanTrade}</span>
            <input type="hidden" {...register('trade')} value={artisanTrade} />
          </div>
        ) : (
          <>
            <select
              id="job-trade"
              className={`block w-full rounded-lg border px-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[44px] ${
                errors.trade
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
              {...register('trade')}
            >
              <option value="">Select a trade</option>
              {TRADES.map((trade) => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
            {errors.trade && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.trade.message}</p>
            )}
          </>
        )}
      </div>

      <div className="w-full">
        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="job-description"
          rows={3}
          placeholder="Describe the work needed..."
          className={`block w-full rounded-lg border px-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-offset-1 resize-none ${
            errors.description
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <FormField
        label="Budget (₦)"
        type="number"
        placeholder="e.g. 5000"
        error={errors.budget?.message}
        registration={register('budget')}
        helperText="Optional — enter your estimated budget"
      />

      {/* Address with autocomplete and geocoding */}
      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <AddressInput
            id="job-address"
            label="Location"
            value={field.value || ''}
            onChange={handleAddressChange}
            error={errors.address?.message || errors.city?.message || errors.state?.message}
            placeholder="Start typing an address..."
          />
        )}
      />

      {/* Hidden fields for geocoded data — registered so RHF tracks them */}
      <input type="hidden" {...register('city')} />
      <input type="hidden" {...register('state')} />
      <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
      <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
      <input type="hidden" {...register('placeId')} />

      <FormField
        label="Scheduled Date"
        type="date"
        error={errors.scheduledDate?.message}
        registration={register('scheduledDate')}
        helperText="Optional — when do you need this done?"
      />

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} disabled={!isValid || isLoading} className="w-full sm:w-auto">
          {submitLabel ?? (initialData ? 'Update Job' : 'Post Job')}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default JobForm;
