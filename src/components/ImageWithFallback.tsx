import React, { useState } from 'react';
import { Coffee } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  objectFit?: 'cover' | 'contain';
  fallbackTitle?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  aspectRatioClass = 'aspect-[4/3]',
  objectFit = 'cover',
  fallbackTitle
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#F5ECD9] ${aspectRatioClass} ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#F5ECD9] via-[#FFF8EE] to-[#F5ECD9]" />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#FFF8EE] via-[#F5ECD9] to-[#E9DFCE] text-[#3B241A]">
          <div className="w-12 h-12 rounded-full bg-[#87986A]/20 flex items-center justify-center mb-2 text-[#3B241A]">
            <Coffee className="w-6 h-6 stroke-[1.5]" />
          </div>
          <span className="text-xs font-serif font-semibold tracking-wide text-[#3B241A]">
            {fallbackTitle || alt}
          </span>
          <span className="text-[11px] text-[#3B241A]/60 mt-0.5">
            Brew & Bloom Café
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-${objectFit} transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        />
      )}
    </div>
  );
};
