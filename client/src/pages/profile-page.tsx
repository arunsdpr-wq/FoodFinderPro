import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Review } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayRating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/ui/ReviewForm";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Fetch user reviews
  const { 
    data: reviews, 
    isLoading, 
    error 
  } = useQuery<Review[]>({ 
    queryKey: ['/api/my-reviews'],
    queryFn: async () => {
      const response = await fetch('/api/my-reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !!user // Only fetch if user is logged in
  });

  // Handle review deletion
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await apiRequest("DELETE", `/api/reviews/${reviewId}`);
      
      // Invalidate queries to refresh the data
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

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown date";
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-8">My Profile</h1>
        <Tabs defaultValue="reviews">
          <TabsList>
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="w-full">
                  <CardHeader>
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
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-8">My Profile</h1>
        <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
          Error loading your profile data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>
      
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>View and update your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <p className="font-medium">Username</p>
                  <p className="text-gray-600">{user?.username}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">{user?.email || "No email added"}</p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">{user?.phoneNumber || "No phone number added"}</p>
                </div>
                <div>
                  <p className="font-medium">Full Name</p>
                  <p className="text-gray-600">{user?.fullName || "No name added"}</p>
                </div>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">{user?.address || "No address added"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Edit Profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">My Reviews</h2>
          
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="w-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{review.title}</CardTitle>
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
                    </div>
                    <DisplayRating value={review.rating} />
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <CardDescription>
                      Posted on {formatDate(review.createdAt)}
                      {review.updatedAt && review.updatedAt !== review.createdAt && 
                        ` (Edited on ${formatDate(review.updatedAt)})`}
                    </CardDescription>
                    <CardDescription>
                      Restaurant: {review.restaurantId}
                    </CardDescription>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 border rounded-lg">
              <p>You haven't written any reviews yet.</p>
              <p className="text-sm mt-2">Visit a restaurant page to share your experience!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="orders" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Order History</h2>
          <div className="text-center py-12 text-gray-500 border rounded-lg">
            <p>Your order history will be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {editingReview && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Your Review</DialogTitle>
            </DialogHeader>
            <ReviewForm
              restaurantValue={editingReview.restaurantId.toString()}
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
    </div>
  );
}