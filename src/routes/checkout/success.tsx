import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { getPlanById, type PaddlePlanId } from "@/lib/paddle";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => {
    const plan =
      search.plan === "pro_monthly" || search.plan === "pro_yearly"
        ? (search.plan as PaddlePlanId)
        : undefined;
    const method = search.method === "crypto" ? "crypto" : "card";
    const orderId =
      typeof search.orderId === "string"
        ? search.orderId
        : typeof search.NP_id === "string"
          ? search.NP_id
          : undefined;
    return { plan, method, orderId };
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

type ActivateState = "idle" | "pending" | "active" | "error";

async function confirmPayment(payload: { orderId?: string; email?: string }) {
  const response = await fetch("/api/nowpayments/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as {
    pending?: boolean;
    result?: unknown;
    error?: string;
    paymentStatus?: string;
  };
  return { ok: response.ok || response.status === 202, status: response.status, body };
}

function CheckoutSuccess() {
  const { plan: planId, method, orderId } = Route.useSearch();
  const plan = planId ? getPlanById(planId) : undefined;
  const isCrypto = method === "crypto";
  const [state, setState] = useState<ActivateState>(isCrypto ? "pending" : "idle");
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isCrypto || !orderId) return;
    let cancelled = false;
    let attempts = 0;

    async function tick() {
      attempts += 1;
      try {
        const result = await confirmPayment({ orderId });
        if (cancelled) return;
        if (result.status === 200 && !result.body.pending) {
          setState("active");
          setMessage("Pro is now active on your account. Sign in to the desktop app with the same email.");
          return;
        }
        if (result.body.error && result.status >= 400 && result.status !== 404) {
          setState("error");
          setMessage(result.body.error);
          return;
        }
        setState("pending");
        setMessage(
          result.body.paymentStatus
            ? `NOWPayments status: ${result.body.paymentStatus}. Waiting for confirmation…`
            : "Waiting for the crypto payment to confirm…",
        );
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Could not activate Pro yet. Retry with the email you used at checkout.");
        }
        return;
      }
      if (!cancelled && attempts < 24) {
        window.setTimeout(tick, 5000);
      }
    }

    void tick();
    return () => {
      cancelled = true;
    };
  }, [isCrypto, orderId]);

  async function activateByEmail(event: FormEvent) {
    event.preventDefault();
    setState("pending");
    setMessage(null);
    try {
      const result = await confirmPayment({ email, orderId });
      if (result.status === 200 && !result.body.pending) {
        setState("active");
        setMessage("Pro is now active on your account. Sign in to the desktop app with the same email.");
        return;
      }
      setState(result.body.pending ? "pending" : "error");
      setMessage(result.body.error || "Payment is not marked paid yet. Wait a moment and retry.");
    } catch {
      setState("error");
      setMessage("Could not activate Pro. Check the email and try again.");
    }
  }

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
            {state === "active" ? "Account upgraded" : "Payment received"}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
            {state === "active" ? (
              <>
                YOU&apos;RE ON <span className="text-accent italic">PRO</span>
              </>
            ) : (
              <>
                ACTIVATING <span className="text-accent italic">PRO</span>
              </>
            )}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-2">
            {plan
              ? `Your ${plan.name} plan (${plan.priceLabel}${plan.periodLabel}) ${state === "active" ? "is active." : "is being activated."}`
              : state === "active"
                ? "Your Visage.AI Pro subscription is active."
                : "Your Visage.AI Pro subscription is being activated."}
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {message ||
              (isCrypto
                ? "We write Pro onto your Supabase profiles as soon as NOWPayments confirms the payment. Use the same email as the desktop app."
                : "Check your email for the receipt from Paddle. Sign in to the desktop app with the same email you used at checkout.")}
          </p>

          {isCrypto && state !== "active" ? (
            <form onSubmit={activateByEmail} className="mb-8 space-y-3 text-left">
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Desktop account email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  className="mt-2 w-full bg-white/5 border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
                />
              </label>
              <button
                type="submit"
                className="w-full px-8 py-3 border border-accent/40 text-accent font-mono font-bold uppercase tracking-tighter hover:bg-accent hover:text-black transition-colors cursor-pointer"
              >
                Activate Pro now
              </button>
            </form>
          ) : null}

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
