import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Rating from '@/components/ui/Rating';
import { useToast } from '@/hooks/use-toast';

const reviewFormSchema = z.object({
  rating: z.number().min(1, { message: 'Please select a rating' }).max(5),
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100),
  comment: z.string().min(10, { message: 'Comment must be at least 10 characters' }).max(500),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  restaurantId: number;
  onSuccess?: () => void;
  defaultValues?: Partial<ReviewFormValues>;
  editMode?: boolean;
  reviewId?: number;
}

export default function ReviewForm({ 
  restaurantId, 
  onSuccess, 
  defaultValues = {
    rating: 5,
    title: '',
    comment: '',
  },
  editMode = false,
  reviewId,
}: ReviewFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setSubmitting(true);
    try {
      const url = editMode 
        ? `/api/reviews/${reviewId}` 
        : `/api/restaurants/${restaurantId}/reviews`;
      
      const method = editMode ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      toast({
        title: editMode ? 'Review updated' : 'Review submitted',
        description: editMode 
          ? 'Your review has been successfully updated' 
          : 'Thank you for your feedback!',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="py-2">
                  <Rating 
                    value={field.value || 0} 
                    readOnly={false} 
                    size="lg"
                    onChange={field.onChange} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Summarize your experience" />
              </FormControl>
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
                  {...field}
                  placeholder="Share your experience in detail" 
                  className="min-h-[120px] resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={submitting}
        >
          {submitting 
            ? editMode ? 'Updating...' : 'Submitting...' 
            : editMode ? 'Update Review' : 'Submit Review'
          }
        </Button>
      </form>
    </Form>
  );
}