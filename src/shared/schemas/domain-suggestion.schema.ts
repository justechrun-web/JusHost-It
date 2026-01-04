import { z } from 'zod';

export const DomainSuggestionInputSchema = z.object({
  keywords: z.string().describe('Keywords describing the purpose of the website.'),
});

export const DomainSuggestionOutputSchema = z.object({
  domains: z.array(z.string()).describe('A list of 5 creative and available-sounding domain names, including a mix of .com, .dev, and .io TLDs.'),
});

export type DomainSuggestionInput =
  z.infer<typeof DomainSuggestionInputSchema>;

export type DomainSuggestionOutput =
  z.infer<typeof DomainSuggestionOutputSchema>;
