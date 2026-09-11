import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import type { PaddlePlanId } from "@/lib/paddle";
import { createNowPaymentsInvoice, readNowPaymentsEnv } from "@/lib/server/nowpayments";

export const Route = createFileRoute("/api/nowpayments/invoice")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            planId?: string;
            email?: string;
            chainId?: string;
          };
          if (body.planId !== "pro_monthly" && body.planId !== "pro_yearly") {
            return Response.json({ error: "Choose a Pro plan." }, { status: 400 });
          }
          const env = readNowPaymentsEnv(process.env as Record<string, string | undefined>);
          const result = await createNowPaymentsInvoice({
            env,
            planId: body.planId as PaddlePlanId,
            email: String(body.email || ""),
            chainId: String(body.chainId || ""),
          });
          return Response.json(result);
        } catch (error) {
          console.error(error);
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "Could not create a crypto invoice.",
            },
            { status: 400 },
          );
        }
      },
    },
  },
});
