import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Ensure Firebase Admin SDK is initialized
if (!admin.apps.length) {
  try {
      // Use application default credentials or explicitly configure
      admin.initializeApp({
        // If using ADC (gcloud auth application-default login locally, or default service account on GCP):
        credential: admin.credential.applicationDefault(),
        // If explicit service account key file (ensure path is correct and secure):
        // credential: admin.credential.cert(require('./path/to/your/serviceAccountKey.json')),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Optional if using ADC correctly
      });
      console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
      console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  }
} else {
    console.log("Firebase Admin SDK already initialized.");
}


export async function POST(req: NextRequest) {
  let uid;
  try {
    const body = await req.json(); // Get the user ID from the request body
    uid = body.uid;
    console.log(`Received request to make user admin. UID: ${uid}`);
  } catch (error) {
     console.error('❌ Error parsing request body:', error);
     return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }


  if (!uid) {
    console.error('❌ Missing user ID in request body.');
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  try {
    // Set custom claims for the user
    console.log(`Attempting to set custom claims for user: ${uid}`);
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log('✅ Custom claims set successfully for user:', uid);

    // Verify claims (optional but recommended for debugging)
    // const userRecord = await admin.auth().getUser(uid);
    // console.log('Verified custom claims:', userRecord.customClaims);

    return NextResponse.json({ message: 'Admin claim set successfully' });
  } catch (error: any) { // Catch specific error type if known, otherwise 'any'
    console.error(`❌ Error setting custom claims for UID ${uid}:`, error);
    // Provide more specific error details if possible
    const errorCode = error.code || 'UNKNOWN_ERROR';
    const errorMessage = error.message || 'An internal server error occurred.';
    return NextResponse.json({ error: `Failed to set admin claim. Code: ${errorCode}`, details: errorMessage }, { status: 500 });
  }
}
