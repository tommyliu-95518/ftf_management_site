type Json = Record<string, unknown>;

export type PaddleWebhookEnv = {
  webhookSecret: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  paddleApiKey?: string;
  paddleApiUrl: string;
  priceProMonthly: string;
  priceProYearly: string;
};

const encoder = new TextEncoder();
const SIGNATURE_MAX_AGE_SECONDS = 300;

function asRecord(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nested(record: Json, ...keys: string[]): unknown {
  let current: unknown = record;
  for (const key of keys) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Json)[key];
  }
  return current;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  );
  const timestamp = parts.ts;
  const hash = parts.h1;
  if (!timestamp || !hash) return false;
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > SIGNATURE_MAX_AGE_SECONDS) {
    return false;
  }
  const expected = await hmacSha256Hex(secret, `${timestamp}:${rawBody}`);
  return timingSafeEqual(expected, hash);
}

function collectPriceIds(data: Json): string[] {
  const ids: string[] = [];
  const items = Array.isArray(data.items) ? data.items : [];
  for (const item of items) {
    const record = asRecord(item);
    const price = asRecord(record.price);
    const priceId = asString(price.id) || asString(record.price_id);
    if (priceId) ids.push(priceId);
  }
  const single = asString(nested(data, "price", "id"));
  if (single) ids.push(single);
  return ids;
}

export function planFromPriceIds(
  priceIds: string[],
  env: Pick<PaddleWebhookEnv, "priceProMonthly" | "priceProYearly">,
): "pro-1" | "pro-2" | null {
  if (priceIds.some((id) => id === env.priceProYearly)) return "pro-2";
  if (priceIds.some((id) => id === env.priceProMonthly)) return "pro-1";
  return null;
}

function extractEmail(data: Json): string {
  const custom = asRecord(data.custom_data);
  const candidates = [
    asString(nested(data, "customer", "email")),
    asString(custom.accountEmail),
    asString(custom.account_email),
    asString(custom.email),
    asString(data.email),
  ];
  return (candidates.find(Boolean) || "").toLowerCase();
}

function extractExpiresAt(data: Json): string | null {
  const candidates = [
    asString(nested(data, "current_billing_period", "ends_at")),
    asString(nested(data, "billing_period", "ends_at")),
    asString(nested(data, "next_billed_at")),
    asString(nested(data, "current_billing_period", "end_at")),
  ];
  return candidates.find(Boolean) || null;
}

function statusFromEvent(eventType: string, data: Json): string {
  const dataStatus = asString(data.status).toLowerCase();
  if (eventType.includes("canceled") || eventType.includes("cancelled")) {
    return "canceled";
  }
  if (eventType.includes("past_due")) return "past_due";
  if (eventType.includes("paused")) return "paused";
  if (dataStatus) return dataStatus;
  if (eventType.includes("completed") || eventType.includes("activated")) {
    return "active";
  }
  return "active";
}

