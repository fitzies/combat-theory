"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export const createCourseCheckout = action({
  args: {
    courseId: v.id("courses"),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const stripe = getStripe();
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const course = await ctx.runQuery(api.courses.getCourseById, {
      courseId: args.courseId,
    });
    if (!course) throw new Error("Course not found");
    if (!course.price || course.price === 0) {
      throw new Error("Course is free — no checkout needed");
    }

    const instructor = await ctx.runQuery(api.instructors.getInstructor, {
      instructorId: course.instructorId,
    });
    if (!instructor) throw new Error("Instructor not found");
    if (!instructor.stripeConnectedAccountId) {
      throw new Error("Instructor has not set up payments");
    }

    const priceInCents = Math.round(course.price * 100);
    const applicationFee = Math.round(priceInCents * 0.1); // 10% platform fee

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card", "paynow"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: course.title,
                description: course.description,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: applicationFee,
          metadata: {
            type: "course_purchase",
            courseId: args.courseId,
            clerkId: identity.subject,
          },
        },
        metadata: {
          type: "course_purchase",
          courseId: args.courseId,
          clerkId: identity.subject,
        },
        success_url: args.successUrl,
        cancel_url: args.cancelUrl,
      },
      { stripeAccount: instructor.stripeConnectedAccountId },
    );

    if (!session.url) throw new Error("Failed to create checkout session");
    return session.url;
  },
});

export const createSubscriptionCheckout = action({
  args: {
    instructorId: v.id("instructors"),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const stripe = getStripe();
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const instructor = await ctx.runQuery(api.instructors.getInstructor, {
      instructorId: args.instructorId,
    });
    if (!instructor) throw new Error("Instructor not found");
    if (!instructor.stripeConnectedAccountId) {
      throw new Error("Instructor has not set up payments");
    }

    const priceInCents = Math.round(instructor.subscriptionPrice * 100);

    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        payment_method_types: ["card", "paynow"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${instructor.name} — Monthly Subscription`,
              },
              unit_amount: priceInCents,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          application_fee_percent: 10,
          metadata: {
            type: "instructor_subscription",
            instructorId: args.instructorId,
            clerkId: identity.subject,
          },
        },
        metadata: {
          type: "instructor_subscription",
          instructorId: args.instructorId,
          clerkId: identity.subject,
        },
        success_url: args.successUrl,
        cancel_url: args.cancelUrl,
      },
      { stripeAccount: instructor.stripeConnectedAccountId },
    );

    if (!session.url) throw new Error("Failed to create checkout session");
    return session.url;
  },
});
