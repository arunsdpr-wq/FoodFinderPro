import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import { DisplayRating } from "@/components/ui/Rating";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/ui/ReviewForm";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewListProps {
  restaurantValue: string;
  limit?: number;
}

export function ReviewList({ restaurantValue, limit }: ReviewListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingReview, setEditingReview] = React.useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Fetch reviews for the restaurant
  const { 
    data: reviews, 
    isLoading, 
    error 
  } = useQuery<Review[]>({ 
    queryKey: ['/api/restaurants', restaurantValue, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${restaurantValue}/reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    }
  });

  // Handle review deletion
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await apiRequest("DELETE", `/api/reviews/${reviewId}`);
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants', restaurantValue, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants', restaurantValue, 'rating'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-reviews'] });
      
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the review. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle opening the edit dialog
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
        Error loading reviews. Please try again later.
      </div>
    );
  }

  // Filter and limit reviews if necessary
  const displayedReviews = limit ? reviews?.slice(0, limit) : reviews;

  // No reviews state
  if (!displayedReviews || displayedReviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet for this restaurant.</p>
        <p className="text-sm mt-2">Be the first to share your experience!</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown date";
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <>
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <Card key={review.id} className="w-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg">{review.title}</CardTitle>
                {user && user.id === review.userId && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditReview(review)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
              <DisplayRating value={review.rating} />
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{review.comment}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <CardDescription>
                Posted on {formatDate(review.createdAt)}
                {review.updatedAt && review.updatedAt !== review.createdAt && 
                  ` (Edited on ${formatDate(review.updatedAt)})`}
              </CardDescription>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {editingReview && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Your Review</DialogTitle>
            </DialogHeader>
            <ReviewForm
              restaurantValue={restaurantValue}
              isEditing={true}
              reviewId={editingReview.id}
              defaultValues={{
                title: editingReview.title || "",
                rating: editingReview.rating,
                comment: editingReview.comment || ""
              }}
              onSuccess={() => setDialogOpen(false)}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}