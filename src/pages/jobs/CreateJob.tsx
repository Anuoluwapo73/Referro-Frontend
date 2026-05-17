import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { jobApi } from '../../api/job.api';
import { getInitials } from '../../utils/formatting';
import Button from '../../components/common/Button';
import { TRADES } from '../../utils/constants';

interface HireState {
  artisanId?: string;
  artisanName?: string;
  artisanPhoto?: string;
  trade?: string;
}

const hireSchema = z.object({
  description: z.string().min(5, 'Please describe the job (at least 5 characters)'),
  budget: z.string().optional().refine(
    (v) => !v || (!isNaN(Number(v)) && Number(v) > 0),
    { message: 'Enter a valid amount' }
  ),
  scheduledDate: z.string().optional(),
});

const generalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  trade: z.string().min(1, 'Please select a service type'),
  description: z.string().optional(),
  budget: z.string().optional().refine(
    (v) => !v || (!isNaN(Number(v)) && Number(v) > 0),
    { message: 'Enter a valid amount' }
  ),
  address: z.string().optional(),
  scheduledDate: z.string().optional(),
});

type HireFormValues = z.infer<typeof hireSchema>;
type GeneralFormValues = z.infer<typeof generalSchema>;

const inputClass = (error?: string) =>
  `w-full px-4 py-3 border-[1.5px] rounded-[10px] text-base text-ink focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 min-h-[44px] transition-colors ${
    error ? 'border-red-400' : 'border-line'
  }`;

const labelClass = 'block text-sm font-medium text-ink mb-1';

export default function CreateJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  // Silently capture customer's location for nearby matching
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => { /* non-fatal — job posts without coords still work */ }
    );
  }, []);

  const hireState = (location.state ?? {}) as HireState;
  const { artisanId, artisanName, artisanPhoto, trade } = hireState;
  const isHiringSpecific = !!artisanId && !!artisanName;

  const hireForm = useForm<HireFormValues>({ resolver: zodResolver(hireSchema) });
  const generalForm = useForm<GeneralFormValues>({ resolver: zodResolver(generalSchema), mode: 'onBlur' });

  const handleHireSubmit = async (data: HireFormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        title: trade ? `${trade} job` : data.description.slice(0, 60),
        description: data.description,
        trade: trade || 'General',
        budget: data.budget ? Number(data.budget) : undefined,
        scheduledDate: data.scheduledDate || undefined,
        artisanId,
        ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
      };
      const response = await jobApi.createJob(payload) as any;
      const job = response?.job ?? response?.data ?? response;
      toast.success(`Request sent to ${artisanName}!`);
      navigate(`/jobs/${job.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneralSubmit = async (data: GeneralFormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        title: data.title,
        description: data.description || undefined,
        trade: data.trade,
        budget: data.budget ? Number(data.budget) : undefined,
        scheduledDate: data.scheduledDate || undefined,
        ...(data.address && { location: { address: data.address } }),
        ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
      };
      const response = await jobApi.createJob(payload) as any;
      const job = response?.job ?? response?.data ?? response;
      toast.success('Job posted successfully!');
      navigate(`/jobs/${job.id}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to post job');
    } finally {
      setIsLoading(false);
    }
  };

  const initials = artisanName ? getInitials(artisanName) : '';

  // ── Hire specific artisan ─────────────────────────────────────────────────
  if (isHiringSpecific) {
    const { register, handleSubmit, formState: { errors } } = hireForm;
    return (
      <div className="max-w-lg mx-auto py-6 px-4 sm:px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate hover:text-ink mb-5 transition-colors">
          ← Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-50 flex items-center justify-center text-primary-600 font-bold flex-shrink-0 border border-primary-100">
            {artisanPhoto
              ? <img src={artisanPhoto} alt={artisanName} className="w-full h-full object-cover" />
              : initials}
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-ink">Book {artisanName?.split(' ')[0]}</h1>
            {trade && <p className="text-sm text-primary-600 font-medium">{trade}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit(handleHireSubmit)} className="bg-white rounded-xl border border-line shadow-sm p-5 space-y-4">
          <div>
            <label className={labelClass}>
              What exactly do you need done? <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder={`Describe the ${trade?.toLowerCase() ?? 'work'} you need — be as specific as possible so ${artisanName?.split(' ')[0]} knows exactly what to expect.`}
              className={`${inputClass(errors.description?.message)} resize-none`}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Your Budget (₦) <span className="text-slate font-normal text-xs">— optional</span>
            </label>
            <input {...register('budget')} type="number" min="0" placeholder="e.g. 15000" className={inputClass(errors.budget?.message)} />
            {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget.message}</p>}
          </div>

          <div>
            <label className={labelClass}>
              When do you need it done? <span className="text-slate font-normal text-xs">— optional</span>
            </label>
            <input {...register('scheduledDate')} type="date" className={inputClass()} />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={isLoading} disabled={isLoading}>Send Request</Button>
          </div>
        </form>
      </div>
    );
  }

  // ── General job post ──────────────────────────────────────────────────────
  const { register, handleSubmit, formState: { errors } } = generalForm;
  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate hover:text-ink mb-5 transition-colors">
        ← Back
      </button>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-ink">Post a Job</h1>
        <p className="text-slate mt-1 text-sm">Describe what you need and we'll match you with the right artisan.</p>
      </div>

      <form onSubmit={handleSubmit(handleGeneralSubmit)} noValidate className="bg-white rounded-xl border border-line shadow-sm p-5 sm:p-6 space-y-5">

        {/* Title */}
        <div>
          <label className={labelClass}>Job Title <span className="text-red-500">*</span></label>
          <input {...register('title')} type="text" placeholder="e.g. Fix leaking kitchen pipe" className={inputClass(errors.title?.message)} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        {/* Service type */}
        <div>
          <label className={labelClass}>Service Type <span className="text-red-500">*</span></label>
          <select {...register('trade')} className={inputClass(errors.trade?.message)}>
            <option value="">Select the type of service...</option>
            {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.trade && <p className="mt-1 text-xs text-red-600">{errors.trade.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>
            Description <span className="text-slate font-normal text-xs">— optional</span>
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Describe the work needed in detail..."
            className={`${inputClass(errors.description?.message)} resize-none`}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        {/* Budget + Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Budget (₦) <span className="text-slate font-normal text-xs">— optional</span>
            </label>
            <input {...register('budget')} type="number" min="0" placeholder="e.g. 5000" className={inputClass(errors.budget?.message)} />
            {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget.message}</p>}
          </div>
          <div>
            <label className={labelClass}>
              Scheduled Date <span className="text-slate font-normal text-xs">— optional</span>
            </label>
            <input {...register('scheduledDate')} type="date" className={inputClass()} />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>
            Location / Address <span className="text-slate font-normal text-xs">— optional</span>
          </label>
          <input {...register('address')} type="text" placeholder="e.g. 12 Adeola Odeku Street, Victoria Island, Lagos" className={inputClass()} />
          <p className="mt-1 text-xs text-slate">Where should the artisan come to?</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-line">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading} className="w-full sm:flex-1">
            Post Job
          </Button>
        </div>
      </form>
    </div>
  );
}
