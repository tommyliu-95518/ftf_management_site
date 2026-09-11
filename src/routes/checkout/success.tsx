import { createFileRoute, Link } from "@tanstack/react-router";
import { getPlanById, type PaddlePlanId } from "@/lib/paddle";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => {
    const plan =
      search.plan === "pro_monthly" || search.plan === "pro_yearly"
        ? (search.plan as PaddlePlanId)
        : undefined;
    const method = search.method === "crypto" ? "crypto" : "card";
    return { plan, method };
  },
  head: () => ({
    meta: [
      { title: "Payment received — Visage.AI" },
      {
        name: "description",
        content: "Your Visage.AI Pro subscription is active. Download the desktop app to unlock Pro features.",
      },
    ],
  }),
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  const { plan: planId, method } = Route.useSearch();
  const plan = planId ? getPlanById(planId) : undefined;
  const isCrypto = method === "crypto";

  return (
    <div className="min-h-screen bg-background text-foreground font-display selection:bg-accent selection:text-black flex flex-col">
      <nav className="border-b border-border/50 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="size-8 bg-accent flex items-center justify-center font-mono font-bold text-black text-xs">
            V
          </div>
          <span className="font-mono tracking-tighter text-sm font-medium uppercase">
            Visage.AI
          </span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center size-16 border border-accent/40 bg-accent/10 mb-8">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="size-8 text-accent"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-[10px] font-mono text-accent uppercase tracking-[0.4em] mb-4">
            Payment received
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
            ACTIVATING <span className="text-accent italic">PRO</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-2">
            {plan
              ? `Your ${plan.name} plan (${plan.priceLabel}${plan.periodLabel}) is being activated.`
              : "Your Visage.AI Pro subscription is being activated."}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-10">
            {isCrypto
              ? "Crypto payments usually confirm after the network reaches enough confirmations. Sign in to the desktop app with the same email you used at checkout. Pro unlocks when NOWPayments marks the payment finished."
              : "Check your email for the receipt from Paddle. Sign in to the desktop app with the same email you used at checkout. Pro access will unlock after the Paddle webhook finishes processing."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#cta"
              className="px-8 py-4 bg-accent text-black font-mono font-bold uppercase tracking-tighter hover:translate-x-1 transition-transform cursor-pointer"
            >
              Download for Desktop
            </a>
            <Link
              to="/"
              className="px-8 py-4 border border-border font-mono font-bold uppercase tracking-tighter hover:bg-white/5 transition-colors"
            >
              Back to home
            </Link>
          </div>

          <p className="mt-10 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
            {isCrypto
              ? "Processed by NOWPayments · Bitcoin, Ethereum, Solana, Tron, BNB"
              : "Managed by Paddle · Cancel anytime from your receipt email"}
          </p>
        </div>
      </main>
    </div>
  );
}
