import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DisplayRating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/ui/ReviewForm";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewSummaryProps {
  restaurantValue: string;
  reviewsCount?: number;
}

export function ReviewSummary({ restaurantValue, reviewsCount = 0 }: ReviewSummaryProps) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Fetch the average rating
  const { 
    data: ratingData, 
    isLoading: isRatingLoading 
  } = useQuery<{ rating: number }>({ 
    queryKey: ['/api/restaurants', restaurantValue, 'rating'],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantValue}/rating`);
      if (!response.ok) {
        throw new Error('Failed to fetch rating');
      }
      return response.json();
    }
  });

  const averageRating = ratingData?.rating || 0;

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Customer Reviews</h3>
        
        <div className="flex items-center space-x-2">
          {isRatingLoading ? (
            <Skeleton className="h-5 w-28" />
          ) : (
            <>
              <DisplayRating value={averageRating} showValue size="md" />
              <span className="text-sm text-gray-500">
                ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
              </span>
            </>
          )}
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            disabled={!user}
            title={!user ? "Please log in to write a review" : undefined}
          >
            Write a Review
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Experience</DialogTitle>
          </DialogHeader>
          <ReviewForm 
            restaurantValue={restaurantValue} 
            onSuccess={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}