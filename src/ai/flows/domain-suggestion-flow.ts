'use server';
/**
 * @fileOverview A domain name suggestion AI agent.
 */

import { ai } from '@/ai';
import {
  DomainSuggestionInputSchema,
  DomainSuggestionOutputSchema,
  type DomainSuggestionInput,
  type DomainSuggestionOutput,
} from './domain-suggestion-schema';

const prompt = ai.definePrompt(
  {
    name: 'domainSuggestionPrompt',
    input: { schema: DomainSuggestionInputSchema },
    output: { schema: DomainSuggestionOutputSchema },
    prompt: `You are an expert in branding and domain names. Based on the user's website purpose, generate a list of 5 creative and professional domain name suggestions.

The suggestions should be concise, memorable, and sound like they are likely to be available. Include a variety of top-level domains (TLDs) such as .com, .dev, .app, and .io.

Website Keywords: {{{keywords}}}
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

export async function suggestDomains(
  input: DomainSuggestionInput
): Promise<DomainSuggestionOutput> {
  return suggestDomainsFlow(input);
}
