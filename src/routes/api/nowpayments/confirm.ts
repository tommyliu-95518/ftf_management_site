import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import {
  confirmNowPaymentsByEmail,
  confirmNowPaymentsOrder,
  readNowPaymentsEnv,
} from "@/lib/server/nowpayments";

export const Route = createFileRoute("/api/nowpayments/confirm")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const env = readNowPaymentsEnv(process.env as Record<string, string | undefined>);
        try {
          const body = (await request.json()) as { orderId?: string; email?: string };
          const orderId = String(body.orderId || "").trim();
          const email = String(body.email || "").trim();
          if (!orderId && !email) {
            return Response.json({ error: "Missing orderId or email." }, { status: 400 });
          }
          const result = orderId
            ? await confirmNowPaymentsOrder(env, orderId)
            : await confirmNowPaymentsByEmail(env, email);
          return Response.json(result.body, { status: result.status });
        } catch (error) {
          console.error(error);
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to confirm crypto payment.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
