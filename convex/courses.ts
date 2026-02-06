import { v } from "convex/values";
import { query } from "./_generated/server";

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
