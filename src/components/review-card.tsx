import type { Review } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/star-rating';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'; // Example icons
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarImage as we don't have image URLs
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp type

interface ReviewCardProps {
  review: Review;
}

// Function to get initials from name, handling "Anonymous"
const getInitials = (name: string) => {
    if (!name || name.toLowerCase() === 'anonymous') {
        return 'A'; // Or any placeholder for anonymous
    }
    const names = name.trim().split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    // Optional: Add last initial if available
    // if (names.length > 1) {
    //     initials += names[names.length - 1].substring(0, 1).toUpperCase();
    // }
    return initials;
};


export function ReviewCard({ review }: ReviewCardProps) {
  // Simple sentiment visualization based on rating (can be refined)
  const sentimentIcon = review.rating >= 4
    ? <ThumbsUp className="h-4 w-4 text-green-600" />
    : review.rating <= 2
    ? <ThumbsDown className="h-4 w-4 text-red-600" />
    : <MessageSquare className="h-4 w-4 text-muted-foreground" />; // Neutral

  const displayName = review.studentName || "Anonymous";

  // Convert Firestore Timestamp to JavaScript Date object for formatting
  const createdAtDate = (review.createdAt as Timestamp)?.toDate ? (review.createdAt as Timestamp).toDate() : new Date();


  return (
    <Card className="mb-4 shadow-sm border border-border/70 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-2 gap-3">
        <div className="flex items-center gap-3 flex-grow min-w-0">
           <Avatar className="h-8 w-8 text-xs flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
                 <CardTitle className="text-base font-medium truncate" title={displayName}>{displayName}</CardTitle>
                 <div className="text-xs text-muted-foreground pt-0.5">
                     {/* Format the converted Date object */}
                    <time dateTime={createdAtDate.toISOString()} title={format(createdAtDate, 'PPP p')}>
                      {formatDistanceToNow(createdAtDate, { addSuffix: true })}
                    </time>
                </div>
            </div>
        </div>
         <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            {/* Optional: Display sentiment icon */}
            {/* {sentimentIcon} */}
            <StarRating rating={review.rating} size={16} />
         </div>

      </CardHeader>
      <CardContent className="pt-1 pb-4 px-5">
        <CardDescription className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
          {review.comment}
        </CardDescription>
      </CardContent>
       {/* Optional Footer */}
       {/* <CardFooter className="text-xs text-muted-foreground flex justify-end pt-2">
         <span>Helpful?</span> <Button variant="ghost" size="sm"><ThumbsUp size={14}/></Button>
       </CardFooter> */}
    </Card>
  );
}
