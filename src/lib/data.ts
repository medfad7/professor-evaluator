// src/lib/data.ts
'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import type { Professor, Review, NewReviewData } from '@/lib/types';

// --- Firestore Collection References ---
const professorsCollection = adminDb.collection('professors');

// Helper function - This function *can* return Timestamps if only used by other server functions,
// BUT if its results are included directly in data sent to the client (like in getProfessorById),
// the conversion needs to happen there.
async function getReviewsForProfessor(professorId: string): Promise<Review[]> {
    const reviewsCollectionRef = adminDb.collection(`professors/${professorId}/reviews`);
    const reviewsQuery = reviewsCollectionRef.orderBy('createdAt', 'desc');
    const querySnapshot = await reviewsQuery.get();
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            studentName: data.studentName,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.createdAt, // Keep as Admin Timestamp *here*
        } as Review; // Assuming Review type expects Timestamp for createdAt server-side
    });
}


// --- Data Fetching Functions ---

// Fetch a single professor by ID - **EDIT RETURN STATEMENT**
// Adjust return type to reflect createdAt is now string
export async function getProfessorById(id: string): Promise<(Omit<Professor, 'createdAt'> & { createdAt: string, reviews: (Omit<Review, 'createdAt'> & { createdAt: string })[] }) | undefined> {
    try {
        console.log(`Fetching professor with ID (Admin SDK): ${id}`);
        const professorDocRef = adminDb.doc(`professors/${id}`);
        const professorSnap = await professorDocRef.get();

        if (!professorSnap.exists) {
            console.log(`Professor with ID ${id} not found.`);
            return undefined;
        }
        const professorData = professorSnap.data();
        if (!professorData) return undefined;

        console.log(`Found professor: ${professorData.name}`);
        const reviews = await getReviewsForProfessor(id);

        // --- Convert Timestamps before returning ---
        const createdAtTimestamp = professorData.createdAt as Timestamp;
        const serializableCreatedAt = createdAtTimestamp.toDate().toISOString(); // Convert professor timestamp

        return {
            id: professorSnap.id,
            name: professorData.name,
            department: professorData.department,
            courseCode: professorData.courseCode,
            reviewCount: professorData.reviewCount ?? 0,
            averageRating: professorData.averageRating === null ? undefined : professorData.averageRating,
            addedByUid: professorData.addedByUid,
            createdAt: serializableCreatedAt, // <-- Pass the converted STRING
            reviews: reviews.map(review => ({ // <-- Convert timestamps in reviews too
                ...review,
                createdAt: (review.createdAt as Timestamp).toDate().toISOString() // Convert review timestamp
            }))
        };
    } catch (error) {
        console.error("Error fetching professor by ID (Admin SDK):", error);
        throw new Error("Failed to fetch professor data.");
    }
}

// Fetch all professors - **EDIT RETURN STATEMENT**
// Adjust return type to reflect createdAt is now string
export async function getAllProfessors(): Promise<(Omit<Professor, 'createdAt'> & { createdAt: string })[]> {
    try {
        console.log("Fetching all professors (Admin SDK)...");
        const querySnapshot = await professorsCollection.get();
        const professors = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // --- Convert Timestamp before returning ---
            const createdAtTimestamp = data.createdAt as Timestamp;
            const serializableCreatedAt = createdAtTimestamp.toDate().toISOString(); // Convert

            return {
                id: doc.id,
                name: data.name,
                department: data.department,
                courseCode: data.courseCode,
                reviewCount: data.reviewCount ?? 0,
                averageRating: data.averageRating === null ? undefined : data.averageRating,
                addedByUid: data.addedByUid, // Ensure this exists or handle if optional
                createdAt: serializableCreatedAt, // <-- Pass the converted STRING
            };
        });
        console.log(`Fetched ${professors.length} professors (Admin SDK).`);
        return professors;
    } catch (error) {
        console.error("Error fetching all professors (Admin SDK):", error);
        throw new Error("Failed to fetch professors list.");
    }
}


