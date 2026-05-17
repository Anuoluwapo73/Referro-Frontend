import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../common/Button';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  onSubmit: (data: ReviewFormValues) => Promise<void>;
  isLoading?: boolean;
}

// ── Interactive Star Rating ──────────────────────────────────────────────────
const StarInput: React.FC<{
  value: number;
  onChange: (rating: number) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            <svg
              className={`w-8 h-8 transition-colors ${
                star <= (hovered || value)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// ── Review Form ──────────────────────────────────────────────────────────────
const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
    mode: 'onChange',
  });

  const rating = watch('rating');

  const handleRatingChange = (value: number) => {
    setValue('rating', value, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Star rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <StarInput
          value={rating}
          onChange={handleRatingChange}
          error={errors.rating?.message}
        />
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Comment <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="review-comment"
          rows={4}
          placeholder="Share your experience with this artisan..."
          className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
            errors.comment ? 'border-red-400' : 'border-gray-300'
          }`}
          aria-describedby={errors.comment ? 'comment-error' : undefined}
          {...register('comment')}
        />
        {errors.comment && (
          <p id="comment-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.comment.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={!isValid || isLoading}
        className="w-full"
      >
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;
