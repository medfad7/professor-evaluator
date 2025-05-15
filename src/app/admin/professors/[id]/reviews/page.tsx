import { getProfessorById } from '@/lib/data'; // Needs to also fetch reviews
import type { Review } from '@/lib/types';
import { notFound } from 'next/navigation';
import { AdminReviewCard } from '@/components/admin/admin-review-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ArrowLeft, User, GraduationCap, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AdminProfessorReviewsPageProps {
  params: {
    id: string; // Professor ID
  };
}

// Generate dynamic metadata for the page title
export async function generateMetadata({ params }: AdminProfessorReviewsPageProps) {
  const professorWithReviews = await getProfessorById(params.id);
  const professor = professorWithReviews ? { ...professorWithReviews } : undefined; // Extract basic info

  const title = professor ? `Manage Reviews for ${professor.name} | Admin` : 'Professor Not Found';
  const description = professor ? `View and manage student reviews submitted for Professor ${professor.name}.` : 'Could not find the requested professor.';

  return {
    title: title,
    description: description,
  };
}

export default async function AdminProfessorReviewsPage({ params }: AdminProfessorReviewsPageProps) {
  const professorWithReviews = await getProfessorById(params.id);

  if (!professorWithReviews) {
    notFound();
  }

  const { reviews, ...professor } = professorWithReviews;
  const sortedReviews = reviews ?? []; // Reviews are already sorted by date desc

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
      </Button>

      {/* Professor Header Info */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Manage Reviews for: {professor.name}
          </CardTitle>
           <CardDescription className="text-muted-foreground mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {professor.department}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {professor.courseCode}</span>
           </CardDescription>
        </CardHeader>
      </Card>

      <Separator />

      {/* Reviews Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Submitted Reviews ({sortedReviews.length})
        </h2>
        {sortedReviews.length > 0 ? (
          <div className="space-y-4">
            {sortedReviews.map((review) => (
              <AdminReviewCard key={review.id} review={review} professorId={professor.id} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8 px-4 border-dashed">
            <CardContent>
              <p className="text-muted-foreground italic">
                No reviews have been submitted for {professor.name} yet.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