// Add a review - **EDIT RETURN STATEMENT**
// Adjust return type to reflect createdAt is now string
export async function addReview(
    professorId: string,
    reviewData: NewReviewData,
    idToken?: string
): Promise<Omit<Review, 'createdAt'> & { createdAt: string }> {

    // --- Authorization Check ---
    let decodedToken;
    if (idToken) {
        try {
            console.log("Verifying ID token server-side for addReview...");
            decodedToken = await adminAuth.verifyIdToken(idToken);
            console.log(`User ${decodedToken.uid} authenticated for addReview.`);
        } catch (error: any) {
            console.error("ID Token verification failed for addReview:", error);
            if (error.code === 'auth/id-token-expired') { throw new Error('Session expired. Please log in again.'); }
            throw new Error('Failed to verify authentication for addReview.');
        }
    } else {
        // This case should probably throw an error if called as a Server Action from client
        console.error("addReview called without ID Token - Will create Anonymous review.");
    }
    // --- End Auth Check ---

    console.log(`Attempting to add review for professor ID (Admin SDK): ${professorId}`, reviewData);
    const professorDocRef = adminDb.doc(`professors/${professorId}`);
    const reviewsCollectionRef = professorDocRef.collection('reviews');

    try {
        let finalReviewData = {}; // To store data for return value

        // --- TRANSACTION WITH DETAILED LOGGING ---
        await adminDb.runTransaction(async (transaction) => {
            console.log(`---> TRANSACTION START for professor: ${professorId}`); // Log start

            const professorDoc = await transaction.get(professorDocRef);
            if (!professorDoc.exists) {
                console.error(`---> TRANSACTION ERROR: Professor ${professorId} not found.`);
                throw new Error(`Professor with ID ${professorId} not found`);
            }

            const currentData = professorDoc.data()!;
            const currentReviewCount = currentData.reviewCount ?? 0;
            const currentAverageRating = currentData.averageRating === null ? 0 : (currentData.averageRating ?? 0);
            console.log(`---> Current review count: ${currentReviewCount}, Current avg rating: ${currentAverageRating}`); // Log current values

            const newReviewDocRef = reviewsCollectionRef.doc(); // Generate ref
            const newReviewPayload: any = {
                ...reviewData,
                createdAt: FieldValue.serverTimestamp(),
                // Calculate sentiment or remove this line
                sentiment: reviewData.rating >= 4 ? 'positive' : reviewData.rating <= 2 ? 'negative' : 'neutral',
                authorUid: decodedToken?.uid ?? null, // Use null coalescing
            };

            console.log("---> Attempting transaction.set for new review...");
            transaction.set(newReviewDocRef, newReviewPayload);
            console.log("---> transaction.set called."); // Confirm set was reached

            // --- Calculate new aggregates ---
            const newReviewCount = currentReviewCount + 1;
            // Ensure rating is treated as a number
            const currentTotalRating = (currentAverageRating * currentReviewCount);
            const newTotalRating = currentTotalRating + Number(reviewData.rating);
            // Avoid division by zero edge case (shouldn't happen if count starts at 0 and increments)
            const newAverageRating = newReviewCount > 0 ? parseFloat((newTotalRating / newReviewCount).toFixed(2)) : 0;
            console.log(`---> Calculated new count: ${newReviewCount}, New avg rating: ${newAverageRating}`); // Log calculated values

            const updateData = {
                 reviewCount: newReviewCount,
                 averageRating: newAverageRating,
            };
            console.log("---> Attempting transaction.update for professor doc with:", updateData); // Log update data
            transaction.update(professorDocRef, updateData);
            console.log("---> transaction.update called."); // Confirm update was reached

            console.log(`---> TRANSACTION END (commit pending) for professor: ${professorId}`); // Log end of callback
            // Store data needed for return value (timestamp is FieldValue here)
            finalReviewData = { id: newReviewDocRef.id, ...newReviewPayload };
        });
        // --- END TRANSACTION ---

        console.log("Transaction committed successfully."); // Log successful commit outside transaction

        // --- Convert Timestamp before returning ---
        const serializableCreatedAt = new Date().toISOString(); // Approximation
        return {
             ...(finalReviewData as Omit<Review, 'createdAt' | 'id'>),
             id: finalReviewData.id,
             createdAt: serializableCreatedAt
        };

    } catch (error) {
        // Log the specific error from the transaction failure
        console.error("ADD REVIEW FAILED (Transaction or Post-Transaction Error):", error);
        // Return an error structure instead of throwing to match expected return type?
        // Or adjust the calling code to handle thrown errors.
        // For now, re-throwing:
        throw new Error(`Failed to submit review: ${error instanceof Error ? error.message : String(error)}`);
        // Or return error object:
        // return { success: false, error: `Failed to submit review: ${error instanceof Error ? error.message : String(error)}` };
    }
}