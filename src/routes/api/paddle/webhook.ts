import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import {
  processPaddleWebhook,
  readPaddleWebhookEnv,
} from "@/lib/server/paddle-webhook";

export const Route = createFileRoute("/api/paddle/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const env = readPaddleWebhookEnv(process.env as Record<string, string | undefined>);
        if (
          !env.webhookSecret ||
          !env.supabaseUrl ||
          !env.supabaseServiceRoleKey ||
          !env.priceProMonthly ||
          !env.priceProYearly
        ) {
          return Response.json(
            { error: "Paddle webhook is not configured on the server." },
            { status: 500 },
          );
        }
        try {
          const result = await processPaddleWebhook(
            rawBody,
            request.headers.get("paddle-signature"),
            env,
          );
          return Response.json(result.body, { status: result.status });
        } catch (error) {
          console.error(error);
          return Response.json(
            { error: "Failed to apply Paddle entitlement." },
            { status: 500 },
          );
        }
      },
    },
  },
});
