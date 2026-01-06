export const PLAN_BY_PRICE_ID: Record<string, "starter" | "pro" | "business" | "free"> = {
  [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
  [process.env.STRIPE_TEAM_PRICE_ID!]: "business",
};
