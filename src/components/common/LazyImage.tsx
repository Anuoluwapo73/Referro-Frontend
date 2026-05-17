import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  placeholderClassName?: string;
}

/**
 * LazyImage — renders an <img> with native lazy loading (loading="lazy").
 * Shows a placeholder skeleton while the image is loading and a fallback on error.
 * Requirements: 23.2
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallback,
  placeholderClassName = '',
  className = '',
  ...rest
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <span className="relative inline-block">
      {/* Skeleton placeholder shown while loading */}
      {status === 'loading' && (
        <span
          className={`absolute inset-0 animate-pulse bg-gray-200 rounded ${placeholderClassName}`}
          aria-hidden="true"
        />
      )}

      {/* Error fallback */}
      {status === 'error' && (
        fallback ?? (
          <span
            className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded ${className}`}
            aria-label={alt}
          >
            {alt}
          </span>
        )
      )}

      {/* Actual image — hidden until loaded, uses native lazy loading */}
      {status !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`${className} ${status === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          {...rest}
        />
      )}
    </span>
  );
};

export default React.memo(LazyImage);
