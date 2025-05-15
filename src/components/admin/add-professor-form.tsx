// src/components/admin/add-professor-form.tsx

'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast'; // Import the hook
import { addProfessorAction } from '@/actions/admin-actions'; // Update path if needed
import { Loader2 } from 'lucide-react';
// Import useAuth to get the current user from your context
import { useAuth } from '@/context/auth-context'; // Assuming this is your auth context hook path

const courseCodeRegex = /^[A-Za-z]{3}\s\d{4}$/;
// Schema for validating professor details (keep as is)
const addProfessorFormSchema = z.object({
    name: z.string().min(2, {
        message: 'Professor name must be at least 2 characters.',
    }).max(100, { message: 'Professor name cannot exceed 100 characters.' }),
    department: z.string().min(2, {
        message: 'Department name must be at least 2 characters.',
    }).max(100, { message: 'Department name cannot exceed 100 characters.' }),
    courseCode: z.string().regex(courseCodeRegex, { // Add this with regex validation
        message: "Course code must be 3 letters followed by 4 digits (e.g., CSC 1401 or MGT 3301)",
    }),
});

type AddProfessorFormValues = z.infer<typeof addProfessorFormSchema>;

export function AddProfessorForm() {
    // --- CORRECT: Call useToast at the top level ---
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    // --- Get user from Auth Context ---
    const { user: currentUser } = useAuth(); // Get the user object from your context

    const form = useForm<AddProfessorFormValues>({
        resolver: zodResolver(addProfessorFormSchema),
        defaultValues: {
            name: '',
            department: '',
            courseCode: '',
        },
        mode: 'onChange',
    });

    async function onSubmit(data: AddProfessorFormValues) {
        setIsSubmitting(true);
        // --- No need to call useToast() here ---
        // --- Use currentUser obtained from useAuth() hook above ---

        if (!currentUser) {
            // Use the 'toast' function obtained from the hook at the top level
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            // --- Get the ID Token ---
            console.log("Getting ID token for Server Action...");
            // Use the user object from context
            const idToken = await currentUser.getIdToken(true); // Force refresh is often good before critical actions

            // --- Pass data and token to the Server Action ---
            console.log("Calling addProfessorAction with data and token...");
            const result = await addProfessorAction(data, idToken);

            if (result.success && result.professor) {
                 // Use the 'toast' function obtained from the hook at the top level
                toast({
                    title: 'Professor Added!',
                    description: `${result.professor.name} has been successfully added.`,
                    variant: 'default',
                });
                form.reset();
            } else {
                // Throw error using the error message from the server action result
                throw new Error(result.error || 'Failed to add professor.');
            }
        } catch (error) {
            console.error('Failed to add professor:', error);
             // Use the 'toast' function obtained from the hook at the top level
            toast({
                title: 'Submission Failed',
                description: error instanceof Error ? error.message : 'Could not add the professor.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            {/* Give feedback if user is not logged in (optional but good UX) */}
            {!currentUser && (
                 <p className="text-destructive text-sm mb-4">You must be logged in to add a professor.</p>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Professor Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Dr. Jane Doe" {...field} disabled={!currentUser || isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Computer Science" {...field} disabled={!currentUser || isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="courseCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course Code <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., CSC 1401" {...field} disabled={!currentUser || isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={!currentUser || isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                        </>
                    ) : (
                        'Add Professor'
                    )}
                </Button>
            </form>
        </Form>
    );
}