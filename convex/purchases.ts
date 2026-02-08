import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

export const purchaseCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("purchases")
      .withIndex("byUserAndCourse", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId),
      )
      .unique();
    if (existing) throw new Error("Already purchased");

    return await ctx.db.insert("purchases", {
      userId: user._id,
      courseId: args.courseId,
    });
  },
});

export const subscribeToInstructor = mutation({
  args: { instructorId: v.id("instructors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("byUserAndInstructor", (q) =>
        q.eq("userId", user._id).eq("instructorId", args.instructorId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { active: true });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      userId: user._id,
      instructorId: args.instructorId,
      active: true,
    });
  },
});

export const getUserPurchases = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("purchases")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const getUserSubscriptions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("subscriptions")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// --- Internal mutations (called from Stripe webhook handler) ---

export const internalPurchaseCourse = internalMutation({
  args: { clerkId: v.string(), courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("purchases")
      .withIndex("byUserAndCourse", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId),
      )
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("purchases", {
      userId: user._id,
      courseId: args.courseId,
    });
  },
});

export const internalActivateSubscription = internalMutation({
  args: {
    clerkId: v.string(),
    instructorId: v.id("instructors"),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("byUserAndInstructor", (q) =>
        q.eq("userId", user._id).eq("instructorId", args.instructorId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        active: true,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripeCustomerId: args.stripeCustomerId,
      });
      return existing._id;
    }

    return await ctx.db.insert("subscriptions", {
      userId: user._id,
      instructorId: args.instructorId,
      active: true,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeCustomerId: args.stripeCustomerId,
    });
  },
});

export const internalDeactivateSubscription = internalMutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("byStripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .unique();
    if (subscription) {
      await ctx.db.patch(subscription._id, { active: false });
    }
  },
});

export const hasAccessToCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return false;

    const course = await ctx.db.get(args.courseId);
    if (!course) return false;
    if (!course.price || course.price === 0) return true;

    const purchase = await ctx.db
      .query("purchases")
      .withIndex("byUserAndCourse", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId),
      )
      .unique();
    if (purchase) return true;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("byUserAndInstructor", (q) =>
        q.eq("userId", user._id).eq("instructorId", course.instructorId),
      )
      .unique();

    return subscription?.active ?? false;
  },
});
