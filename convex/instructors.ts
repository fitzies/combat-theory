import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createInstructor = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    subscriptionPrice: v.number(),
    disciplines: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("instructors", args);
  },
});

export const getInstructors = query({
  handler: async (ctx) => {
    return await ctx.db.query("instructors").collect();
  },
});

export const getInstructor = query({
  args: { instructorId: v.id("instructors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.instructorId);
  },
});
