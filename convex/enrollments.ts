import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const enrollInCourse = mutation({
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
      .query("enrollments")
      .withIndex("byUserAndCourse", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId),
      )
      .unique();
    if (existing) throw new Error("Already enrolled");

    return await ctx.db.insert("enrollments", {
      userId: user._id,
      courseId: args.courseId,
      startedAt: Date.now(),
      completedSections: [],
    });
  },
});

export const markSectionComplete = mutation({
  args: {
    courseId: v.id("courses"),
    sectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("byUserAndCourse", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId),
      )
      .unique();
    if (!enrollment) throw new Error("Not enrolled in this course");

    if (enrollment.completedSections.includes(args.sectionId)) return;

    const updatedSections = [...enrollment.completedSections, args.sectionId];

    // Count total sections in the course to check completion
    const course = await ctx.db.get(args.courseId);
    const totalSections =
      course?.volumes.reduce((sum, vol) => sum + vol.sections.length, 0) ?? 0;

    const isComplete =
      totalSections > 0 && updatedSections.length >= totalSections;

    await ctx.db.patch(enrollment._id, {
      completedSections: updatedSections,
      completedAt: isComplete ? Date.now() : undefined,
    });
  },
});

export const getUserEnrollments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();

    return await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db.get(enrollment.courseId);
        if (!course) return null;

        const instructor = await ctx.db.get(course.instructorId);
        const totalSections = course.volumes.reduce(
          (sum, vol) => sum + vol.sections.length,
          0,
        );
        const progress =
          totalSections > 0
            ? Math.round(
                (enrollment.completedSections.length / totalSections) * 100,
              )
            : 0;

        return {
          ...enrollment,
          course: {
            ...course,
            teacher: instructor?.name ?? "Unknown",
          },
          progress,
          totalSections,
        };
      }),
    ).then((results) => results.filter(Boolean));
  },
});

export const getEnrollment = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("byUserAndCourse", (q) =>
        q.eq("userId", user._id).eq("courseId", args.courseId),
      )
      .unique();

    if (!enrollment) return null;

    const course = await ctx.db.get(args.courseId);
    const totalSections =
      course?.volumes.reduce((sum, vol) => sum + vol.sections.length, 0) ?? 0;
    const progress =
      totalSections > 0
        ? Math.round(
            (enrollment.completedSections.length / totalSections) * 100,
          )
        : 0;

    return { ...enrollment, progress, totalSections };
  },
});
