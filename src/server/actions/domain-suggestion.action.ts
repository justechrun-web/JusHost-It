'use server';
/**
 * @file This file defines the server action for suggesting domain names.
 * It is a server-only module and exports a single function, `suggestDomains`.
 */

import { ai } from '@/lib/genkit';
import {
  DomainSuggestionInputSchema,
  DomainSuggestionOutputSchema,
  type DomainSuggestionInput,
  type DomainSuggestionOutput,
} from '@/shared/schemas/domain-suggestion.schema';

/**
 * A Server Action that suggests domain names based on user-provided keywords.
 * This function is the sole export of this module and serves as an RPC endpoint.
 *
 * It validates input against a schema and ensures the output is a plain,
 * JSON-serializable object.
 *
 * @param input - The keywords to base suggestions on.
 * @returns A promise that resolves to an object containing a list of domain suggestions.
 */
export async function suggestDomains(
  input: DomainSuggestionInput
): Promise<DomainSuggestionOutput> {
  // Input is implicitly validated by the prompt's input schema.
  // For extra security, we can parse it here as well.
  const validatedInput = DomainSuggestionInputSchema.parse(input);

  // The prompt definition is now internal to the action file and is not exported.
  const domainSuggestionPrompt = ai.definePrompt({
    name: 'domainSuggestionPrompt',
    input: { schema: DomainSuggestionInputSchema },
    output: { schema: DomainSuggestionOutputSchema },
    prompt: `You are an expert in branding and domain names. Based on the user's website purpose, generate a list of 5 creative and professional domain name suggestions.

The suggestions should be concise, memorable, and sound like they are likely to be available. Include a variety of top-level domains (TLDs) such as .com, .dev, .app, and .io.

Website Keywords: {{{keywords}}}
`,
  });

  const { output } = await domainSuggestionPrompt(validatedInput);

  if (!output) {
    // Graceful failure case if the AI model doesn't return the expected output.
    return { domains: [] };
  }

  // The return value is a plain, JSON-serializable object.
  return output;
}
