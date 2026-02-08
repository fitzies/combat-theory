"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export const handleWebhookEvent = internalAction({
  args: { body: v.string(), signature: v.string() },
  handler: async (ctx, args) => {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      args.body,
      args.signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;
        if (!metadata) break;

        if (metadata.type === "course_purchase") {
          await ctx.runMutation(internal.purchases.internalPurchaseCourse, {
            clerkId: metadata.clerkId,
            courseId: metadata.courseId as Id<"courses">,
          });
        }

        if (metadata.type === "instructor_subscription") {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id;

          if (subscriptionId && customerId) {
            await ctx.runMutation(
              internal.purchases.internalActivateSubscription,
              {
                clerkId: metadata.clerkId,
                instructorId: metadata.instructorId as Id<"instructors">,
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: customerId,
              },
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await ctx.runMutation(
          internal.purchases.internalDeactivateSubscription,
          { stripeSubscriptionId: subscription.id },
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (subscriptionId) {
          await ctx.runMutation(
            internal.purchases.internalDeactivateSubscription,
            { stripeSubscriptionId: subscriptionId },
          );
        }
        break;
      }
    }
  },
});
