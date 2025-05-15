import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function AdminReviewsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back Button Skeleton */}
      <Skeleton className="h-9 w-48 rounded-md bg-muted/50" />

      {/* Header Skeleton */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <Skeleton className="h-7 w-3/5 mb-3 rounded bg-muted-foreground/30" /> {/* Title */}
          <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1">
            <Skeleton className="h-5 w-2/5 rounded bg-muted-foreground/20" /> {/* Department */}
            <Skeleton className="h-5 w-1/3 rounded bg-muted-foreground/20" /> {/* University */}
          </div>
        </CardHeader>
      </Card>

      <Separator />

      {/* Reviews Section Skeleton */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" /> {/* Icon */}
          <Skeleton className="h-6 w-48 rounded bg-muted-foreground/30" /> {/* Title */}
        </div>

        {/* Review Card Skeletons */}
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border border-border/70 bg-card/80 shadow-sm">
             <CardHeader className="flex flex-row items-start justify-between pb-2 gap-3">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    <Skeleton className="h-8 w-8 rounded-full bg-muted-foreground/20" /> {/* Avatar */}
                    <div className="space-y-1.5 flex-grow">
                        <Skeleton className="h-5 w-24 rounded bg-muted-foreground/30" /> {/* Name */}
                        <Skeleton className="h-3 w-20 rounded bg-muted-foreground/20" /> {/* Date */}
                    </div>
                </div>
                <Skeleton className="h-5 w-28 rounded-full bg-muted-foreground/20" /> {/* Rating */}
             </CardHeader>
             <CardContent className="pt-1 pb-4 px-5 space-y-2">
                <Skeleton className="h-4 w-full rounded bg-muted-foreground/15" />
                <Skeleton className="h-4 w-5/6 rounded bg-muted-foreground/15" />
             </CardContent>
             <CardContent className="flex justify-end p-3 border-t bg-muted/30">
                <Skeleton className="h-9 w-32 rounded-md bg-destructive/30" /> {/* Delete Button */}
             </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
