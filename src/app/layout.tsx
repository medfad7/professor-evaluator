import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context'; // Import AuthProvider

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Professor Evaluator', // Updated App Name
  description: 'Rate and review AUI professors. Find the best professors based on student feedback.', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(
        inter.variable,
        "font-sans antialiased flex flex-col min-h-screen bg-secondary/30" // Using secondary as subtle bg
      )}>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-90 transition-opacity">
                <GraduationCap className="h-7 w-7" />
                Professor Evaluator
              </Link>
              {/* Potential Nav Links Placeholder */}
              {/* <div className="space-x-4">
                <Link href="/professors" className="hover:underline">Browse Professors</Link>
                <Link href="/submit" className="hover:underline">Submit Review</Link>
              </div> */}
            </nav>
          </header>

          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </main>

          <footer className="bg-muted text-muted-foreground py-4 mt-auto border-t">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs sm:text-sm">
              © {new Date().getFullYear()} Professor Evaluator. All rights reserved.
              {/* Optional: Add links like Privacy Policy, Terms of Service */}
              {/* <span className="mx-2">|</span>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link> */}
            </div>
          </footer>

          <Toaster /> {/* Add Toaster component here for notifications */}
        </AuthProvider> {/* Close AuthProvider */}
      </body>
    </html>
  );
}
