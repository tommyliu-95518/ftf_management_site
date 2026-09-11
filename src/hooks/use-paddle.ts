import { useEffect, useRef, useState } from "react";
import {
  initializePaddle,
  type Paddle,
  type PaddleEventData,
} from "@paddle/paddle-js";
import { PADDLE_CONFIG, type PaddlePlanId, getPlanById } from "@/lib/paddle";

type CheckoutStatus = "idle" | "opening" | "error";

let paddleSingleton: Paddle | undefined;
let paddleInitPromise: Promise<Paddle | undefined> | undefined;

async function getPaddleInstance(): Promise<Paddle | undefined> {
  if (typeof window === "undefined") return undefined;
  if (!PADDLE_CONFIG.clientToken) return undefined;
  if (paddleSingleton) return paddleSingleton;
  if (!paddleInitPromise) {
    paddleInitPromise = initializePaddle({
      token: PADDLE_CONFIG.clientToken,
      environment: PADDLE_CONFIG.environment,
      eventCallback: (event: PaddleEventData) => {
        // Allow listeners registered after init to observe events
        window.dispatchEvent(
          new CustomEvent("paddle:event", { detail: event }),
        );
      },
    }).then((instance) => {
      paddleSingleton = instance;
      return instance;
    });
  }
  return paddleInitPromise;
}

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | undefined>(paddleSingleton);
  const [ready, setReady] = useState(Boolean(paddleSingleton));
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const openingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getPaddleInstance().then((instance) => {
      if (cancelled) return;
      setPaddle(instance);
      setReady(Boolean(instance));
      if (!instance) {
        setError("Unable to load Paddle checkout. Refresh and try again.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onEvent = (e: Event) => {
      const event = (e as CustomEvent<PaddleEventData>).detail;
      if (event.name === "checkout.completed") {
        setStatus("idle");
        openingRef.current = false;
      }
      if (event.name === "checkout.closed") {
        setStatus("idle");
        openingRef.current = false;
      }
      if (event.name === "checkout.error") {
        setStatus("error");
        setError("Checkout failed. Please try again.");
        openingRef.current = false;
      }
    };
    window.addEventListener("paddle:event", onEvent);
    return () => window.removeEventListener("paddle:event", onEvent);
  }, []);

  async function openCheckout(planId: PaddlePlanId, accountEmail?: string) {
    if (openingRef.current) return;

    const email = (accountEmail || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setError("Enter the same email you use to sign in to the desktop app.");
      return;
    }

    openingRef.current = true;
    setError(null);
    setStatus("opening");

    try {
      const instance = paddle ?? (await getPaddleInstance());
      if (!instance) {
        setStatus("error");
        setError("Paddle is not ready yet. Please wait a moment.");
        openingRef.current = false;
        return;
      }

      const plan = getPlanById(planId);
      if (!plan.priceId) {
        setStatus("error");
        setError("Payment configuration is incomplete. Please contact support.");
        openingRef.current = false;
        return;
      }
      const successUrl = new URL(
        PADDLE_CONFIG.successUrl,
        window.location.origin,
      );
      successUrl.searchParams.set("plan", planId);

      instance.Checkout.open({
        items: [{ priceId: plan.priceId, quantity: 1 }],
        customer: { email },
        customData: {
          planId,
          accountEmail: email,
        },
        settings: {
          displayMode: "overlay",
          theme: "dark",
          successUrl: successUrl.toString(),
          allowLogout: true,
        },
      });
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Could not open checkout.",
      );
      openingRef.current = false;
    }
  }

  return {
    paddle,
    ready,
    status,
    error,
    openCheckout,
    isOpening: status === "opening",
  };
}
