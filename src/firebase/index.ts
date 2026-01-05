'use client';

// This file is the "entry point" for all client-side Firebase functionality.
// It should only export modules and functions that are safe to run in a browser environment.

// Do NOT export server-only modules from this file (e.g., from './admin').

export * from './config';
export * from './provider';
export * from './client-provider';
export * from './auth/use-auth-gate';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
