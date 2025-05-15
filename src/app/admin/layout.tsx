
'use client'; // This layout now needs client-side hooks

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  // Use useEffect to handle redirection after render
  React.useEffect(() => {
    // Only redirect if loading is finished and user is not logged in
    if (!loading && !user) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl); // Use replace to avoid adding login to history stack
    }
  }, [user, loading, router, pathname]); // Dependencies for the effect

  // Handle loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Checking authentication status...</p>
         {/* Optional: Add skeleton for layout structure */}
         <div className="w-full max-w-4xl space-y-6">
             <Skeleton className="h-10 w-32 rounded-md" />
             <Skeleton className="h-40 w-full rounded-lg" />
             <Skeleton className="h-60 w-full rounded-lg" />
         </div>
      </div>
    );
  }

  // If not loading and no user, show access denied/redirecting message
  // This will be shown briefly while the useEffect runs the redirect
  if (!loading && !user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You must be logged in to view this page.</p>
            <p className="text-sm text-muted-foreground mt-1">Redirecting to login...</p>
        </div>
    );
  }


  // User is authenticated, render the admin layout with children
  // This block only renders if loading is false AND user exists
  return (
    <div className="relative">
      {/* Optional: Add a small persistent logout button */}
      <div className="absolute top-4 right-4 z-10">
          <Button variant="outline" size="sm" onClick={signOut} disabled={loading}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
      </div>
      {/* Render the actual admin page content */}
      {children}
    </div>
  );
}
