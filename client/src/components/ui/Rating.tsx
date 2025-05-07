import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  className?: string;
}

export function Rating({
  value,
  onChange,
  size = "md",
  readOnly = false,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  
  // Determine the size of stars based on the size prop
  const starSizeClass = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  // Generate an array of 5 stars
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  
  // Calculate the effective rating to display
  const effectiveRating = hoverValue !== null ? hoverValue : value;
  
  return (
    <div 
      className={cn(
        "flex space-x-1", 
        readOnly ? "pointer-events-none" : "cursor-pointer",
        className
      )}
    >
      {stars.map((star) => {
        // Determine if the star should be filled, half-filled, or empty
        const isFilled = star <= effectiveRating;
        const isHalfFilled = !isFilled && star - 0.5 <= effectiveRating;
        
        return (
          <span
            key={star}
            className={cn(
              "transition-colors",
              isFilled ? "text-yellow-400" : "text-gray-300",
              !readOnly && "hover:text-yellow-400"
            )}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(star);
              }
            }}
            onMouseEnter={() => {
              if (!readOnly) {
                setHoverValue(star);
              }
            }}
            onMouseLeave={() => {
              if (!readOnly) {
                setHoverValue(null);
              }
            }}
          >
            {isHalfFilled ? (
              <StarHalf className={starSizeClass[size]} fill="currentColor" />
            ) : (
              <Star
                className={starSizeClass[size]}
                fill={isFilled ? "currentColor" : "none"}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

interface DisplayRatingProps {
  value: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DisplayRating({
  value,
  showValue = false,
  size = "md",
  className,
}: DisplayRatingProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Rating value={value} size={size} readOnly />
      {showValue && (
        <span className="ml-2 text-gray-700 font-medium">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}