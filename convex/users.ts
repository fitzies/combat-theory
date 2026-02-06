import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    imageUrl: v.optional(v.string()),
    dateOfBirth: v.number(),
    country: v.string(),
    disciplines: v.array(v.string()),
    yearsOfExperience: v.number(),
    goals: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) throw new Error("User already exists");

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      onboardingComplete: true,
      ...args,
    });
  },
});
