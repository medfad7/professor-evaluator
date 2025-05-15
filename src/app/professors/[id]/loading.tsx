import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function ProfessorPageSkeleton() {
  return (
     <div className="space-y-6 md:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/50 p-4 md:p-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex-grow space-y-2">
                <Skeleton className="h-7 md:h-8 bg-muted-foreground/30 rounded w-3/5" /> {/* Name */}
                 <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                     <Skeleton className="h-5 bg-muted-foreground/20 rounded w-2/5" /> {/* Department */}
                     <Skeleton className="h-5 bg-muted-foreground/20 rounded w-1/3" /> {/* University */}
                 </div>
             </div>
              <div className="flex flex-col items-start md:items-end mt-2 md:mt-0">
                <Skeleton className="h-4 bg-muted-foreground/20 rounded w-20 mb-1.5" /> {/* Label */}
                <Skeleton className="h-8 bg-muted-foreground/30 rounded-full w-36" /> {/* Rating */}
              </div>
           </div>
        </CardHeader>
      </Card>

       {/* AI Summary Skeleton */}
      <Card className="bg-secondary/40 border-dashed border-border/50 shadow-sm mt-6">
         <CardHeader>
             <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                 <div className="space-y-1.5 flex-grow">
                    <Skeleton className="h-6 bg-muted-foreground/30 rounded w-48" /> {/* Title */}
                    <Skeleton className="h-4 bg-muted-foreground/20 rounded w-64" /> {/* Description */}
                 </div>
                 <Skeleton className="h-8 bg-muted-foreground/20 rounded w-36 mt-1 sm:mt-0" /> {/* Button */}
             </div>
         </CardHeader>
         <CardContent>
             <Skeleton className="h-20 bg-background/50 rounded" /> {/* Content placeholder */}
         </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Reviews Section Skeleton */}
        <section className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded" /> {/* Icon */}
                <Skeleton className="h-7 bg-muted-foreground/30 rounded w-56" /> {/* Title */}
            </div>
             <Separator className="mb-4"/>
             {/* Review Card Skeletons */}
             {[...Array(3)].map((_, i) => (
                <Card key={i} className="mb-4 shadow-sm border border-border/70">
                <CardHeader className="flex flex-row items-start justify-between pb-2 gap-3">
                     <div className="flex items-center gap-3 flex-grow min-w-0">
                        <Skeleton className="h-8 w-8 bg-muted-foreground/20 rounded-full flex-shrink-0" /> {/* Avatar */}
                        <div className="flex-grow min-w-0 space-y-1.5">
                             <Skeleton className="h-5 bg-muted-foreground/30 rounded w-32" /> {/* Name */}
                             <Skeleton className="h-3 bg-muted-foreground/20 rounded w-24" /> {/* Date */}
                        </div>
                    </div>
                     <Skeleton className="h-5 bg-muted-foreground/20 rounded-full w-28 flex-shrink-0" /> {/* Rating Stars */}
                </CardHeader>
                <CardContent className="pt-1 pb-4 px-5 space-y-2">
                    <Skeleton className="h-4 bg-muted-foreground/15 rounded w-full" />
                    <Skeleton className="h-4 bg-muted-foreground/15 rounded w-5/6" />
                    <Skeleton className="h-4 bg-muted-foreground/15 rounded w-3/4" />
                </CardContent>
                </Card>
             ))}
        </section>

         {/* Form Section Skeleton */}
        <aside className="lg:col-span-1">
            <div className="sticky top-20">
                 <Card className="p-4 md:p-6 space-y-5 border rounded-lg shadow-sm bg-card">
                    <Skeleton className="h-6 bg-muted-foreground/30 rounded w-40 mb-1" /> {/* Form Title */}
                     {/* Form Fields Skeleton */}
                    <div className="space-y-2">
                         <Skeleton className="h-4 bg-muted-foreground/20 rounded w-24" /> {/* Label */}
                         <Skeleton className="h-9 bg-muted-foreground/10 rounded" /> {/* Input */}
                    </div>
                     <div className="space-y-2">
                         <Skeleton className="h-4 bg-muted-foreground/20 rounded w-24" /> {/* Label */}
                          <div className="flex space-x-1">
                           {[...Array(5)].map((_, j) => <Skeleton key={j} className="h-7 w-7 bg-muted-foreground/20 rounded-sm" />)} {/* Stars */}
                         </div>
                    </div>
                     <div className="space-y-2">
                         <Skeleton className="h-4 bg-muted-foreground/20 rounded w-24" /> {/* Label */}
                         <Skeleton className="h-24 bg-muted-foreground/10 rounded" /> {/* Textarea */}
                    </div>
                     <Skeleton className="h-10 bg-primary/50 rounded w-full md:w-32" /> {/* Button */}
                 </Card>
            </div>
        </aside>
      </div>
    </div>
  );
}
