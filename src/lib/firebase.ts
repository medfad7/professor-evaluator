// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Import createUserWithEmailAndPassword

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app); // Initialize Auth
console.log("Current user:", auth.currentUser);

async function makeUserAdmin(uid: string) {
  // Check if we are client side, if not, return.
  if (typeof window === 'undefined') {
    console.warn("makeUserAdmin called on server-side. Skipping API call.");
    return;
  }
  try {
    console.log(`Attempting to make user ${uid} an admin via API...`);
    const response = await fetch(`${window.location.origin}/api/createAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid }),
    });

    if (response.ok) {
      console.log(`✅ Successfully made user ${uid} an admin via API.`);
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error(`❌ Failed to make user an admin via API. Status: ${response.status}, Response:`, errorData);
    }
  } catch (error) {
    console.error('❌ Error calling /api/createAdmin route:', error);
  }
}

// --- Function to create an initial admin user ---
// IMPORTANT: Run this function only ONCE in your development environment
// by uncommenting the call below, running the app, and then
// IMMEDIATELY commenting it out or removing it afterwards for security.
async function createInitialAdminUser(email: string, password: string) {
  // Basic password strength check (example)
  if (!password || password.length < 8) {
    console.error("Password must be at least 8 characters long.");
    return;
  }
  if (!email) {
    console.error("Email cannot be empty.");
    return;
  }

  try {
    // Check if the user already exists (optional but good practice)
    // Note: Firebase Admin SDK has getUserByEmail, client-side requires attempting sign-in which isn't ideal here.
    // For initial setup, just attempting creation is usually fine. If it fails because the user exists, that's okay.

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("✅ Admin user created successfully:");
    console.log("   Email:", user.email);
    console.log("   UID:", user.uid);
    // Call makeUserAdmin after creating the user
    if (user && user.uid) {
      // IMPORTANT: This call is client-side only.
      // Ensure this function is called from a client component context if uncommented.
      // For server-side execution, setting claims requires Firebase Admin SDK directly.
      await makeUserAdmin(user.uid);
    }

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.warn(`⚠️ Admin user with email ${email} already exists.`);
      // Optionally, still try to make the existing user an admin if needed
      // This requires fetching the UID first, which is harder client-side without signing in.
      // It's usually better to handle this manually in Firebase console or via a dedicated admin tool.

    } else if (error.code === 'auth/weak-password') {
      console.error("❌ Error creating admin user: Password is too weak.");
    } else {
       // Check specifically for API key error
      if (error.code === 'auth/api-key-not-valid' || (error.message && error.message.includes('auth/api-key-not-valid'))) {
         console.error("❌ Error creating admin user: Invalid Firebase API Key.");
         console.error("   Please ensure NEXT_PUBLIC_FIREBASE_API_KEY in your .env file is correct and the Firebase project/app is properly configured.");
      } else {
         console.error("❌ Error creating admin user:", error.code, error.message); // Log the actual error code and message
      }
    }
  }
}

// --- !!! USE WITH CAUTION !!! ---
// 1. Ensure your .env or .env.local file has the correct Firebase config (especially NEXT_PUBLIC_FIREBASE_API_KEY).
// 2. Restart your development server.
// 3. UNCOMMENT the line below IF YOU NEED TO CREATE THE INITIAL ADMIN USER.
// 4. REPLACE with your desired admin email and a STRONG password.
// 5. START your development server (e.g., `npm run dev`).
// 6. CHECK the browser console AND server console (terminal where you ran `npm run dev`) for success or error messages.
// 7. RE-COMMENT or DELETE the line below immediately after use.
// createInitialAdminUser('admin@example.com', 'yourStrongPassword123'); // Example - KEEP COMMENTED unless actively creating user
// ---------------------------------
// makeUserAdmin('foIemM5XKPRnPUtWzqtalRjAB1C3') // Keep this commented out - it was likely for a specific user and should not run automatically.

export { app, db, auth, createInitialAdminUser }; // Export auth
