import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { User } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { type Review } from '@shared/schema';
import ReviewList from '@/components/ui/ReviewList';

export default function ProfilePage() {
  const { user } = useAuth();
  const [reviewsUpdated, setReviewsUpdated] = useState(false);

  const { data: reviews, isLoading: isLoadingReviews, refetch: refetchReviews } = useQuery<Review[]>({
    queryKey: ['/api/my-reviews'],
    enabled: !!user,
  });

  const handleReviewDeleted = () => {
    refetchReviews();
    setReviewsUpdated(true);
  };

  const handleReviewUpdated = () => {
    refetchReviews();
    setReviewsUpdated(true);
  };

  useEffect(() => {
    if (reviewsUpdated) {
      const timer = setTimeout(() => {
        setReviewsUpdated(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [reviewsUpdated]);

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="account">Account Details</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{user.fullName || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">{user.phoneNumber || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
                <CardDescription>Your default delivery information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{user.address || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Account Status</p>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${user.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <p className="text-sm text-muted-foreground">
                      {user.isVerified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>My Reviews</CardTitle>
              <CardDescription>Reviews you've left for restaurants</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReviews ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {reviewsUpdated && (
                    <div className="mb-4 p-2 bg-green-50 text-green-800 rounded-md text-sm">
                      Your reviews have been updated successfully!
                    </div>
                  )}
                  <ReviewList 
                    reviews={reviews || []} 
                    onReviewDeleted={handleReviewDeleted}
                    onReviewUpdated={handleReviewUpdated}
                    isProfile={true}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}