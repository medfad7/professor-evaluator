import { getProfessorById, getAllProfessors } from '@/lib/data'; // Updated data functions
import type { Professor, Review } from '@/lib/types';
import { notFound } from 'next/navigation';
import { ReviewCard } from '@/components/review-card';
import { StarRating } from '@/components/star-rating';
import { ReviewForm } from '@/components/review-form';
import { ReviewSummary } from '@/components/review-summary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, MapPin, MessageSquare, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import ProfessorPageSkeleton from './loading'; // Import the skeleton component

interface ProfessorPageProps {
  params: {
    id: string;
  };
}

// Generate static paths for professors at build time (optional but recommended for performance)
export async function generateStaticParams() {
  try {
    const professors = await getAllProfessors();
    return professors.map((professor) => ({
      id: professor.id,
    }));
  } catch (error) {
    console.error("Failed to generate static params for professors:", error);
    return []; // Return empty array on error to prevent build failure
  }
}

// Generate dynamic metadata for the page title
export async function generateMetadata({ params }: ProfessorPageProps) {
  // Fetch only professor data for metadata, not reviews yet
  const professorData = await getProfessorById(params.id); // This now includes reviews, but we only need basic info here
  const professor = professorData ? { ...professorData } : undefined; // Extract basic info if needed, or just use professorData

  const title = professor ? `${professor.name} - Reviews | Professor Evaluator` : 'Professor Not Found';
  const description = professor ? `Read student reviews and ratings for Professor ${professor.name}, teaching ${professor.department} at ${professor.courseCode}.` : 'Could not find the requested professor.';

  return {
    title: title,
    description: description,
  };
}


// Main Page Component - fetches professor data (which includes reviews now) and renders UI
async function ProfessorDetails({ professorId }: { professorId: string }) {
    // getProfessorById now returns the professor and their reviews together
    const professorWithReviews = await getProfessorById(professorId);

    if (!professorWithReviews) {
        notFound(); // Trigger the not-found page
    }

    const { reviews, ...professor } = professorWithReviews; // Separate reviews from professor data
    console.log(professor);
    console.log(reviews);

    // Reviews are already sorted by createdAt desc in the getReviewsForProfessor helper
    const sortedReviews = reviews ?? [];
    const reviewCount = professor.reviewCount ?? 0; // Use denormalized count
    const avgRating = professor.averageRating; // Can be number, null, or undefined

    return (
        <div className="space-y-6 md:space-y-8">
        {/* Professor Header Info */}
        <Card className="overflow-hidden shadow-lg border border-border/70">
            <CardHeader className="bg-gradient-to-r from-primary/90 via-primary to-primary/80 text-primary-foreground p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-grow">
                    <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                       <User className="h-6 w-6 md:h-7 md:w-7 opacity-90" /> {professor.name}
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/90 mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-4 gap-y-1 text-sm md:text-base">
                        <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 md:h-5 md:w-5" /> {professor.department}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 md:h-5 md:w-5" /> {professor.courseCode}</span>
                    </CardDescription>
                </div>
                <div className="flex flex-col items-start md:items-end mt-2 md:mt-0 flex-shrink-0">
                    <span className="text-xs font-medium mb-1 text-primary-foreground/80">Overall Rating</span>
                    {/* Check for null/undefined before displaying */}
                    {avgRating !== undefined && avgRating !== null ? (
                        <div className="flex items-center gap-2 bg-background/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary-foreground/20 shadow-sm">
                        <StarRating rating={avgRating} size={20} fillColor="text-yellow-300" emptyColor="text-primary-foreground/40" />
                        <span className="text-lg font-semibold text-white">{avgRating.toFixed(1)}</span>
                        <span className="text-xs text-primary-foreground/70">({reviewCount} reviews)</span> {/* Use reviewCount */}
                        </div>
                    ) : (
                        <span className="text-sm bg-background/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary-foreground/20 shadow-sm italic">No ratings yet</span>
                    )}
                </div>
            </div>
            </CardHeader>
        </Card>

        {/* AI Summary Section - Conditionally render only if reviews exist */}
        {sortedReviews.length > 0 && (
            <ReviewSummary professorName={professor.name} reviews={sortedReviews} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Reviews Section */}
            <section className="lg:col-span-2 space-y-5">
                <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2 border-b pb-2">
                    <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary"/>
                    Student Reviews ({reviewCount}) {/* Use reviewCount */}
                </h2>
                {sortedReviews.length > 0 ? (
                   <div className="space-y-4">
                     {sortedReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                     ))}
                   </div>
                ) : (
                    <Card className="text-center py-10 px-4 border-dashed">
                        <CardContent>
                        <p className="text-muted-foreground italic">
                        No reviews have been submitted for {professor.name} yet.
                        </p>
                        <p className="text-muted-foreground mt-1">Be the first to share your experience!</p>
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Review Form Section */}
            <aside className="lg:col-span-1">
            <div className="sticky top-20"> {/* Makes the form sticky on larger screens */}
                <ReviewForm professorId={professor.id} />
            </div>
            </aside>
        </div>
        </div>
    );
}


// Page component using Suspense for better loading states
export default function ProfessorPage({ params }: ProfessorPageProps) {
  return (
    <Suspense fallback={<ProfessorPageSkeleton />}>
      <ProfessorDetails professorId={params.id} />
    </Suspense>
  );
}
