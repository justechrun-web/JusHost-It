/**
 * A mapping of usage types to their cost per unit.
 * This provides a single source of truth for pricing calculations.
 * Prices are in dollars per unit.
 */
export const COST_PER_UNIT = {
  // $0.002 per 1000 calls
  apiCalls: 0.002 / 1000,
  // $0.01 per 1000 tokens
  aiTokens: 0.01 / 1000,
  // $0.10 per export
  exports: 0.10,
} as const;

export type UsageKey = keyof typeof COST_PER_UNIT;

/**
 * Calculates the cost for a given amount of usage.
 *
 * @param key - The type of usage (e.g., 'apiCalls').
 * @param amount - The amount of usage.
 * @returns The calculated cost in cents, rounded up to the nearest cent.
 */
export function calculateCostInCents(key: UsageKey, amount: number): number {
  const cost = amount * COST_PER_UNIT[key];
  return Math.ceil(cost * 100);
}