async function supabaseRpc(
  env: PaddleWebhookEnv,
  fnName: string,
  body: Json,
): Promise<unknown> {
  const response = await fetch(
    `${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/${fnName}`,
    {
      method: "POST",
      headers: {
        apikey: env.supabaseServiceRoleKey,
        Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${fnName} failed (${response.status}): ${text}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function existingPlanForCustomer(
  env: PaddleWebhookEnv,
  email: string,
  subscriptionId: string,
): Promise<"pro-1" | "pro-2" | null> {
  const url = new URL(`${env.supabaseUrl.replace(/\/$/, "")}/rest/v1/paddle_entitlements`);
  url.searchParams.set("select", "plan");
  url.searchParams.set("limit", "1");
  if (email) url.searchParams.set("email", `eq.${email}`);
  else if (subscriptionId) {
    url.searchParams.set("paddle_subscription_id", `eq.${subscriptionId}`);
  } else {
    return null;
  }
  const response = await fetch(url, {
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    },
  });
  if (!response.ok) return null;
  const rows = (await response.json()) as Array<{ plan?: string }>;
  const plan = rows?.[0]?.plan;
  if (plan === "pro-2" || plan === "pro-1" || plan === "pro") {
    return plan === "pro-2" ? "pro-2" : "pro-1";
  }
  return null;
}

async function fetchCustomerEmail(
  env: PaddleWebhookEnv,
  customerId: string,
): Promise<string> {
  if (!env.paddleApiKey || !customerId) return "";
  const response = await fetch(
    `${env.paddleApiUrl.replace(/\/$/, "")}/customers/${customerId}`,
    {
      headers: {
        Authorization: `Bearer ${env.paddleApiKey}`,
      },
    },
  );
  if (!response.ok) return "";
  const payload = asRecord(await response.json());
  return asString(nested(payload, "data", "email")).toLowerCase();
}

const HANDLED_EVENTS = new Set([
  "transaction.completed",
  "transaction.paid",
  "subscription.created",
  "subscription.activated",
  "subscription.updated",
  "subscription.canceled",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
]);

export async function processPaddleWebhook(
  rawBody: string,
  signatureHeader: string | null,
  env: PaddleWebhookEnv,
): Promise<{ ok: boolean; status: number; body: Json }> {
  const valid = await verifyPaddleSignature(
    rawBody,
    signatureHeader,
    env.webhookSecret,
  );
  if (!valid) {
    return { ok: false, status: 401, body: { error: "Invalid Paddle signature" } };
  }

  let event: Json;
  try {
    event = asRecord(JSON.parse(rawBody));
  } catch {
    return { ok: false, status: 400, body: { error: "Invalid JSON" } };
  }

  const eventType = asString(event.event_type) || asString(event.eventType);
  const eventId = asString(event.event_id) || asString(event.notification_id);
  const data = asRecord(event.data);

  if (!HANDLED_EVENTS.has(eventType)) {
    await supabaseRpc(env, "claim_paddle_webhook_event", {
      p_event_id: eventId || `${eventType}:${asString(data.id)}`,
      p_event_type: eventType,
    });
    return { ok: true, status: 200, body: { received: true, ignored: eventType } };
  }

  const priceIds = collectPriceIds(data);
  const customerId = asString(data.customer_id) || asString(nested(data, "customer", "id"));
  const subscriptionId =
    asString(data.subscription_id) ||
    (asString(data.id).startsWith("sub_") ? asString(data.id) : "");
  const transactionId = asString(data.id).startsWith("txn_")
    ? asString(data.id)
    : asString(data.transaction_id);

  let email = extractEmail(data);
  if (!email && customerId) {
    email = await fetchCustomerEmail(env, customerId);
  }

  const recognizedPlan = planFromPriceIds(priceIds, env);
  const plan =
    recognizedPlan ||
    (priceIds.length === 0
      ? await existingPlanForCustomer(env, email, subscriptionId)
      : null);

  if (!plan) {
    return {
      ok: true,
      status: 422,
      body: { received: true, ignored: "unknown_price", priceIds },
    };
  }
  if (!email) {
    return {
      ok: false,
      status: 422,
      body: { received: true, error: "missing_email", customerId },
    };
  }

  const result = await supabaseRpc(env, "apply_paddle_entitlement", {
    p_email: email,
    p_plan: plan,
    p_status: statusFromEvent(eventType, data),
    p_expires_at: extractExpiresAt(data),
    p_customer_id: customerId || null,
    p_subscription_id: subscriptionId || null,
    p_transaction_id: transactionId || null,
  });

  const claimed = await supabaseRpc(env, "claim_paddle_webhook_event", {
    p_event_id: eventId || `${eventType}:${asString(data.id)}`,
    p_event_type: eventType,
  });
  if (claimed === false) {
    return { ok: true, status: 200, body: { received: true, duplicate: true } };
  }

  return {
    ok: true,
    status: 200,
    body: { received: true, eventType, result },
  };
}

export function readPaddleWebhookEnv(
  source: Record<string, string | undefined>,
): PaddleWebhookEnv {
  const supabaseUrl = source.SUPABASE_URL || "";
  const supabaseServiceRoleKey =
    source.SUPABASE_SERVICE_ROLE_KEY || source.RECOVERY_SERVICE_ROLE_KEY || "";
  const environment =
    source.PADDLE_ENVIRONMENT || source.VITE_PADDLE_ENVIRONMENT || "sandbox";
  return {
    webhookSecret: source.PADDLE_WEBHOOK_SECRET || "",
    supabaseUrl,
    supabaseServiceRoleKey,
    paddleApiKey: source.PADDLE_API_KEY,
    paddleApiUrl:
      source.PADDLE_API_URL ||
      (environment === "production"
        ? "https://api.paddle.com"
        : "https://sandbox-api.paddle.com"),
    priceProMonthly:
      source.PADDLE_PRICE_PRO_MONTHLY || source.VITE_PADDLE_PRICE_PRO_MONTHLY || "",
    priceProYearly:
      source.PADDLE_PRICE_PRO_YEARLY || source.VITE_PADDLE_PRICE_PRO_YEARLY || "",
  };
}
