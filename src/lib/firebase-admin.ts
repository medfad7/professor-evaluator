// lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

// Read the JSON string from the environment variable
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  if (!serviceAccountJson) {
    console.error("Firebase Admin SDK Error: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    // Throw an error or handle appropriately - Admin SDK cannot initialize
  } else {
    try {
      // Parse the JSON string from the environment variable
      const serviceAccount = JSON.parse(serviceAccountJson);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Use your project ID env var
      });
      console.log("Firebase Admin SDK Initialized from Service Account Key");
    } catch (error: any) {
      console.error("Firebase Admin SDK Initialization Error:", error.stack);
      // Log the parsing error if it happens
      if (error instanceof SyntaxError) {
        console.error("--> Check if FIREBASE_SERVICE_ACCOUNT_KEY in .env.local is a valid JSON string.");
      }
    }
  }
}

const adminDb = getAdminFirestore();
const adminAuth = getAdminAuth();

export { adminDb, adminAuth };