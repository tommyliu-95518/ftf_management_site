import type { ReactNode } from "react";
import { usePaddle } from "@/hooks/use-paddle";
import type { PaddlePlanId } from "@/lib/paddle";
import { cn } from "@/lib/utils";

type CheckoutButtonProps = {
  planId: PaddlePlanId;
  accountEmail?: string;
  children: ReactNode;
  className?: string;
  variant?: "outline" | "solid";
};

export function CheckoutButton({
  planId,
  accountEmail,
  children,
  className,
  variant = "solid",
}: CheckoutButtonProps) {
  const { openCheckout, ready, isOpening, error } = usePaddle();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={!ready || isOpening}
        onClick={() => openCheckout(planId, accountEmail)}
        className={cn(
          "w-full text-center px-8 py-4 font-mono font-bold uppercase tracking-tighter transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait",
          variant === "solid" &&
            "bg-accent text-black hover:translate-x-1 transition-transform",
          variant === "outline" &&
            "border border-accent/40 text-accent hover:bg-accent hover:text-black",
          className,
        )}
      >
        {isOpening ? "Opening checkout…" : !ready ? "Loading…" : children}
      </button>
      {error ? (
        <p className="text-[10px] font-mono text-red-400 text-center">{error}</p>
      ) : null}
    </div>
  );
}
