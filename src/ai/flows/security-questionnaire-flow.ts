
'use server';

/**
 * @fileOverview A Genkit flow to answer security questionnaire questions.
 * This flow is designed to be safe for enterprise use by strictly limiting its knowledge
 * base to verified, internal security documents.
 *
 * It exports:
 * - answerSecurityQuestion: The main server action callable from the UI.
 * - SecurityQuestionInput: The Zod schema for the flow's input.
 * - SecurityQuestionOutput: The Zod schema for the flow's output.
 */

import { ai } from '@/lib/genkit';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Define the Zod schema for the flow's input.
export const SecurityQuestionInputSchema = z.object({
  question: z.string().describe('The security or compliance question to be answered.'),
});
export type SecurityQuestionInput = z.infer<typeof SecurityQuestionInputSchema>;

// Define the Zod schema for the flow's structured output.
export const SecurityQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based *only* on the provided context. If the answer is not in the context, this field must state that the question cannot be answered.'),
});
export type SecurityQuestionOutput = z.infer<typeof SecurityQuestionOutputSchema>;

/**
 * Loads the content of the security documents.
 * In a real application, this might be fetched from a more dynamic source,
 * but reading from the file system is robust for documents that change with the codebase.
 */
async function getSecurityContext(): Promise<string> {
    try {
        const securityQuestionnairePath = join(process.cwd(), 'docs', 'security-questionnaire.md');
        const techAppendixPath = join(process.cwd(), 'docs', 'technical-appendix.md');

        const [questionnaire, appendix] = await Promise.all([
            readFile(securityQuestionnairePath, 'utf-8'),
            readFile(techAppendixPath, 'utf-8')
        ]);

        return `
# Security Questionnaire Content:
${questionnaire}

# Technical Appendix Content:
${appendix}
`;
    } catch (error) {
        console.error("Failed to load security context documents:", error);
        // If the context can't be loaded, we return an empty string to ensure the AI knows it has no information.
        return "";
    }
}


/**
 * The main server action function that answers a security question.
 * @param input - An object containing the security question.
 * @returns A promise that resolves to the AI-generated answer.
 */
export async function answerSecurityQuestion(input: SecurityQuestionInput): Promise<SecurityQuestionOutput> {
  return securityQuestionnaireFlow(input);
}


// Define the Genkit flow. This is the core AI logic.
const securityQuestionnaireFlow = ai.defineFlow(
  {
    name: 'securityQuestionnaireFlow',
    inputSchema: SecurityQuestionInputSchema,
    outputSchema: SecurityQuestionOutputSchema,
  },
  async (input) => {
    // Load the trusted security context on each invocation.
    const securityContext = await getSecurityContext();

    const securityPrompt = ai.definePrompt({
        name: 'securityQuestionPrompt',
        system: `You are a security and compliance analyst for a company called JusHostIt. Your sole purpose is to answer questions based *exclusively* on the provided context documents.

CRITICAL RULES:
1.  Your knowledge is strictly limited to the information within the 'Security Questionnaire Content' and 'Technical Appendix Content' sections below.
2.  DO NOT use any external knowledge, training data, or general information.
3.  If the answer to a question cannot be found in the provided context, you MUST respond with the exact phrase: "This question cannot be answered based on the provided information." Do not apologize or add any other text.
4.  Answer concisely and directly, quoting from the context where possible.
5.  Do not speculate, infer, or make assumptions.
`,
        output: { schema: SecurityQuestionOutputSchema },
        prompt: `
CONTEXT DOCUMENTS:
---
${securityContext}
---

Based *only* on the context above, answer the following question.

Question: {{{question}}}
`,
    });

    const { output } = await securityPrompt(input);

    if (!output) {
      throw new Error('The AI model failed to generate an answer.');
    }

    return output;
  }
);
