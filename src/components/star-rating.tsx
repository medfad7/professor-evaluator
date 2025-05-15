'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  totalStars?: number;
  size?: number;
  fillColor?: string; // Tailwind class, e.g., 'text-yellow-400' -> maps to accent
  emptyColor?: string; // Tailwind class, e.g., 'text-gray-300' -> maps to muted-foreground
}

export function StarRating({
  rating,
  totalStars = 5,
  size = 20,
  fillColor = 'text-accent', // Use accent (green) color by default for filled stars
  emptyColor = 'text-muted-foreground/50', // Slightly muted for empty stars
  className,
  ...props
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  // Basic half-star logic could be added here if needed, using masking or different icons.
  // For simplicity, we'll just use full stars.
  const emptyStars = totalStars - fullStars;

  return (
    <div className={cn('flex items-center gap-0.5', className)} {...props}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} size={size} className={cn('fill-current', fillColor)} />
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} className={cn(emptyColor)} />
      ))}
    </div>
  );
}
