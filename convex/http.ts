import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    // Delegate to Node action for Stripe signature verification + processing
    try {
      await ctx.runAction(internal.stripeWebhook.handleWebhookEvent, {
        body,
        signature,
      });
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook processing failed:", error);
      return new Response("Webhook processing failed", { status: 500 });
    }
  }),
});

export default http;
