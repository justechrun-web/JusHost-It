'use server';

/**
 * @file This file initializes and exports a singleton Genkit `ai` instance.
 * It is a server-only module.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the Genkit AI instance with the Google AI plugin.
// This `ai` object is used throughout the server-side of the application
// to define prompts, flows, and interact with generative models.
export const ai = genkit({
  plugins: [
    googleAI({
      // Use the API key from environment variables for server-side authentication.
      // This is crucial for environments like App Hosting where OAuth tokens are not available.
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
