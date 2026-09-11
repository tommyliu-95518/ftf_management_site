import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { processNowPaymentsIpn, readNowPaymentsEnv } from "@/lib/server/nowpayments";

export const Route = createFileRoute("/api/nowpayments/ipn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const env = readNowPaymentsEnv(process.env as Record<string, string | undefined>);
        try {
          const result = await processNowPaymentsIpn(
            rawBody,
            request.headers.get("x-nowpayments-sig"),
            env,
          );
          return Response.json(result.body, { status: result.status });
        } catch (error) {
          console.error(error);
          return Response.json({ error: "Failed to process NOWPayments IPN." }, { status: 500 });
        }
      },
    },
  },
});
