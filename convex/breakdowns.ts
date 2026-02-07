import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getLatestBreakdowns = query({
  handler: async (ctx) => {
    const breakdowns = await ctx.db.query("breakdowns").order("desc").take(8);

    return await Promise.all(
      breakdowns.map(async (breakdown) => {
        const instructor = await ctx.db.get(breakdown.instructorId);
        return { ...breakdown, teacher: instructor?.name ?? "Unknown" };
      }),
    );
  },
});

export const getAllBreakdowns = query({
  handler: async (ctx) => {
    const breakdowns = await ctx.db.query("breakdowns").collect();

    return await Promise.all(
      breakdowns.map(async (breakdown) => {
        const instructor = await ctx.db.get(breakdown.instructorId);
        return { ...breakdown, teacher: instructor?.name ?? "Unknown" };
      }),
    );
  },
});

export const getBreakdownsByInstructor = query({
  args: { instructorId: v.id("instructors") },
  handler: async (ctx, args) => {
    const breakdowns = await ctx.db
      .query("breakdowns")
      .withIndex("byInstructorId", (q) => q.eq("instructorId", args.instructorId))
      .collect();

    const instructor = await ctx.db.get(args.instructorId);

    return breakdowns.map((breakdown) => ({
      ...breakdown,
      teacher: instructor?.name ?? "Unknown",
    }));
  },
});

export const hasAccessToBreakdown = query({
  args: { breakdownId: v.id("breakdowns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return false;

    const breakdown = await ctx.db.get(args.breakdownId);
    if (!breakdown) return false;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("byUserAndInstructor", (q) =>
        q.eq("userId", user._id).eq("instructorId", breakdown.instructorId),
      )
      .unique();

    return subscription?.active ?? false;
  },
});

export const markBreakdownWatched = mutation({
  args: { breakdownId: v.id("breakdowns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("breakdownWatches")
      .withIndex("byUserAndBreakdown", (q) =>
        q.eq("userId", user._id).eq("breakdownId", args.breakdownId),
      )
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("breakdownWatches", {
      userId: user._id,
      breakdownId: args.breakdownId,
    });
  },
});

export const unmarkBreakdownWatched = mutation({
  args: { breakdownId: v.id("breakdowns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("breakdownWatches")
      .withIndex("byUserAndBreakdown", (q) =>
        q.eq("userId", user._id).eq("breakdownId", args.breakdownId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const hasWatchedBreakdown = query({
  args: { breakdownId: v.id("breakdowns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return false;

    const watch = await ctx.db
      .query("breakdownWatches")
      .withIndex("byUserAndBreakdown", (q) =>
        q.eq("userId", user._id).eq("breakdownId", args.breakdownId),
      )
      .unique();

    return !!watch;
  },
});

export const getUserWatchedBreakdowns = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const watches = await ctx.db
      .query("breakdownWatches")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();

    return watches.map((w) => w.breakdownId);
  },
});
