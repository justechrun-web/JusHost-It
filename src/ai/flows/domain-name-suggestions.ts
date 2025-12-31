'use server';

/**
 * @fileOverview This file implements the domain name suggestion flow.
 *
 * It uses Genkit to suggest available domain names based on user input
 * or desired site purpose.
 *
 * @interface DomainNameSuggestionsInput - The input type for the domainNameSuggestions function.
 * @interface DomainNameSuggestionsOutput - The output type for the domainNameSuggestions function.
 * @function domainNameSuggestions - The main function that triggers the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DomainNameSuggestionsInputSchema = z.object({
  sitePurpose: z
    .string()
    .describe(
      'A description of the site purpose or keywords related to the desired domain name.'
    ),
});
export type DomainNameSuggestionsInput = z.infer<
  typeof DomainNameSuggestionsInputSchema
>;

const DomainNameSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested domain names.'),
});
export type DomainNameSuggestionsOutput = z.infer<
  typeof DomainNameSuggestionsOutputSchema
>;

export async function domainNameSuggestions(
  input: DomainNameSuggestionsInput
): Promise<DomainNameSuggestionsOutput> {
  return domainNameSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'domainNameSuggestionsPrompt',
  input: {schema: DomainNameSuggestionsInputSchema},
  output: {schema: DomainNameSuggestionsOutputSchema},
  prompt: `You are a domain name suggestion expert. Given the site purpose, suggest 5 available domain names.

Site Purpose: {{{sitePurpose}}}

Output the suggestions as a JSON array of strings.
`,
});

const domainNameSuggestionsFlow = ai.defineFlow(
  {
    name: 'domainNameSuggestionsFlow',
    inputSchema: DomainNameSuggestionsInputSchema,
    outputSchema: DomainNameSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
