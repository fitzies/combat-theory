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

export const checkUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    if (!args.username.trim()) return { available: true };
    const existing = await ctx.db
      .query("users")
      .withIndex("byUsername", (q) => q.eq("username", args.username))
      .unique();
    return { available: !existing };
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
    belts: v.optional(
      v.array(
        v.object({
          discipline: v.string(),
          belt: v.string(),
          stripe: v.optional(v.number()),
          dan: v.optional(v.number()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) throw new Error("User already exists");

    // Check username uniqueness at mutation time too
    const usernameTaken = await ctx.db
      .query("users")
      .withIndex("byUsername", (q) => q.eq("username", args.username))
      .unique();

    if (usernameTaken) throw new Error("Username already taken");

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      onboardingComplete: true,
      ...args,
    });
  },
});

export const updateUserBelts = mutation({
  args: {
    belts: v.array(
      v.object({
        discipline: v.string(),
        belt: v.string(),
        stripe: v.optional(v.number()),
        dan: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, { belts: args.belts });
  },
});
