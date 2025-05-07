import React from 'react';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import Rating from '@/components/ui/Rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Review } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from '@/components/ui/ReviewForm';

interface ReviewListProps {
  reviews: Review[];
  onReviewDeleted?: () => void;
  onReviewUpdated?: () => void;
  isProfile?: boolean;
}

export default function ReviewList({ 
  reviews, 
  onReviewDeleted, 
  onReviewUpdated,
  isProfile = false,
}: ReviewListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingReview, setEditingReview] = React.useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  const handleDelete = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      
      toast({
        title: 'Review deleted',
        description: 'Your review has been successfully deleted',
      });
      
      if (onReviewDeleted) {
        onReviewDeleted();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };
  
  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setDialogOpen(true);
  };
  
  const handleEditSuccess = () => {
    setDialogOpen(false);
    setEditingReview(null);
    
    if (onReviewUpdated) {
      onReviewUpdated();
    }
  };
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isProfile ? "You haven't written any reviews yet." : "No reviews yet. Be the first to share your experience!"}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{review.title || 'Review'}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Rating value={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {review.createdAt && format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              
              {user && user.id === review.userId && (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(review)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit review</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete review</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
            {!review.isApproved && (
              <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded">
                Pending approval
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          {editingReview && (
            <ReviewForm
              restaurantId={editingReview.restaurantId}
              reviewId={editingReview.id}
              defaultValues={{
                rating: editingReview.rating,
                title: editingReview.title || '',
                comment: editingReview.comment || '',
              }}
              editMode={true}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}