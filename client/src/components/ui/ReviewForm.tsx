import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rating } from "@/components/ui/Rating";
import { insertReviewSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Review schema with validation
const reviewSchema = insertReviewSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must not exceed 100 characters"),
  rating: z.number().min(1, "Please select a rating").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(500, "Comment must not exceed 500 characters"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  restaurantValue: string;
  onSuccess?: () => void;
  defaultValues?: Partial<ReviewFormData>;
  isEditing?: boolean;
  reviewId?: number;
}

export function ReviewForm({ 
  restaurantValue, 
  onSuccess, 
  defaultValues,
  isEditing = false,
  reviewId 
}: ReviewFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      rating: defaultValues?.rating || 0,
      comment: defaultValues?.comment || "",
      ...defaultValues
    }
  });
  
  // Set up the mutation for submitting the review
  const handleSubmit = async (data: ReviewFormData) => {
    try {
      if (isEditing && reviewId) {
        // Update existing review
        await apiRequest("PATCH", `/api/reviews/${reviewId}`, data);
        toast({
          title: "Review updated",
          description: "Your review has been updated successfully."
        });
      } else {
        // Create new review
        await apiRequest("POST", `/api/restaurants/${restaurantValue}/reviews`, data);
        toast({
          title: "Review submitted",
          description: "Your review has been submitted successfully."
        });
      }
      
      // Invalidate the reviews cache
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants', restaurantValue, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants', restaurantValue, 'rating'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-reviews'] });
      
      // Reset the form
      if (!isEditing) {
        form.reset();
      }
      
      // Call the onSuccess callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title for your review" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <Rating
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Select a rating from 1 to 5 stars
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share your experience with this restaurant" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {isEditing ? "Update Review" : "Submit Review"}
        </Button>
      </form>
    </Form>
  );
}