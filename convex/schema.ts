import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    username: v.string(),
    imageUrl: v.optional(v.string()),
    dateOfBirth: v.number(),
    country: v.string(),
    disciplines: v.array(v.string()),
    yearsOfExperience: v.number(),
    goals: v.array(v.string()),
    onboardingComplete: v.boolean(),
  }).index("byClerkId", ["clerkId"]),

  instructors: defineTable({
    name: v.string(),
    bio: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    subscriptionPrice: v.number(),
    disciplines: v.array(v.string()),
  }).index("byName", ["name"]),

  courses: defineTable({
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
          }),
        ),
      }),
    ),
  }).index("byInstructorId", ["instructorId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    instructorId: v.id("instructors"),
    active: v.boolean(),
  })
    .index("byUserId", ["userId"])
    .index("byUserAndInstructor", ["userId", "instructorId"]),

  purchases: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
  })
    .index("byUserId", ["userId"])
    .index("byUserAndCourse", ["userId", "courseId"]),
});
