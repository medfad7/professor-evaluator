import type { Professor } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { GraduationCap, MapPin, MessageSquare } from 'lucide-react';

interface ProfessorCardProps {
  professor: Professor;
}

export function ProfessorCard({ professor }: ProfessorCardProps) {
  const reviewCount = professor.reviewCount ?? 0; // Use the denormalized count, default to 0
  const avgRating = professor.averageRating; // Can be number, null, or undefined

  return (
    <Card className="w-full overflow-hidden shadow-md transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:shadow-lg flex flex-col h-full border border-border/60 hover:border-primary/50">
      <CardHeader className="bg-secondary/50 p-4 pb-2">
        <CardTitle className="text-lg font-semibold text-primary">{professor.name}</CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-sm pt-1 text-muted-foreground">
            <GraduationCap className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{professor.department}</span>
        </CardDescription>
         <CardDescription className="flex items-center gap-1.5 text-sm pt-1 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{professor.courseCode}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
            <div className="flex items-center justify-start gap-2 mb-3">
            <span className="text-sm font-medium text-muted-foreground">Rating:</span>
            {/* Display stars only if rating is a valid number */}
            {avgRating !== undefined && avgRating !== null ? (
                <StarRating rating={avgRating} size={18} />
            ) : (
                <span className="text-sm text-muted-foreground italic">Not rated</span>
            )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 flex items-start gap-1.5">
               <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
                {reviewCount > 0
                ? `${reviewCount} review${reviewCount > 1 ? 's' : ''}. Click to read more.`
                : 'No reviews yet. Be the first to share your experience!'}
            </span>
            </p>
        </div>

      </CardContent>
      <CardFooter className="p-3 border-t bg-secondary/30">
        <Button asChild className="w-full" variant="default" size="sm">
             <Link href={`/professors/${professor.id}`}>View Profile & Reviews</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
