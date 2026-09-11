import type { PaddlePlanId } from "@/lib/paddle";
import {
  CRYPTO_CHAINS,
  CRYPTO_PLAN_PRICES_USD,
  isCryptoChainId,
  type CryptoChainId,
} from "@/lib/nowpayments";

type Json = Record<string, unknown>;

export type NowPaymentsEnv = {
  apiKey: string;
  ipnSecret: string;
  publicKey?: string;
  apiUrl: string;
  publicOrigin: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
};

const encoder = new TextEncoder();

function asRecord(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

async function hmacSha512Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Official NOWPayments IPN: JSON.stringify(body, Object.keys(body).sort()) then HMAC-SHA512. */
export async function verifyNowPaymentsSignature(
  payload: Json,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader || !secret) return false;
  const signed = JSON.stringify(payload, Object.keys(payload).sort());
  const expected = await hmacSha512Hex(secret, signed);
  return timingSafeEqual(expected.toLowerCase(), signatureHeader.trim().toLowerCase());
}

export function readNowPaymentsEnv(
  source: Record<string, string | undefined>,
): NowPaymentsEnv {
  const sandbox =
    (source.NOWPAYMENTS_SANDBOX || "").toLowerCase() === "true" ||
    (source.NOWPAYMENTS_ENVIRONMENT || "").toLowerCase() === "sandbox";
  return {
    apiKey: source.NOWPAYMENTS_API_KEY || "",
    ipnSecret: source.NOWPAYMENTS_IPN_SECRET || "",
    publicKey: source.NOWPAYMENTS_PUBLIC_KEY,
    apiUrl:
      source.NOWPAYMENTS_API_URL ||
      (sandbox
        ? "https://api-sandbox.nowpayments.io/v1"
        : "https://api.nowpayments.io/v1"),
    publicOrigin: (source.PUBLIC_SITE_URL || source.NOWPAYMENTS_PUBLIC_ORIGIN || "").replace(/\/$/, ""),
    supabaseUrl: source.SUPABASE_URL || "",
    supabaseServiceRoleKey:
      source.SUPABASE_SERVICE_ROLE_KEY || source.RECOVERY_SERVICE_ROLE_KEY || "",
  };
}

function planFromId(planId: PaddlePlanId): "pro-1" | "pro-2" {
  return planId === "pro_yearly" ? "pro-2" : "pro-1";
}

