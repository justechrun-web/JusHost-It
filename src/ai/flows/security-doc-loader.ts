
'use server';
import 'server-only';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Loads the content of the security documents.
 * This is a server-only function that uses Node.js APIs and is isolated
 * to prevent being bundled on the client.
 */
export async function getSecurityContext(): Promise<string> {
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
