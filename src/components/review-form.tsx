'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { addReview } from '@/lib/data'; // Import the updated data submission function
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NewReviewData } from '@/lib/types'; // Import the type for new review data

const reviewFormSchema = z.object({
  // Allow empty string or a string with at least 2 chars, max 50
  studentName: z.string().max(50, { message: 'Name cannot exceed 50 characters.'})
               .optional() // Make it optional
               .refine(val => !val || val.length >= 2, { // Refine: if not empty, must be >= 2 chars
                   message: 'Name must be at least 2 characters if provided.',
               }),
  rating: z.coerce.number().min(1, { message: 'Please select a rating.' }).max(5),
  comment: z.string().min(10, {
    message: 'Review must be at least 10 characters.',
  }).max(1000, { message: 'Review cannot exceed 1000 characters.'}),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  professorId: string;
  onReviewSubmit?: () => void; // Optional callback after successful submission
}

export function ReviewForm({ professorId, onReviewSubmit }: ReviewFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // Store rating for visual feedback, separate from form state initially
  const [visualRating, setVisualRating] = React.useState<number | undefined>(undefined);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      studentName: '',
      rating: undefined,
      comment: '',
    },
    mode: 'onChange', // Validate on change for better UX
  });

   const currentRating = form.watch('rating'); // Watch the rating field for dynamic updates

   // Sync visual rating when form rating changes (e.g., on reset)
   React.useEffect(() => {
        setVisualRating(currentRating);
   }, [currentRating]);


  async function onSubmit(data: ReviewFormValues) {
    // Ensure rating is set, although zod validation should catch this
     if (!data.rating) {
        form.setError("rating", { type: "manual", message: "Please select a star rating." });
        return;
     }

    setIsSubmitting(true);
    try {
      // Prepare payload conforming to NewReviewData type
      const reviewPayload: NewReviewData = {
        studentName: data.studentName?.trim() || 'Anonymous', // Default to Anonymous if empty or just whitespace
        rating: data.rating,
        comment: data.comment,
        // Sentiment is calculated in addReview now
      };

      // Call the Firestore-backed addReview function
      await addReview(professorId, reviewPayload);

      toast({
        title: "Review Submitted!",
        description: "Thank you for sharing your feedback.",
        variant: 'default', // Explicitly use default (can be success-like)
      });
      form.reset(); // Reset form fields
      setVisualRating(undefined); // Reset visual star display

      // Refresh data on the page to show the new review and updated average rating
      // Note: router.refresh() re-fetches data for the current route (Server Component)
      router.refresh();

      // Optional: Call external callback if provided
      if (onReviewSubmit) {
         onReviewSubmit();
      }

    } catch (error) {
      console.error("Failed to submit review:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Could not submit your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-4 md:p-6 border rounded-lg shadow-sm bg-card">
         <h3 className="text-lg font-semibold border-b pb-2">Write Your Review</h3>
        <FormField
          control={form.control}
          name="studentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Leave blank for Anonymous" {...field} />
              </FormControl>
              <FormDescription className="text-xs">
                Optional. Your review will be anonymous if left blank.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Overall Rating <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                {/* Interactive Star Rating Input */}
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button" // Prevent form submission on click
                      onClick={() => {
                        field.onChange(star); // Update form state
                        setVisualRating(star); // Update visual state immediately
                      }}
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-0.5" // Added focus style
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                       <Star
                         className={cn(
                           'h-7 w-7 cursor-pointer transition-colors duration-150 ease-in-out',
                           (visualRating ?? 0) >= star // Use visualRating for immediate feedback
                             ? 'text-accent fill-accent' // Use accent color (green)
                             : 'text-muted-foreground/50 hover:text-muted-foreground'
                         )}
                       />
                    </button>
                  ))}
                </div>
              </FormControl>
               <FormDescription className="text-xs">Select your rating (1-5 stars).</FormDescription>
              <FormMessage /> {/* Shows validation error */}
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share details about your experience. Was the professor engaging? Were expectations clear? Was grading fair?"
                  className="resize-y min-h-[120px]"
                  {...field}
                />
              </FormControl>
               <FormDescription className="text-xs">
                Min 10 characters. Be honest and constructive.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </form>
       {/* Toaster component needs to be included in the main layout (layout.tsx) */}
    </Form>
  );
}
