
export const PLAN_LIMITS = {
  free: {
    apiCalls: 100,
    aiTokens: 5_000,
    exports: 1,
  },
  starter: {
    apiCalls: 5_000,
    aiTokens: 100_000,
    exports: 20,
  },
  pro: {
    apiCalls: 50_000,
    aiTokens: 1_000_000,
    exports: 200,
  },
  business: {
    apiCalls: Infinity,
    aiTokens: Infinity,
    exports: Infinity,
  },
} as const
