
'use server';

/**
 * @file This file defines the server-side Genkit flow for generating a tailored enterprise sales pitch.
 * It uses a sophisticated system prompt to guide the AI model (Gemini) to produce conservative,
 * audit-ready content suitable for CFOs, VPs of Engineering, and security teams.
 *
 * It exports:
 * - generateEnterprisePitch: The main server action to be called from the UI.
 * - EnterprisePitchInput: The Zod schema for the flow's input.
 * - EnterprisePitchOutput: The Zod schema for the flow's output.
 */

import { ai } from '@/lib/genkit';
import { z } from 'zod';

// Define the system prompt as a constant. This contains the core instructions for the AI.
const GEMINI_SYSTEM_PROMPT = `You are an expert enterprise sales consultant for "JusHostIt", a platform that provides Spend Governance for Usage-Based Products.

Your audience is sophisticated enterprise buyers: CFOs, VPs of Engineering, and Heads of Security. Your tone must be conservative, professional, and audit-ready.

**Your Core Task:**
Based on the user-provided customer context, generate a concise, tailored pitch. Focus exclusively on the three pillars of Spend Governance:

1.  **Predictability:** Forecasting, budget simulations, cost optimization insights.
2.  **Prevention:** Hard caps (daily/monthly/feature), role-based approval policies, and automated, graceful degradation (read-only mode) on breach.
3.  **Proof:** Immutable audit trails for all billing and governance events (SOC2-ready), exportable finance reports, and a customer-facing Trust Center.

**CRITICAL RULES:**
- **DO NOT** make claims you cannot verify from the pillars above.
- **DO NOT** use marketing hype, jargon, or exclamation points.
- **DO NOT** invent features.
- If the user's request is vague or unrelated, you **MUST** state: "I can only provide a pitch based on your company's spend governance needs. Please describe your company's size, industry, and primary challenges with usage-based costs."
- Frame everything in terms of risk reduction, financial control, and compliance.
`;

// Define the Zod schema for the flow's input.
export const EnterprisePitchInputSchema = z.object({
  customerContext: z.string().describe('A description of the potential customer, their industry, size, and challenges.'),
});
export type EnterprisePitchInput = z.infer<typeof EnterprisePitchInputSchema>;

// Define the Zod schema for the flow's structured output.
export const EnterprisePitchOutputSchema = z.object({
  pitch: z.string().describe('The tailored, conservative, and audit-ready sales pitch focusing on governance, predictability, and proof.'),
});
export type EnterprisePitchOutput = z.infer<typeof EnterprisePitchOutputSchema>;


/**
 * The main server action function that generates an enterprise sales pitch.
 * It wraps the Genkit flow and provides a clean, callable interface for the UI.
 *
 * @param input - An object containing the customer context.
 * @returns A promise that resolves to the AI-generated pitch.
 */
export async function generateEnterprisePitch(input: EnterprisePitchInput): Promise<EnterprisePitchOutput> {
  // Input validation happens implicitly through the flow's schema, but can be done explicitly too.
  EnterprisePitchInputSchema.parse(input);
  return enterprisePitchFlow(input);
}


// Define the Genkit flow. This is the core AI logic.
const enterprisePitchFlow = ai.defineFlow(
  {
    name: 'enterprisePitchFlow',
    inputSchema: EnterprisePitchInputSchema,
    outputSchema: EnterprisePitchOutputSchema,
  },
  async (input) => {
    // Define the prompt to be used, including the powerful system prompt.
    const enterprisePitchPrompt = ai.definePrompt({
        name: 'enterprisePitchPrompt',
        system: GEMINI_SYSTEM_PROMPT,
        output: { schema: EnterprisePitchOutputSchema },
        prompt: `Customer Context: {{{customerContext}}}`,
    });

    // Execute the prompt with the validated input.
    const { output } = await enterprisePitchPrompt(input);

    // Ensure we have a valid output, otherwise throw an error.
    if (!output) {
      throw new Error('The AI model failed to generate a pitch.');
    }

    return output;
  }
);
