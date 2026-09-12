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
  ipnUrl: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
};

const encoder = new TextEncoder();

/** NOWPayments treats these as paid enough to grant digital access. */
const PAID_STATUSES = new Set(["finished", "confirmed", "sending"]);

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

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!value || typeof value !== "object") return value;
  const record = value as Json;
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .map((key) => [key, sortKeys(record[key])]),
  );
}

/** Official NOWPayments IPN: sorted JSON then HMAC-SHA512. Also accept raw-body signatures. */
export async function verifyNowPaymentsSignature(
  payload: Json,
  signatureHeader: string | null,
  secret: string,
  rawBody?: string,
): Promise<boolean> {
  if (!signatureHeader || !secret) return false;
  const header = signatureHeader.trim().toLowerCase();
  const candidates = [
    JSON.stringify(payload, Object.keys(payload).sort()),
    JSON.stringify(sortKeys(payload)),
    rawBody || "",
    JSON.stringify(payload),
  ].filter(Boolean);
  for (const candidate of candidates) {
    const expected = await hmacSha512Hex(secret, candidate);
    if (timingSafeEqual(expected.toLowerCase(), header)) return true;
  }
  return false;
}

export function readNowPaymentsEnv(
  source: Record<string, string | undefined>,
): NowPaymentsEnv {
  const sandbox =
    (source.NOWPAYMENTS_SANDBOX || "").toLowerCase() === "true" ||
    (source.NOWPAYMENTS_ENVIRONMENT || "").toLowerCase() === "sandbox";
  const publicOrigin = (
    source.PUBLIC_SITE_URL ||
    source.NOWPAYMENTS_PUBLIC_ORIGIN ||
    ""
  ).replace(/\/$/, "");
  const configuredIpn = (source.NOWPAYMENTS_IPN_URL || "").replace(/\/$/, "");
  const siteIpn = publicOrigin ? `${publicOrigin}/api/nowpayments/ipn` : "";
  // Always prefer this app's IPN. A Supabase Edge Function URL will not update
  // profiles from this Vercel deployment.
  const ipnUrl =
    siteIpn ||
    (configuredIpn.includes("/functions/v1/") ? "" : configuredIpn) ||
    `${(source.SUPABASE_URL || "").replace(/\/$/, "")}/functions/v1/nowpayments-ipn`;
  return {
    apiKey: source.NOWPAYMENTS_API_KEY || "",
    ipnSecret: source.NOWPAYMENTS_IPN_SECRET || "",
    publicKey: source.NOWPAYMENTS_PUBLIC_KEY,
    apiUrl:
      source.NOWPAYMENTS_API_URL ||
      (sandbox
        ? "https://api-sandbox.nowpayments.io/v1"
        : "https://api.nowpayments.io/v1"),
    publicOrigin,
    ipnUrl,
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

function planIdFromOrder(order: Json): PaddlePlanId {
  return asString(order.plan_id) === "pro_yearly" ? "pro_yearly" : "pro_monthly";
}

async function supabaseRest(
  env: NowPaymentsEnv,
  method: string,
  path: string,
  body?: Json | Json[],
  query?: string,
  extraHeaders?: Record<string, string>,
): Promise<{ ok: boolean; status: number; data: unknown; text: string }> {
  const url = `${env.supabaseUrl.replace(/\/$/, "")}${path}${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method,
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...extraHeaders,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { ok: response.ok, status: response.status, data, text };
}

async function supabaseRestRequired(
  env: NowPaymentsEnv,
  method: string,
  path: string,
  body?: Json | Json[],
  query?: string,
): Promise<unknown> {
  const result = await supabaseRest(env, method, path, body, query);
  if (!result.ok) {
    throw new Error(`Supabase ${method} ${path} failed (${result.status}): ${result.text}`);
  }
  return result.data;
}

async function supabaseRpc(env: NowPaymentsEnv, fnName: string, body: Json): Promise<unknown> {
  const result = await supabaseRest(env, "POST", `/rest/v1/rpc/${fnName}`, body);
  if (!result.ok) {
    throw new Error(`Supabase RPC ${fnName} failed (${result.status}): ${result.text}`);
  }
  return result.data;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function desiredPlanValue(existing: unknown, mapped: "pro-1" | "pro-2"): string {
  const current = asString(existing);
  const lower = current.toLowerCase();
  if (current === "Free" || current === "Pro") return "Pro";
  if (lower === "free" || lower === "pro" || lower === "") return "pro";
  if (lower === "pro-1" || lower === "pro-2" || lower === "pro_monthly" || lower === "pro_yearly") {
    return mapped;
  }
  return mapped;
}

function buildPlanPatch(existing: Json, mapped: "pro-1" | "pro-2", expiresAt: string): Json {
  const patch: Json = {};
  const keys = new Set(Object.keys(existing));
  const has = (key: string) => keys.has(key);
  const planValue = desiredPlanValue(existing.plan ?? existing.subscription_plan ?? existing.tier, mapped);

  if (has("plan")) patch.plan = planValue;
  if (has("subscription_plan")) patch.subscription_plan = planValue;
  if (has("plan_id")) {
    patch.plan_id = asString(existing.plan_id).startsWith("pro_") ? (mapped === "pro-2" ? "pro_yearly" : "pro_monthly") : planValue;
  }
  if (has("tier")) patch.tier = planValue;
  if (has("membership")) patch.membership = planValue;
  if (has("account_plan")) patch.account_plan = planValue;
  if (has("plan_name")) patch.plan_name = planValue;
  if (has("role") && ["free", "pro", "user"].includes(asString(existing.role).toLowerCase())) {
    patch.role = planValue === "Pro" ? "Pro" : "pro";
  }

  for (const key of ["expires_at", "plan_expires_at", "subscription_expires_at", "valid_until", "pro_expires_at"]) {
    if (has(key)) patch[key] = expiresAt;
  }
  for (const key of ["plan_status", "subscription_status"]) {
    if (has(key)) patch[key] = "active";
  }
  if (has("status") && ["free", "active", "inactive", "canceled", "cancelled", "expired", "trial"].includes(asString(existing.status).toLowerCase())) {
    patch.status = "active";
  }
  for (const key of ["is_pro", "pro", "is_premium", "premium"]) {
    if (has(key) && typeof existing[key] === "boolean") patch[key] = true;
  }
  if (has("updated_at")) patch.updated_at = new Date().toISOString();
  return patch;
}

function usersFromAuthPayload(data: unknown): Json[] {
  const payload = asRecord(data);
  if (Array.isArray(payload.users)) return payload.users.map(asRecord);
  if (payload.user && typeof payload.user === "object") return [asRecord(payload.user)];
  if (Array.isArray(data)) return data.map(asRecord);
  return [];
}

async function findAuthUserId(env: NowPaymentsEnv, email: string): Promise<string | null> {
  const queries = [`email=${encodeURIComponent(email)}`, `page=1&per_page=200`];
  for (const query of queries) {
    const result = await supabaseRest(
      env,
      "GET",
      "/auth/v1/admin/users",
      undefined,
      query,
      { Authorization: `Bearer ${env.supabaseServiceRoleKey}` },
    );
    const match = usersFromAuthPayload(result.data).find(
      (user) => asString(user.email).toLowerCase() === email,
    );
    if (match) return asString(match.id) || null;
  }
  return null;
}

async function loadTableRows(
  env: NowPaymentsEnv,
  table: string,
  email: string,
  userId: string | null,
): Promise<Json[]> {
  const queries = [
    `email=eq.${encodeURIComponent(email)}&select=*`,
    `email=ilike.${encodeURIComponent(email)}&select=*`,
  ];
  if (userId) {
    queries.push(`id=eq.${encodeURIComponent(userId)}&select=*`);
    queries.push(`user_id=eq.${encodeURIComponent(userId)}&select=*`);
  }
  const found: Json[] = [];
  const seen = new Set<string>();
  for (const query of queries) {
    const result = await supabaseRest(env, "GET", `/rest/v1/${table}`, undefined, query);
    if (!result.ok || !Array.isArray(result.data)) continue;
    for (const row of result.data) {
      const record = asRecord(row);
      const key = asString(record.id) || JSON.stringify(record);
      if (seen.has(key)) continue;
      seen.add(key);
      found.push(record);
    }
    if (found.length > 0) break;
  }
  return found;
}

async function patchTableRows(
  env: NowPaymentsEnv,
  table: string,
  rows: Json[],
  mapped: "pro-1" | "pro-2",
  expiresAt: string,
): Promise<number> {
  let updated = 0;
  for (const row of rows) {
    const patch = buildPlanPatch(row, mapped, expiresAt);
    if (Object.keys(patch).length === 0) {
      patch.plan = desiredPlanValue(row.plan, mapped);
      if (Object.prototype.hasOwnProperty.call(row, "updated_at")) {
        patch.updated_at = new Date().toISOString();
      }
    }
    const id = asString(row.id);
    const userId = asString(row.user_id);
    const email = asString(row.email);
    const query = id
      ? `id=eq.${encodeURIComponent(id)}`
      : userId
        ? `user_id=eq.${encodeURIComponent(userId)}`
        : email
          ? `email=eq.${encodeURIComponent(email)}`
          : "";
    if (!query) continue;
    const result = await supabaseRest(env, "PATCH", `/rest/v1/${table}`, patch, query);
    if (result.ok) updated += Array.isArray(result.data) ? result.data.length || 1 : 1;
    else console.error(`Failed to patch ${table}: ${result.status} ${result.text}`);
  }
  return updated;
}

async function applyPlanToProfiles(
  env: NowPaymentsEnv,
  email: string,
  mapped: "pro-1" | "pro-2",
  expiresAt: string,
): Promise<{ profiles: number; user_profiles: number; userId: string | null }> {
  const userId = await findAuthUserId(env, email);
  const profiles = await loadTableRows(env, "profiles", email, userId);
  const userProfiles = await loadTableRows(env, "user_profiles", email, userId);
  const profileCount = await patchTableRows(env, "profiles", profiles, mapped, expiresAt);
  const userProfileCount = await patchTableRows(env, "user_profiles", userProfiles, mapped, expiresAt);
  return { profiles: profileCount, user_profiles: userProfileCount, userId };
}

async function grantProEntitlement(env: NowPaymentsEnv, order: Json): Promise<Json> {
  const email = asString(order.email).toLowerCase();
  const planId = planIdFromOrder(order);
  const mapped = (asString(order.plan) as "pro-1" | "pro-2") || planFromId(planId);
  const expiresAt = expiresAtForPlan(planId);
  const paymentId = asString(order.payment_id) || asString(order.order_id);

  let rpc: unknown = null;
  try {
    rpc = await supabaseRpc(env, "apply_paddle_entitlement", {
      p_email: email,
      p_plan: mapped === "pro-2" || mapped === "pro-1" ? mapped : planFromId(planId),
      p_status: "active",
      p_expires_at: expiresAt,
      p_customer_id: null,
      p_subscription_id: null,
      p_transaction_id: paymentId,
    });
  } catch (error) {
    console.error("apply_paddle_entitlement failed; updating profile tables directly", error);
  }

  const tables = await applyPlanToProfiles(env, email, planFromId(planId), expiresAt);
  if (tables.profiles === 0 && tables.user_profiles === 0) {
    throw new Error(
      `Paid crypto order ${asString(order.order_id)} but no profiles/user_profiles row matched ${email}.`,
    );
  }
  return { rpc, ...tables };
}

function isPaidStatus(status: string): boolean {
  return PAID_STATUSES.has(status.toLowerCase());
}

async function loadOrder(
  env: NowPaymentsEnv,
  orderId: string,
  invoiceId: string,
): Promise<Json | undefined> {
  if (orderId) {
    const rows = (await supabaseRestRequired(
      env,
      "GET",
      "/rest/v1/nowpayments_orders",
      undefined,
      `order_id=eq.${encodeURIComponent(orderId)}&select=*&limit=1`,
    )) as Json[] | null;
    if (Array.isArray(rows) && rows[0]) return rows[0];
  }
  if (invoiceId) {
    const rows = (await supabaseRestRequired(
      env,
      "GET",
      "/rest/v1/nowpayments_orders",
      undefined,
      `invoice_id=eq.${encodeURIComponent(invoiceId)}&select=*&limit=1`,
    )) as Json[] | null;
    if (Array.isArray(rows) && rows[0]) return rows[0];
  }
  return undefined;
}

async function saveOrderStatus(env: NowPaymentsEnv, order: Json, patch: Json): Promise<void> {
  const orderId = asString(order.order_id);
  const id = asString(order.id);
  await supabaseRestRequired(
    env,
    "PATCH",
    "/rest/v1/nowpayments_orders",
    { ...patch, updated_at: new Date().toISOString() },
    orderId ? `order_id=eq.${encodeURIComponent(orderId)}` : `id=eq.${encodeURIComponent(id)}`,
  );
}

function paymentsFromNowPaymentsPayload(data: unknown): Json[] {
  if (Array.isArray(data)) return data.map(asRecord);
  const record = asRecord(data);
  if (Array.isArray(record.data)) return record.data.map(asRecord);
  if (Array.isArray(record.payments)) return record.payments.map(asRecord);
  if (asString(record.payment_id) || asString(record.payment_status) || asString(record.invoice_id)) {
    return [record];
  }
  return [];
}

async function fetchNowPaymentsJson(env: NowPaymentsEnv, path: string): Promise<unknown> {
  const response = await fetch(`${env.apiUrl.replace(/\/$/, "")}${path}`, {
    headers: { "x-api-key": env.apiKey },
  });
  const text = await response.text();
  if (!response.ok) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchNowPaymentsForOrder(env: NowPaymentsEnv, order: Json): Promise<Json | null> {
  const paymentId = asString(order.payment_id);
  const invoiceId = asString(order.invoice_id);
  const orderId = asString(order.order_id);
  const attempts = [
    paymentId ? `/payment/${encodeURIComponent(paymentId)}` : "",
    invoiceId ? `/payment/?invoiceId=${encodeURIComponent(invoiceId)}&limit=10` : "",
    orderId ? `/payment/?order_id=${encodeURIComponent(orderId)}&limit=10` : "",
    invoiceId ? `/invoice/${encodeURIComponent(invoiceId)}` : "",
  ].filter(Boolean);

  for (const path of attempts) {
    const payload = await fetchNowPaymentsJson(env, path);
    const payments = paymentsFromNowPaymentsPayload(payload).filter((payment) => {
      const sameOrder = !orderId || asString(payment.order_id) === orderId || !asString(payment.order_id);
      const sameInvoice = !invoiceId || asString(payment.invoice_id) === invoiceId || !asString(payment.invoice_id);
      return sameOrder && sameInvoice;
    });
    const paid = payments.find((payment) => isPaidStatus(asString(payment.payment_status)));
    if (paid) return paid;
    if (payments[0] && isPaidStatus(asString(payments[0].payment_status) || asString(payments[0].status))) {
      return payments[0];
    }
  }
  return null;
}

async function maybeClaimIpn(env: NowPaymentsEnv, eventKey: string, paymentStatus: string): Promise<boolean> {
  try {
    const claimed = await supabaseRpc(env, "claim_nowpayments_ipn_event", {
      p_event_id: eventKey,
      p_payment_status: paymentStatus,
    });
    return claimed !== false;
  } catch (error) {
    console.error("claim_nowpayments_ipn_event failed", error);
    return true;
  }
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
  if (!input.env.ipnUrl.includes("/api/nowpayments/ipn")) {
    throw new Error("NOWPayments IPN URL must point at this site's /api/nowpayments/ipn route.");
  }

  const chain = CRYPTO_CHAINS[input.chainId as CryptoChainId];
  const amount = CRYPTO_PLAN_PRICES_USD[input.planId];
  const orderId = `np_${crypto.randomUUID()}`;
  const origin = input.env.publicOrigin;
  const successUrl = new URL("/checkout/success", `${origin}/`);
  successUrl.searchParams.set("plan", input.planId);
  successUrl.searchParams.set("method", "crypto");
  successUrl.searchParams.set("orderId", orderId);

  const payload = {
    price_amount: amount,
    price_currency: "usd",
    pay_currency: chain.payCurrency,
    order_id: orderId,
    order_description: `Visage.AI ${input.planId === "pro_yearly" ? "Pro Yearly" : "Pro Monthly"} for ${email}`,
    ipn_callback_url: input.env.ipnUrl,
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

  await supabaseRestRequired(input.env, "POST", "/rest/v1/nowpayments_orders", {
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

export async function confirmNowPaymentsOrder(
  env: NowPaymentsEnv,
  orderId: string,
): Promise<{ ok: boolean; status: number; body: Json }> {
  if (!env.apiKey || !env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return { ok: false, status: 500, body: { error: "NOWPayments is not configured." } };
  }
  const order = await loadOrder(env, orderId, "");
  if (!order) {
    return { ok: false, status: 404, body: { error: "Unknown crypto order." } };
  }
  const payment = await fetchNowPaymentsForOrder(env, order);
  const paymentStatus = asString(payment?.payment_status || payment?.status || order.payment_status).toLowerCase();
  if (payment) {
    await saveOrderStatus(env, order, {
      payment_id: asString(payment.payment_id) || asString(order.payment_id) || null,
      invoice_id: asString(payment.invoice_id) || asString(order.invoice_id) || null,
      payment_status: paymentStatus || asString(order.payment_status),
      pay_currency: asString(payment.pay_currency) || asString(order.pay_currency),
    });
  }
  if (!isPaidStatus(paymentStatus)) {
    return {
      ok: true,
      status: 202,
      body: { received: true, paymentStatus, pending: true },
    };
  }
  const result = await grantProEntitlement(env, { ...order, payment_id: asString(payment?.payment_id) || asString(order.payment_id) });
  return { ok: true, status: 200, body: { received: true, paymentStatus, result } };
}

export async function confirmNowPaymentsByEmail(
  env: NowPaymentsEnv,
  email: string,
): Promise<{ ok: boolean; status: number; body: Json }> {
  const normalized = email.trim().toLowerCase();
  if (!isEmail(normalized)) {
    return { ok: false, status: 400, body: { error: "Enter the email used at checkout." } };
  }
  const rows = (await supabaseRestRequired(
    env,
    "GET",
    "/rest/v1/nowpayments_orders",
    undefined,
    `email=eq.${encodeURIComponent(normalized)}&select=*&order=created_at.desc&limit=5`,
  )) as Json[] | null;
  const orders = Array.isArray(rows) ? rows : [];
  if (orders.length === 0) {
    return { ok: false, status: 404, body: { error: "No crypto order found for that email." } };
  }
  let last: { ok: boolean; status: number; body: Json } | null = null;
  for (const order of orders) {
    last = await confirmNowPaymentsOrder(env, asString(order.order_id));
    if (last.ok && last.status === 200 && !last.body.pending) return last;
  }
  return last || { ok: false, status: 404, body: { error: "No paid crypto order found for that email." } };
}

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

  const valid = await verifyNowPaymentsSignature(payload, signatureHeader, env.ipnSecret, rawBody);
  if (!valid) {
    return { ok: false, status: 401, body: { error: "Invalid NOWPayments signature" } };
  }

  const paymentId = asString(payload.payment_id);
  const orderId = asString(payload.order_id);
  const invoiceId = asString(payload.invoice_id);
  const paymentStatus = asString(payload.payment_status || payload.status).toLowerCase();
  const eventKey = `${paymentId || orderId || invoiceId}:${paymentStatus}`;

  const order = await loadOrder(env, orderId, invoiceId);
  if (!order) {
    return { ok: false, status: 422, body: { received: true, ignored: "unknown_order", orderId, invoiceId } };
  }

  await saveOrderStatus(env, order, {
    payment_id: paymentId || asString(order.payment_id) || null,
    invoice_id: invoiceId || asString(order.invoice_id) || null,
    payment_status: paymentStatus || asString(order.payment_status),
    pay_currency: asString(payload.pay_currency) || asString(order.pay_currency),
  });

  if (!isPaidStatus(paymentStatus)) {
    await maybeClaimIpn(env, eventKey, paymentStatus);
    return { ok: true, status: 200, body: { received: true, paymentStatus } };
  }

  const expected = Number(order.price_amount);
  const paidFiat = Number(payload.price_amount ?? payload.actually_paid_at_fiat ?? expected);
  if (Number.isFinite(expected) && Number.isFinite(paidFiat) && paidFiat > 0 && paidFiat + 0.01 < expected * 0.95) {
    await maybeClaimIpn(env, eventKey, paymentStatus);
    return {
      ok: true,
      status: 200,
      body: { received: true, ignored: "underpaid", expected, paidFiat },
    };
  }

  const result = await grantProEntitlement(env, {
    ...order,
    payment_id: paymentId || asString(order.payment_id),
  });
  await maybeClaimIpn(env, eventKey, paymentStatus);
  return { ok: true, status: 200, body: { received: true, paymentStatus, result } };
}
