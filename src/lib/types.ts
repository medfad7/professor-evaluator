import type { Timestamp } from 'firebase/firestore';

export interface Review {
  id: string;
  studentName: string; // Or anonymous
  rating: number; // e.g., 1-5 stars
  comment: string;
  createdAt: Timestamp; // Use Firestore Timestamp
  sentiment?: 'positive' | 'negative' | 'neutral'; // Optional: For potential future use or inferred display
}

export interface Professor {
  id: string;
  name: string;
  department: string;
  courseCode: string;      // Add this line (or courses: string[])
  reviewCount: number;
  averageRating?: number; // Representing null/undefined is okay here
  addedByUid?: string;    // Optional if added before auth tracking
  createdAt: string;
}

// Type for adding a new review (before it gets ID and Timestamp)
export interface NewReviewData {
  studentName: string;
  rating: number;
  comment: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

// Type for authentication credentials
export interface AuthCredentials {
    email: string;
    password?: string; // Password might be optional depending on auth method (e.g., OAuth)
}
