'use server';
/**
 * @fileOverview A domain name suggestion AI agent.
 *
 * - suggestDomains - A function that handles the domain suggestion process.
 * - DomainSuggestionInput - The input type for the suggestDomains function.
 * - DomainSuggestionOutput - The return type for the suggestDomains function.
 */

import { ai } from '@/ai';
import { z } from 'genkit/zod';

export const DomainSuggestionInputSchema = z.object({
  purpose: z.string().describe('The purpose of the website.'),
});
export type DomainSuggestionInput = z.infer<typeof DomainSuggestionInputSchema>;

export const DomainSuggestionOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 5 creative and available-sounding domain names, including a mix of .com, .dev, and .io TLDs.'),
});
export type DomainSuggestionOutput = z.infer<typeof DomainSuggestionOutputSchema>;

export async function suggestDomains(
  input: DomainSuggestionInput
): Promise<DomainSuggestionOutput> {
  return suggestDomainsFlow(input);
}

const prompt = ai.definePrompt(
  {
    name: 'domainSuggestionPrompt',
    input: { schema: DomainSuggestionInputSchema },
    output: { schema: DomainSuggestionOutputSchema },
    prompt: `You are an expert in branding and domain names. Based on the user's website purpose, generate a list of 5 creative and professional domain name suggestions.

The suggestions should be concise, memorable, and sound like they are likely to be available. Include a variety of top-level domains (TLDs) such as .com, .dev, .app, and .io.

Website Purpose: {{{purpose}}}
`,
  }
);

const suggestDomainsFlow = ai.defineFlow(
  {
    name: 'suggestDomainsFlow',
    inputSchema: DomainSuggestionInputSchema,
    outputSchema: DomainSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
