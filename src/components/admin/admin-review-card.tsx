// src/components/admin/admin-review-card.tsx (or wherever it's located)

'use client';

import * as React from 'react';
import type { Review } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/star-rating';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// Import Admin SDK Timestamp type if needed for casting, or handle as string
// Assuming createdAt is now coming as string from data fetching functions
// import type { Timestamp } from 'firebase-admin/firestore'; // Likely not needed here if converted before
import { Button, buttonVariants } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteReviewAction } from '@/actions/admin-actions'; // Import action
// Import useAuth to get the current user
import { useAuth } from '@/context/auth-context'; // Adjust path if needed

interface AdminReviewCardProps {
    review: Omit<Review, 'createdAt'> & { createdAt: string }; // Expect createdAt as string now
    professorId: string; // Needed for the delete action
    onDeleted?: () => void; // Optional callback after deletion
}

const getInitials = (name: string) => {
    if (!name || name.toLowerCase() === 'anonymous') return 'A';
    const names = name.trim().split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    // Optionally add second initial if name exists
    // if (names.length > 1 && names[1]) {
    //     initials += names[1].substring(0, 1).toUpperCase();
    // }
    return initials;
};

export function AdminReviewCard({ review, professorId, onDeleted }: AdminReviewCardProps) {
    const { toast } = useToast(); // Hook called at top level - Correct
    const [isDeleting, setIsDeleting] = React.useState(false);
    // --- Get user from context at the top level ---
    const { user: currentUser } = useAuth();

    // Parse the ISO string back into a Date object for formatting
    // Handle potential parsing errors
    let createdAtDate: Date;
    try {
        createdAtDate = new Date(review.createdAt);
        if (isNaN(createdAtDate.getTime())) { // Check if parsing failed
             throw new Error("Invalid date string");
        }
    } catch (e) {
        console.error("Error parsing review createdAt date:", review.createdAt, e);
        createdAtDate = new Date(); // Fallback to current date
    }

    const displayName = review.studentName || "Anonymous";

    const handleDelete = async () => {
        // --- Check if user is logged in ---
        if (!currentUser) {
            toast({ title: "Error", description: "You must be logged in to delete.", variant: "destructive" });
            return; // Exit if not logged in
        }
        // ---------------------------------

        // Optional: Add confirmation dialog (already handled by AlertDialog)

        setIsDeleting(true);
        try {
            console.log(`Attempting to delete review ${review.id} for professor ${professorId}`);
            // --- Get the ID Token ---
            const idToken = await currentUser.getIdToken(); // Get token before calling action
            console.log("Got ID token for deleteReviewAction.");

            // --- Call action WITH professorId, reviewId, and idToken ---
            const result = await deleteReviewAction(professorId, review.id, idToken);
            // -----------------------------------------------------------

            if (result.success) {
                toast({
                    title: "Review Deleted",
                    description: `The review by ${displayName} has been removed.`,
                });
                 if (onDeleted) onDeleted(); // Trigger callback if provided
                // Revalidation should happen via the server action
            } else {
                throw new Error(result.error || 'Failed to delete review.');
            }
        } catch (error) {
            console.error("Failed to delete review:", error);
            toast({
                title: "Deletion Failed",
                description: error instanceof Error ? error.message : "Could not delete review.",
                variant: "destructive",
            });
        } finally {
            // Ensure loading state stops regardless of success/failure
            setIsDeleting(false);
        }
    };

     // Determine if delete button should be enabled (must be logged in)
     // Add check for admin claim if needed: const isAdmin = currentUser?.customClaims?.admin === true;
     const canDelete = !!currentUser; // Basic check for logged in

    return (
        <Card className="border border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-2 gap-3">
                 {/* ... Header Content (Avatar, Name, Date, Rating) ... */}
                 <div className="flex items-center gap-3 flex-grow min-w-0">
                    <Avatar className="h-8 w-8 text-xs flex-shrink-0">
                       <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                          {getInitials(displayName)}
                       </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow min-w-0">
                       <CardTitle className="text-base font-medium truncate" title={displayName}>{displayName}</CardTitle>
                       <div className="text-xs text-muted-foreground pt-0.5">
                          <time dateTime={createdAtDate.toISOString()} title={format(createdAtDate, 'PPP p')}>
                             {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                          </time>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                    <StarRating rating={review.rating} size={16} />
                 </div>
            </CardHeader>
            <CardContent className="pt-1 pb-4 px-5">
                {/* ... Card Content (Review Comment) ... */}
                 <CardDescription className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                   {review.comment}
                 </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-end p-3 border-t bg-muted/30">
                 {/* Delete Button with Confirmation */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        {/* Disable trigger if user cannot delete or already deleting */}
                        <Button variant="destructive" size="sm" disabled={!canDelete || isDeleting}>
                            {isDeleting ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-1.5 h-4 w-4" />
                            )}
                            Delete Review
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            {/* ... Dialog Title / Description ... */}
                             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                             <AlertDialogDescription>
                               This action cannot be undone. This will permanently delete the review by{' '}
                               <span className="font-semibold">{displayName}</span>.
                             </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete} // Calls updated handleDelete
                                disabled={isDeleting}
                                className={buttonVariants({ variant: "destructive" })}
                            >
                                {isDeleting ? (
                                     <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                                     </>
                                ) : (
                                    'Delete Review'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}