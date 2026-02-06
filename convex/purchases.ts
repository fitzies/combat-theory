import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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
