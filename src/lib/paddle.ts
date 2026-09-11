export type PaddlePlanId = "pro_monthly" | "pro_yearly";

export type PaddlePlan = {
  id: PaddlePlanId;
  /** Alias from your Paddle catalog notes */
  alias: "pro_1" | "pro_2";
  name: string;
  priceLabel: string;
  periodLabel: string;
  priceId: string;
  badge?: string;
  highlight?: boolean;
};

const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;

const environment =
  (import.meta.env.VITE_PADDLE_ENVIRONMENT as "sandbox" | "production" | undefined) ??
  (clientToken.startsWith("test_") ? "sandbox" : "production");

/** pro_1 — Pro Monthly */
const priceProMonthly = import.meta.env.VITE_PADDLE_PRICE_PRO_MONTHLY;

/** pro_2 — Pro Yearly */
const priceProYearly = import.meta.env.VITE_PADDLE_PRICE_PRO_YEARLY;

export const PADDLE_CONFIG = {
  clientToken,
  environment,
  successUrl: "/checkout/success",
} as const;

export const PADDLE_PLANS: Record<PaddlePlanId, PaddlePlan> = {
  pro_monthly: {
    id: "pro_monthly",
    alias: "pro_1",
    name: "Pro Monthly",
    priceLabel: "$8.99",
    periodLabel: "/ month",
    priceId: priceProMonthly,
    badge: "50% OFF",
  },
  pro_yearly: {
    id: "pro_yearly",
    alias: "pro_2",
    name: "Pro Yearly",
    priceLabel: "$49.9",
    periodLabel: "/ year",
    priceId: priceProYearly,
    badge: "75% OFF",
    highlight: true,
  },
};

export function getPlanById(planId: PaddlePlanId): PaddlePlan {
  return PADDLE_PLANS[planId];
}

export function getPlanByPriceId(priceId: string): PaddlePlan | undefined {
  return Object.values(PADDLE_PLANS).find((plan) => plan.priceId === priceId);
}
