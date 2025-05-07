import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export default function Rating({
  value,
  max = 5,
  size = 'md',
  readOnly = true,
  onChange,
  className,
}: RatingProps) {
  const stars = [];
  const starSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  const starSize = starSizes[size];
  
  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index + 1);
    }
  };

  for (let i = 0; i < max; i++) {
    if (i < Math.floor(value)) {
      // Full star
      stars.push(
        <Star
          key={i}
          className={cn(
            starSize,
            "fill-yellow-400 text-yellow-400",
            !readOnly && "cursor-pointer"
          )}
          onClick={() => handleClick(i)}
        />
      );
    } else if (i === Math.floor(value) && value % 1 >= 0.5) {
      // Half star
      stars.push(
        <div key={i} className="relative">
          <Star
            className={cn(
              starSize,
              "text-muted-foreground/30",
              !readOnly && "cursor-pointer"
            )}
          />
          <StarHalf
            className={cn(
              starSize,
              "absolute top-0 left-0 fill-yellow-400 text-yellow-400",
              !readOnly && "cursor-pointer"
            )}
            onClick={() => handleClick(i)}
          />
        </div>
      );
    } else {
      // Empty star
      stars.push(
        <Star
          key={i}
          className={cn(
            starSize,
            "text-muted-foreground/30",
            !readOnly && "cursor-pointer"
          )}
          onClick={() => handleClick(i)}
        />
      );
    }
  }

  return (
    <div className={cn("flex items-center", className)}>
      {stars}
    </div>
  );
}