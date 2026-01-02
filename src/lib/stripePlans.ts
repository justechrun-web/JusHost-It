
export const PLAN_BY_PRICE_ID: Record<string, "starter" | "pro" | "business" | "free"> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!]: "starter",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!]: "pro",
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS!]: "business",
};
