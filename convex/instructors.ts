import { v } from "convex/values";
import { query } from "./_generated/server";

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
