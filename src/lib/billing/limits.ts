
export const PLAN_LIMITS = {
  free: {
    apiCalls: 100,
    aiTokens: 5_000,
    exports: 1,
    seats: 1,
  },
  starter: {
    apiCalls: 10_000,
    aiTokens: 200_000,
    exports: 50,
    seats: 5,
  },
  pro: {
    apiCalls: 100_000,
    aiTokens: 2_000_000,
    exports: 500,
    seats: 25,
  },
  business: {
    apiCalls: Infinity,
    aiTokens: Infinity,
    exports: Infinity,
    seats: Infinity,
  },
} as const
