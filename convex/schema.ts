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
    onboardingComplete: v.boolean(),
  })
    .index("byClerkId", ["clerkId"])
    .index("byUsername", ["username"]),

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
            muxPlaybackId: v.optional(v.string()),
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

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    startedAt: v.number(),
    completedSections: v.array(v.string()),
    completedAt: v.optional(v.number()),
  })
    .index("byUserId", ["userId"])
    .index("byUserAndCourse", ["userId", "courseId"]),

  breakdowns: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    type: v.union(
      v.literal("Discussion"),
      v.literal("Spar"),
      v.literal("Technique"),
      v.literal("Breakdown"),
    ),
    martialArt: v.union(
      v.literal("BJJ"),
      v.literal("Boxing"),
      v.literal("MMA"),
    ),
    instructorId: v.id("instructors"),
    duration: v.string(),
    muxPlaybackId: v.optional(v.string()),
  }).index("byInstructorId", ["instructorId"]),

  breakdownWatches: defineTable({
    userId: v.id("users"),
    breakdownId: v.id("breakdowns"),
  })
    .index("byUserId", ["userId"])
    .index("byUserAndBreakdown", ["userId", "breakdownId"]),
});
