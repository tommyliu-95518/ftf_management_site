import { useState } from "react";
import type { PaddlePlanId } from "@/lib/paddle";
import { CRYPTO_CHAIN_LIST, SANDBOX_CRYPTO_CHAIN_LIST } from "@/lib/nowpayments";
import { cn } from "@/lib/utils";

type CryptoCheckoutButtonProps = {
  planId: PaddlePlanId;
  accountEmail?: string;
};

export function CryptoCheckoutButton({
  planId,
  accountEmail,
}: CryptoCheckoutButtonProps) {
  const sandbox = import.meta.env.VITE_NOWPAYMENTS_SANDBOX === "true";
  const chains = sandbox ? SANDBOX_CRYPTO_CHAIN_LIST : CRYPTO_CHAIN_LIST;
  const [open, setOpen] = useState(false);
  const [pendingChain, setPendingChain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function payWith(chainId: string) {
    const email = (accountEmail || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter the same email you use to sign in to the desktop app.");
      return;
    }
    setError(null);
    setPendingChain(chainId);
    try {
      const response = await fetch("/api/nowpayments/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, email, chainId }),
      });
      const payload = (await response.json()) as {
        invoiceUrl?: string;
        error?: string;
      };
      if (!response.ok || !payload.invoiceUrl) {
        throw new Error(payload.error || "Could not start crypto checkout.");
      }
      window.location.href = payload.invoiceUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start crypto checkout.");
      setPendingChain(null);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full text-center px-8 py-3 border border-border font-mono font-bold uppercase tracking-tighter text-xs hover:bg-white/5 transition-colors cursor-pointer"
      >
        {open ? "Hide crypto options" : "Pay with crypto"}
      </button>
      {open ? (
        <div className="grid grid-cols-2 gap-2">
          {chains.map((chain) => (
            <button
              key={chain.id}
              type="button"
              disabled={Boolean(pendingChain)}
              onClick={() => payWith(chain.id)}
              className={cn(
                "px-3 py-2 border border-border text-[10px] font-mono uppercase tracking-widest hover:border-accent hover:text-accent transition-colors cursor-pointer disabled:opacity-50",
                pendingChain === chain.id && "border-accent text-accent",
              )}
            >
              {pendingChain === chain.id ? "Opening…" : `${chain.name} · ${chain.ticker}`}
            </button>
          ))}
        </div>
      ) : null}
      {error ? (
        <p className="text-[10px] font-mono text-red-400 text-center">{error}</p>
      ) : null}
    </div>
  );
}
