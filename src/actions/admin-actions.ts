// In your Server Actions file ('use server')
'use server';

// Import the ADMIN DB and Auth instances
import { adminDb, adminAuth } from '@/lib/firebase-admin';
// Import ADMIN SDK Firestore methods/types
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import { revalidatePath } from 'next/cache';
import { z } from 'zod'; // Keep Zod if needed for other actions
import type { Professor } from '@/lib/types';

// --- Helper: Get Reviews for Deletion (Using Admin SDK) ---
// (Keep this helper function as it was)
async function getReviewsForProfessorRefs(professorId: string) {
    const reviewsCollectionRef = adminDb.collection(`professors/${professorId}/reviews`);
    const reviewsSnapshot = await reviewsCollectionRef.get();
    return reviewsSnapshot.docs.map(doc => doc.ref);
}

const courseCodeRegex = /^[A-Za-z]{3}\s\d{4}$/;
// --- Action: Add Professor (Previously Modified - Keep As Is) ---
const AddProfessorSchema = z.object({
    name: z.string().min(2).max(100),
    department: z.string().min(2).max(100),
    courseCode: z.string().regex(courseCodeRegex, { // Add this with regex validation
        message: "Course code must be 3 letters followed by 4 digits (e.g., CSC 1401 or MGT 3301)",
    }),
});
// ... your updated addProfessorAction code ...
export async function addProfessorAction(
  data: z.infer<typeof AddProfessorSchema>,
  idToken: string
): Promise<{ success: boolean; professor?: Professor; error?: string }> {

  // --- AUTHORIZATION CHECK ---
  let decodedToken;
  if (!idToken) { return { success: false, error: 'Authentication token missing.' }; }
  try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
      if (decodedToken.admin !== true) {
          return { success: false, error: 'Permission denied: Admin privileges required.' };
      }
      console.log(`User ${decodedToken.uid} authorized as admin via ID Token for addProfessorAction.`);
  } catch (error: any) { /* ... error handling ... */ return { success: false, error: 'Failed to verify authentication.' }; }
  // --- END AUTHORIZATION CHECK ---

  const validation = AddProfessorSchema.safeParse(data);
  if (!validation.success) { return { success: false, error: 'Invalid professor data.' }; }

  try {
      const newProfData = {
          ...validation.data,
          reviewCount: 0,
          averageRating: null,
          createdAt: FieldValue.serverTimestamp(), // Let Firestore set the timestamp
          addedByUid: decodedToken.uid,
      };
      const docRef = await adminDb.collection('professors').add(newProfData);
      console.log('Professor added with ID (Admin SDK):', docRef.id);

      // --- Fetch the newly created document to get the actual data ---
      const createdDocSnap = await docRef.get();
      if (!createdDocSnap.exists) {
           throw new Error("Failed to fetch newly created professor document.");
      }
      const createdData = createdDocSnap.data();

      // --- Convert Firestore Timestamp before returning ---
      const serializableProfessor: Professor = {
          id: docRef.id,
          name: createdData.name,
          department: createdData.department,
          courseCode: createdData.courseCode,
          reviewCount: createdData.reviewCount,
          averageRating: createdData.averageRating, // null is serializable
          addedByUid: createdData.addedByUid,
          // Convert Timestamp to ISO string (or milliseconds: createdData.createdAt.toMillis())
          createdAt: (createdData.createdAt as Timestamp).toDate().toISOString(),
          // Important: Adjust your Professor type definition if createdAt is now a string or number
      };

      revalidatePath('/admin');
      revalidatePath('/');

      return { success: true, professor: serializableProfessor }; // Return the serializable object

  } catch (error) {
      console.error('Error adding professor (Admin SDK):', error);
      return { success: false, error: `Failed to add professor: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// --- Action: Delete Professor (Using Admin SDK + ID Token Auth Check) ---
// Modify the function signature to accept the ID token
export async function deleteProfessorAction(
    professorId: string,
    idToken: string // <-- Accept ID token from client
): Promise<{ success: boolean; error?: string }> {

    // --- AUTHORIZATION CHECK (Using ID Token Verification) ---
    let decodedToken;
    if (!idToken) {
        return { success: false, error: 'Authentication token missing.' };
    }
    try {
        console.log("Verifying ID token server-side for deleteProfessorAction...");
        decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        if (decodedToken.admin !== true) {
            console.warn(`User ${uid} attempted deleteProfessorAction without admin claim.`);
            return { success: false, error: 'Permission denied: Admin privileges required.' };
        }
        console.log(`User ${uid} authorized as admin via ID Token for deleteProfessorAction.`);

    } catch (error: any) {
        console.error("ID Token verification failed:", error);
        if (error.code === 'auth/id-token-expired') {
             return { success: false, error: 'Session expired. Please log in again.' };
        }
        return { success: false, error: 'Failed to verify authentication.' };
    }
    // --- END AUTHORIZATION CHECK ---


    if (!professorId) {
        return { success: false, error: 'Professor ID is required.' };
    }

    const professorDocRef = adminDb.doc(`professors/${professorId}`);

    try {
        const batch = adminDb.batch();

        const reviewRefs = await getReviewsForProfessorRefs(professorId);
        console.log(`Found ${reviewRefs.length} reviews to delete for professor ${professorId}.`);
        reviewRefs.forEach(ref => batch.delete(ref));

        batch.delete(professorDocRef);

        await batch.commit();
        console.log(`Professor ${professorId} deleted successfully (Admin SDK).`);

        revalidatePath('/admin');
        revalidatePath('/');
        revalidatePath(`/professors/${professorId}`);

        return { success: true };
    } catch (error) {
        console.error(`Error deleting professor ${professorId} (Admin SDK):`, error);
        return { success: false, error: `Failed to delete professor: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}


// --- Action: Delete Review (Using Admin SDK + ID Token Auth Check) ---
// Modify the function signature to accept the ID token
export async function deleteReviewAction(
    professorId: string,
    reviewId: string,
    idToken: string // <-- Accept ID token from client
): Promise<{ success: boolean; error?: string }> {

    // --- AUTHORIZATION CHECK (Using ID Token Verification) ---
    let decodedToken;
     if (!idToken) {
        return { success: false, error: 'Authentication token missing.' };
    }
    try {
        console.log("Verifying ID token server-side for deleteReviewAction...");
        decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Decide who can delete: Currently only Admins
        if (decodedToken.admin !== true) {
             console.warn(`User ${uid} attempted deleteReviewAction without admin claim.`);
             return { success: false, error: 'Permission denied: Admin privileges required.' };
             // If you wanted review authors to delete, you'd add an OR condition here
             // after fetching the review document and checking its author field against uid.
        }
         console.log(`User ${uid} authorized as admin via ID Token for deleteReviewAction.`);

    } catch (error: any) {
        console.error("ID Token verification failed:", error);
         if (error.code === 'auth/id-token-expired') {
             return { success: false, error: 'Session expired. Please log in again.' };
        }
        return { success: false, error: 'Failed to verify authentication.' };
    }
    // --- END AUTHORIZATION CHECK ---


    if (!professorId || !reviewId) {
        return { success: false, error: 'Professor ID and Review ID are required.' };
    }

    const reviewDocRef = adminDb.doc(`professors/${professorId}/reviews/${reviewId}`);

    try {
        await reviewDocRef.delete();
        console.log(`Review ${reviewId} deleted successfully (Admin SDK).`);

        revalidatePath(`/professors/${professorId}`);
        revalidatePath(`/admin/professors/${professorId}/reviews`); // Adjust if admin path differs

        // TODO: Implement recalculation logic if needed.

        return { success: true };
    } catch (error) {
        console.error(`Error deleting review ${reviewId} (Admin SDK):`, error);
        return { success: false, error: `Failed to delete review: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}