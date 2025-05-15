import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminProfessorReviewsNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
       <Card className="w-full max-w-md text-center shadow-lg border-destructive/50">
            <CardHeader className="bg-destructive/10">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-3" />
                <CardTitle className="text-2xl font-bold text-destructive">Professor Not Found</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-6 space-y-4">
                 <CardDescription className="text-md text-muted-foreground">
                    Oops! We couldn't find the professor whose reviews you were trying to manage. They might have been deleted or the link might be incorrect.
                 </CardDescription>
                <Button asChild variant="outline">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Back to Admin Dashboard
                    </Link>
                </Button>
            </CardContent>
       </Card>
    </div>
  );
}
