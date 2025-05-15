
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2, LogIn } from 'lucide-react'; // Removed UserPlus icon
import { useRouter, useSearchParams } from 'next/navigation';
import type { AuthCredentials } from '@/lib/types'; // Import AuthCredentials type
import { useToast } from '@/hooks/use-toast'; // Import useToast

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { signIn, loading, error, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast(); // Get toast function
  const redirectUrl = searchParams.get('redirect') || '/admin'; // Default redirect to admin dashboard

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  async function onSubmit(data: LoginFormValues) {
    await signIn(data as AuthCredentials);
    // No need to manually redirect here, useEffect handles it on successful login
    // Or protected route logic will handle it
  }

  // Don't render the form if the user is logged in (avoids flash of form)
  if (user) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-2 text-muted-foreground">Redirecting...</p>
        </div>
    );
  }


  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border border-border/70">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
             <LogIn className="h-6 w-6 text-primary" />
             Admin Login
          </CardTitle>
          <CardDescription>
            Access the Professor Evaluator dashboard.
            <br />
            <span className="text-xs text-muted-foreground/80">(Admin account created manually)</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2 rounded-md border border-destructive/30">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                 {loading ? (
                   <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                   </>
                 ) : (
                   'Sign In'
                 )}
              </Button>
              {/* Removed the temporary Sign Up button */}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