function expiresAtForPlan(planId: PaddlePlanId): string {
  const days = planId === "pro_yearly" ? 366 : 31;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function supabaseRest(
  env: NowPaymentsEnv,
  method: string,
  path: string,
  body?: Json | Json[],
  query?: string,
): Promise<unknown> {
  const url = `${env.supabaseUrl.replace(/\/$/, "")}${path}${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method,
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "return=representation",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase ${method} ${path} failed (${response.status}): ${text}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function supabaseRpc(env: NowPaymentsEnv, fnName: string, body: Json): Promise<unknown> {
  return supabaseRest(env, "POST", `/rest/v1/rpc/${fnName}`, body);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function createNowPaymentsInvoice(input: {
  env: NowPaymentsEnv;
  planId: PaddlePlanId;
  email: string;
  chainId: string;
}): Promise<{ invoiceUrl: string; orderId: string }> {
  const email = input.email.trim().toLowerCase();
  if (!isEmail(email)) {
    throw new Error("Enter the same email you use to sign in to the desktop app.");
  }
  if (!isCryptoChainId(input.chainId)) {
    throw new Error("Choose Bitcoin, Ethereum, Solana, Tron, or BNB.");
  }
  if (
    !input.env.apiKey ||
    !input.env.supabaseUrl ||
    !input.env.supabaseServiceRoleKey ||
    !input.env.publicOrigin
  ) {
    throw new Error("Crypto payments are not configured on the server.");
  }

  const chain = CRYPTO_CHAINS[input.chainId as CryptoChainId];
  const amount = CRYPTO_PLAN_PRICES_USD[input.planId];
  const orderId = `np_${crypto.randomUUID()}`;
  const origin = input.env.publicOrigin;
  const successUrl = new URL("/checkout/success", `${origin}/`);
  successUrl.searchParams.set("plan", input.planId);
  successUrl.searchParams.set("method", "crypto");

  const payload = {
    price_amount: amount,
    price_currency: "usd",
    pay_currency: chain.payCurrency,
    order_id: orderId,
    order_description: `Visage.AI ${input.planId === "pro_yearly" ? "Pro Yearly" : "Pro Monthly"} for ${email}`,
    ipn_callback_url: `${origin}/api/nowpayments/ipn`,
    success_url: successUrl.toString(),
    cancel_url: `${origin}/#pricing`,
    is_fixed_rate: true,
  };

  const response = await fetch(`${input.env.apiUrl.replace(/\/$/, "")}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": input.env.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const raw = await response.text();
  let invoice: Json = {};
  try {
    invoice = asRecord(JSON.parse(raw));
  } catch {
    invoice = {};
  }
  if (!response.ok) {
    throw new Error(
      asString(invoice.message) ||
        asString(invoice.error) ||
        `NOWPayments invoice failed (${response.status}).`,
    );
  }

  const invoiceUrl = asString(invoice.invoice_url);
  const invoiceId = asString(invoice.id);
  if (!invoiceUrl) {
    throw new Error("NOWPayments did not return a checkout URL.");
  }

  await supabaseRest(input.env, "POST", "/rest/v1/nowpayments_orders", {
    order_id: orderId,
    email,
    plan: planFromId(input.planId),
    plan_id: input.planId,
    chain: chain.id,
    pay_currency: chain.payCurrency,
    invoice_id: invoiceId || null,
    invoice_url: invoiceUrl,
    price_amount: amount,
    payment_status: "waiting",
  });

  return { invoiceUrl, orderId };
}

const PAID_STATUSES = new Set(["finished"]);

export async function processNowPaymentsIpn(
  rawBody: string,
  signatureHeader: string | null,
  env: NowPaymentsEnv,
): Promise<{ ok: boolean; status: number; body: Json }> {
  if (!env.ipnSecret || !env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return { ok: false, status: 500, body: { error: "NOWPayments IPN is not configured." } };
  }

  let payload: Json;
  try {
    payload = asRecord(JSON.parse(rawBody));
  } catch {
    return { ok: false, status: 400, body: { error: "Invalid JSON" } };
  }

  const valid = await verifyNowPaymentsSignature(payload, signatureHeader, env.ipnSecret);
  if (!valid) {
    return { ok: false, status: 401, body: { error: "Invalid NOWPayments signature" } };
  }

  const paymentId = asString(payload.payment_id);
  const orderId = asString(payload.order_id);
  const invoiceId = asString(payload.invoice_id);
  const paymentStatus = asString(payload.payment_status).toLowerCase();
  const eventKey = `${paymentId || orderId || invoiceId}:${paymentStatus}`;

  const rows = (await supabaseRest(
    env,
    "GET",
    "/rest/v1/nowpayments_orders",
    undefined,
    orderId
      ? `order_id=eq.${encodeURIComponent(orderId)}&select=*&limit=1`
      : `invoice_id=eq.${encodeURIComponent(invoiceId)}&select=*&limit=1`,
  )) as Json[] | null;
  const order = Array.isArray(rows) ? rows[0] : undefined;
  if (!order) {
    return { ok: false, status: 422, body: { received: true, ignored: "unknown_order" } };
  }

  await supabaseRest(
    env,
    "PATCH",
    "/rest/v1/nowpayments_orders",
    {
      payment_id: paymentId || asString(order.payment_id) || null,
      invoice_id: invoiceId || asString(order.invoice_id) || null,
      payment_status: paymentStatus || asString(order.payment_status),
      pay_currency: asString(payload.pay_currency) || asString(order.pay_currency),
      updated_at: new Date().toISOString(),
    },
    orderId
      ? `order_id=eq.${encodeURIComponent(orderId)}`
      : `id=eq.${encodeURIComponent(asString(order.id))}`,
  );

  if (!PAID_STATUSES.has(paymentStatus)) {
    const claimed = await supabaseRpc(env, "claim_nowpayments_ipn_event", {
      p_event_id: eventKey,
      p_payment_status: paymentStatus,
    });
    if (claimed === false) {
      return { ok: true, status: 200, body: { received: true, duplicate: true } };
    }
    return { ok: true, status: 200, body: { received: true, paymentStatus } };
  }

  const expected = Number(order.price_amount);
  const paidFiat = Number(payload.price_amount ?? expected);
  if (Number.isFinite(expected) && Number.isFinite(paidFiat) && paidFiat + 0.01 < expected * 0.95) {
    await supabaseRpc(env, "claim_nowpayments_ipn_event", {
      p_event_id: eventKey,
      p_payment_status: paymentStatus,
    });
    return {
      ok: true,
      status: 200,
      body: { received: true, ignored: "underpaid", expected, paidFiat },
    };
  }

  const planId = (asString(order.plan_id) === "pro_yearly" ? "pro_yearly" : "pro_monthly") as PaddlePlanId;
  const result = await supabaseRpc(env, "apply_paddle_entitlement", {
    p_email: asString(order.email),
    p_plan: asString(order.plan) || planFromId(planId),
    p_status: "active",
    p_expires_at: expiresAtForPlan(planId),
    p_customer_id: null,
    p_subscription_id: null,
    p_transaction_id: paymentId || orderId,
  });

  const claimed = await supabaseRpc(env, "claim_nowpayments_ipn_event", {
    p_event_id: eventKey,
    p_payment_status: paymentStatus,
  });
  if (claimed === false) {
    return { ok: true, status: 200, body: { received: true, duplicate: true } };
  }

  return { ok: true, status: 200, body: { received: true, paymentStatus, result } };
}
