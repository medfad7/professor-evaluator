'use client';

import * as React from 'react';
import { summarizeProfessorReviews } from '@/ai/flows/summarize-professor-reviews';
import type { Review } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface ReviewSummaryProps {
  professorName: string;
  reviews: Review[];
}

export function ReviewSummary({ professorName, reviews }: ReviewSummaryProps) {
  const [summary, setSummary] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isGenerated, setIsGenerated] = React.useState(false); // Track if summary has been generated at least once

  const handleSummarize = async () => {
     // Check if reviews exist, provide specific feedback if not
    if (!reviews || reviews.length === 0) {
        setSummary(null); // Clear any previous state
        setError(null);
        setIsLoading(false);
        setIsGenerated(false); // Reset generated state
        // Optionally show a message or disable button upstream
        // For now, we just won't proceed. Button is disabled if reviews.length === 0 below.
        return;
    }
    if (reviews.length < 3) { // Set a minimum number of reviews for a useful summary
       setError("Need at least 3 reviews to generate a meaningful summary.");
       setSummary(null);
       setIsLoading(false);
       setIsGenerated(false);
       return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null); // Clear previous summary before generating new one

    try {
      const reviewTexts = reviews.map(r => r.comment);
      const result = await summarizeProfessorReviews({ reviews: reviewTexts, professorName });
      setSummary(result.summary);
      setIsGenerated(true); // Mark as generated successfully
    } catch (err: unknown) {
      console.error("Error summarizing reviews:", err);
       const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate summary. ${errorMessage}. Please try again later.`);
      setSummary(null); // Ensure summary is cleared on error
      setIsGenerated(false); // Ensure generated state is false on error
    } finally {
      setIsLoading(false);
    }
  };

  // Only render the card if there are reviews to potentially summarize
  if (!reviews) return null;

  const canSummarize = reviews.length >= 3;

  return (
    <Card className="bg-gradient-to-br from-secondary/40 to-secondary/70 border-dashed border-primary/30 shadow-sm mt-6 relative overflow-hidden">
        {/* Optional: Subtle background pattern or element */}
        {/* <div className="absolute inset-0 opacity-5 bg-[url('/path/to/pattern.svg')]"></div> */}

      <CardHeader className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-grow">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2 font-semibold">
                <Wand2 className="h-5 w-5 text-primary flex-shrink-0" />
                AI-Powered Review Summary
                </CardTitle>
                <CardDescription className="text-xs md:text-sm mt-1">
                 An AI-generated overview of key feedback points from student reviews.
                </CardDescription>
            </div>
             <Button
                onClick={handleSummarize}
                disabled={isLoading || !canSummarize} // Disable if loading or not enough reviews
                size="sm"
                variant={isGenerated ? "secondary" : "default"} // Change variant after generation
                className="w-full sm:w-auto flex-shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : isGenerated ? (
                   "Regenerate Summary"
                ) : (
                  "Generate Summary"
                )}
                 {!canSummarize && reviews.length > 0 && (
                     <Info className="ml-2 h-4 w-4 text-muted-foreground" title="Need at least 3 reviews"/>
                 )}
            </Button>
        </div>

      </CardHeader>
      <CardContent className="relative z-10">
         {/* Error Display */}
         {error && (
           <Alert variant="destructive" className="mb-4">
                <AlertTitle className="flex items-center gap-2"><Info className="h-4 w-4"/> Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
           </Alert>
         )}

         {/* Initial State / Not Enough Reviews State */}
          {!isGenerated && !isLoading && !error && !canSummarize && reviews.length > 0 && (
            <div className="text-center text-sm text-muted-foreground p-4 border border-dashed rounded-md bg-background/50">
                <Info className="h-5 w-5 mx-auto mb-2 text-primary/70"/>
                Need at least 3 reviews to generate an AI summary for {professorName}.
            </div>
          )}
         {!isGenerated && !isLoading && !error && canSummarize && (
           <div className="text-center text-sm text-muted-foreground p-4 border border-dashed rounded-md bg-background/50">
                <Wand2 className="h-5 w-5 mx-auto mb-2 text-primary/70"/>
                Click "Generate Summary" to get an AI overview of the reviews below.
           </div>
         )}


        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-6 min-h-[100px] text-center bg-background/30 rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-primary">Analyzing reviews...</p>
            <p className="text-xs text-muted-foreground">This may take a moment.</p>
          </div>
        )}

        {/* Summary Display */}
        {summary && !isLoading && (
          <div className="prose prose-sm max-w-none dark:prose-invert text-foreground/90 whitespace-pre-wrap bg-background/70 p-4 rounded-md shadow-inner text-sm leading-relaxed">
           {summary}
          </div>
        )}


      </CardContent>
    </Card>
  );
}
