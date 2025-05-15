// Summarizes professor review comments into key feedback points.
'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeProfessorReviewsInputSchema = z.object({
  reviews: z.array(z.string()).describe('An array of professor review comments (strings).'),
  professorName: z.string().describe('The name of the professor.'),
});
export type SummarizeProfessorReviewsInput = z.infer<
  typeof SummarizeProfessorReviewsInputSchema
>;

const SummarizeProfessorReviewsOutputSchema = z.object({
  summary: z.string().describe('A summary of the professor reviews.'),
});
export type SummarizeProfessorReviewsOutput = z.infer<
  typeof SummarizeProfessorReviewsOutputSchema
>;

export async function summarizeProfessorReviews(
  input: SummarizeProfessorReviewsInput
): Promise<SummarizeProfessorReviewsOutput> {
  return summarizeProfessorReviewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProfessorReviewsPrompt',
  input: {
    schema: z.object({
      reviews:
        z.array(z.string())
        .describe('An array of professor review comments (strings).'), // Updated description
      professorName: z.string().describe('The name of the professor.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the professor reviews.'),
    }),
  },
  prompt: `You are an AI assistant helping students understand professor reviews. Summarize the following review comments for Professor {{professorName}} into key positive and negative feedback points:\n\nReview Comments:\n{{#each reviews}}- {{{this}}}\n{{/each}}\n\nSummary:`, // Adjusted prompt slightly
});

const summarizeProfessorReviewsFlow = ai.defineFlow<
  typeof SummarizeProfessorReviewsInputSchema,
  typeof SummarizeProfessorReviewsOutputSchema
>(
  {
    name: 'summarizeProfessorReviewsFlow',
    inputSchema: SummarizeProfessorReviewsInputSchema,
    outputSchema: SummarizeProfessorReviewsOutputSchema,
  },
  async input => {
    // Basic check for empty reviews input, though the caller should ideally handle this
    if (!input.reviews || input.reviews.length === 0) {
      return { summary: "No review comments provided to summarize." };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
