'use server';

import { ai } from '@/ai';
import {
  DomainSuggestionInputSchema,
  DomainSuggestionOutputSchema,
  type DomainSuggestionInput,
  type DomainSuggestionOutput,
} from '@/shared/schemas/domain-suggestion.schema.ts';

// The prompt definition is now internal to the Server Action file
// and is NOT exported.
const domainSuggestionPrompt = ai.definePrompt({
  name: 'domainSuggestionPrompt',
  input: { schema: DomainSuggestionInputSchema },
  output: { schema: DomainSuggestionOutputSchema },
  prompt: `You are an expert in branding and domain names. Based on the user's website purpose, generate a list of 5 creative and professional domain name suggestions.

The suggestions should be concise, memorable, and sound like they are likely to be available. Include a variety of top-level domains (TLDs) such as .com, .dev, .app, and .io.

Website Keywords: {{{keywords}}}
`,
});

/**
 * This is the ONLY export from this file.
 * It's an async function that acts as the Server Action.
 */
export async function suggestDomains(
  input: DomainSuggestionInput
): Promise<DomainSuggestionOutput> {
  // Input validation can be done here if needed, e.g. using Zod's .parse()
  // For this flow, the prompt already uses the schema, which provides validation.

  const { output } = await domainSuggestionPrompt(input);

  if (!output) {
    // This provides a graceful failure case if the AI model doesn't return the expected output.
    return { domains: [] };
  }

  // The return value is a plain, JSON-serializable object.
  return output;
}
