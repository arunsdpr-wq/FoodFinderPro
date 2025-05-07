import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import Rating from '@/components/ui/Rating';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import ReviewForm from '@/components/ui/ReviewForm';

interface ReviewSummaryProps {
  restaurantId: number;
  averageRating: number;
  totalReviews: number;
  onReviewAdded?: () => void;
}

export default function ReviewSummary({ 
  restaurantId, 
  averageRating, 
  totalReviews,
  onReviewAdded,
}: ReviewSummaryProps) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleReviewSuccess = () => {
    setDialogOpen(false);
    if (onReviewAdded) {
      onReviewAdded();
    }
  };
  
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-4 bg-muted/30 rounded-lg">
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-2xl font-bold">{formatRating(averageRating)}</span>
        <Rating value={averageRating} readOnly size="md" />
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
      </p>
      
      {user ? (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => setDialogOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Write a Review
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">Sign in to leave a review</p>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <ReviewForm 
            restaurantId={restaurantId} 
            onSuccess={handleReviewSuccess} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}