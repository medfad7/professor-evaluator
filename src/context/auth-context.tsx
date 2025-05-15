
'use client';

import * as React from 'react';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword as firebaseSignIn } from 'firebase/auth';
import type { AuthCredentials } from '@/lib/types'; // Assuming AuthCredentials type exists
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true); // Start loading until auth state is determined
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
       console.log("Auth state changed, user:", currentUser?.email); // Log auth changes
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signIn = async (credentials: AuthCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignIn(auth, credentials.email, credentials.password);
      // User state will be updated by onAuthStateChanged listener
      console.log("Sign in successful for:", credentials.email);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      // Redirect handled by login page or protected route logic
    } catch (err: any) {
      console.error("Sign in error:", err);
      let errorMessage = "An unknown error occurred during sign in.";
      // Handle specific Firebase auth errors
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = "Invalid email or password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/invalid-credential':
           errorMessage = "Invalid email or password.";
           break;
        case 'auth/too-many-requests':
            errorMessage = "Access temporarily disabled due to too many failed login attempts. Please try again later.";
            break;
        default:
          errorMessage = `Login failed: ${err.message}`;
      }
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      // User state will be updated by onAuthStateChanged listener
      setUser(null); // Explicitly set user to null immediately
      console.log("Sign out successful");
       toast({
           title: "Logged Out",
           description: "You have been successfully logged out.",
       });
       // Redirect to login or home page after logout
       router.push('/login'); // Redirect to login page
    } catch (err: any) {
      console.error("Sign out error:", err);
      setError(err.message || "Failed to sign out");
       toast({
           title: "Logout Failed",
           description: err.message || "Could not log out. Please try again.",
           variant: "destructive",
       });
    } finally {
      setLoading(false);
    }
  };

  const value = { user, loading, error, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
