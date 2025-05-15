// src/components/admin/professor-admin-card.tsx

'use client';

import * as React from 'react';
import type { Professor } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, MapPin, MessageSquare, Trash2, Edit, Loader2 } from 'lucide-react';
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
import { deleteProfessorAction } from '@/actions/admin-actions'; // Import server action
import { buttonVariants } from '../ui/button';
// Import useAuth to get the current user
import { useAuth } from '@/context/auth-context'; // Adjust path if needed

interface ProfessorAdminCardProps {
    professor: Professor;
}

export function ProfessorAdminCard({ professor }: ProfessorAdminCardProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = React.useState(false);
    // Get user from context at the top level
    const { user: currentUser } = useAuth();
    const avgRating = professor.averageRating;

    const handleDelete = async () => {
        // --- Check if user is logged in ---
        if (!currentUser) {
            toast({ title: "Error", description: "You must be logged in to delete.", variant: "destructive" });
            return; // Exit if not logged in
        }
        // ---------------------------------

        setIsDeleting(true);
        try {
            console.log(`Attempting to delete professor ${professor.id}`);
            // --- Get the ID Token ---
            const idToken = await currentUser.getIdToken();
            console.log("Got ID token for deleteProfessorAction.");

            // --- Call action WITH professorId and idToken ---
            const result = await deleteProfessorAction(professor.id, idToken);
            // ----------------------------------------------

            if (result.success) {
                toast({
                    title: "Professor Deleted",
                    description: `${professor.name} and their reviews have been removed.`,
                });
                // Revalidation should kick in from the server action
            } else {
                throw new Error(result.error || 'Failed to delete professor.');
            }
        } catch (error) {
            console.error("Failed to delete professor:", error);
            toast({
                title: "Deletion Failed",
                description: error instanceof Error ? error.message : "Could not delete professor.",
                variant: "destructive",
            });
            // Ensure loading state stops on error
             setIsDeleting(false);
        }
        // Don't set isDeleting false on success, let revalidation handle UI update
    };

    // Determine if delete button should be enabled (must be logged in)
    const canDelete = !!currentUser;

    return (
        <Card className="flex flex-col h-full border border-border/60 shadow-sm">
            <CardHeader className="pb-3">
                {/* ... Card Title / Description ... */}
                 <CardTitle className="text-lg font-semibold">{professor.name}</CardTitle>
                 <CardDescription className="flex items-center gap-1.5 text-sm pt-1 text-muted-foreground">
                     <GraduationCap className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{professor.department}</span>
                 </CardDescription>
                 <CardDescription className="flex items-center gap-1.5 text-sm pt-1 text-muted-foreground">
                     <MapPin className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{professor.courseCode}</span>
                 </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pt-0 pb-3">
                 {/* ... Card Content (Review Count / Avg Rating) ... */}
                 <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                   <MessageSquare className="h-4 w-4 flex-shrink-0" />
                   <span>{professor.reviewCount ?? 0} Review{professor.reviewCount !== 1 ? 's' : ''}</span>
                   {avgRating !== undefined && avgRating !== null && (
                     <span> | Avg Rating: {avgRating.toFixed(1)}</span>
                   )}
                 </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-3 border-t bg-muted/30">
                 {/* ... Manage Reviews Button ... */}
                 <Button asChild variant="outline" size="sm">
                   <Link href={`/admin/professors/${professor.id}/reviews`}>
                     <Edit className="mr-1.5 h-4 w-4" /> Manage Reviews
                   </Link>
                 </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        {/* Disable trigger if user cannot delete or already deleting */}
                        <Button variant="destructive" size="sm" disabled={!canDelete || isDeleting}>
                            {isDeleting ? (
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="mr-1.5 h-4 w-4" />
                            )}
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                             {/* ... Dialog Title / Description ... */}
                             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                             <AlertDialogDescription>
                               This action cannot be undone. This will permanently delete Professor{' '}
                               <span className="font-semibold">{professor.name}</span> and all associated reviews.
                             </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete} // This calls the updated handleDelete
                                disabled={isDeleting}
                                className={buttonVariants({ variant: "destructive" })}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                                    </>
                                ) : (
                                    'Delete Professor'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}