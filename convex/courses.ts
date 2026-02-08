import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced"),
    ),
    martialArt: v.union(
      v.literal("BJJ"),
      v.literal("Boxing"),
      v.literal("MMA"),
    ),
    instructorId: v.id("instructors"),
    duration: v.string(),
    price: v.optional(v.number()),
    volumes: v.array(
      v.object({
        name: v.string(),
        durationMinutes: v.number(),
        sections: v.array(
          v.object({
            title: v.string(),
            durationMinutes: v.number(),
            muxPlaybackId: v.optional(v.string()),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", args);
  },
});

export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const instructor = await ctx.db.get(course.instructorId);
    return { ...course, teacher: instructor?.name ?? "Unknown" };
  },
});

export const getLatestCourses = query({
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").order("desc").take(8);

    return await Promise.all(
      courses.map(async (course) => {
        const instructor = await ctx.db.get(course.instructorId);
        return { ...course, teacher: instructor?.name ?? "Unknown" };
      }),
    );
  },
});

export const getAllCourses = query({
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();

    return await Promise.all(
      courses.map(async (course) => {
        const instructor = await ctx.db.get(course.instructorId);
        return { ...course, teacher: instructor?.name ?? "Unknown" };
      }),
    );
  },
});

export const getFreeCourses = query({
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    const free = courses.filter((c) => !c.price || c.price === 0);

    return await Promise.all(
      free.map(async (course) => {
        const instructor = await ctx.db.get(course.instructorId);
        return { ...course, teacher: instructor?.name ?? "Unknown" };
      }),
    );
  },
});

export const getCoursesByInstructor = query({
  args: { instructorId: v.id("instructors") },
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("byInstructorId", (q) => q.eq("instructorId", args.instructorId))
      .collect();

    const instructor = await ctx.db.get(args.instructorId);

    return courses.map((course) => ({
      ...course,
      teacher: instructor?.name ?? "Unknown",
    }));
  },
});
