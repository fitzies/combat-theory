"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import CourseCard from "@/components/course-card";
import InstructorCard from "@/components/instructor-card";
import { Spinner } from "@/components/ui/spinner";

export default function AuthenticatedHome() {
  const latestCourses = useQuery(api.courses.getLatestCourses);
  const instructors = useQuery(api.instructors.getInstructors);
  const freeCourses = useQuery(api.courses.getFreeCourses);

  const isLoading =
    latestCourses === undefined ||
    instructors === undefined ||
    freeCourses === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Latest Courses */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Latest Courses</h2>
          <p className="text-muted-foreground text-sm">
            Fresh content to sharpen your skills
          </p>
        </div>
        {latestCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No courses yet.</p>
        )}
      </section>

      {/* Instructors */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Instructors</h2>
          <p className="text-muted-foreground text-sm">
            Learn from the best in combat sports
          </p>
        </div>
        {instructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {instructors.map((instructor) => (
              <InstructorCard
                key={instructor._id}
                instructor={instructor}
                courseCount={
                  latestCourses.filter(
                    (c) => c.instructorId === instructor._id,
                  ).length
                }
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No instructors yet.</p>
        )}
      </section>

      {/* Free Videos */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Free Videos</h2>
          <p className="text-muted-foreground text-sm">
            Start learning for free
          </p>
        </div>
        {freeCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {freeCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No free videos available yet.
          </p>
        )}
      </section>
    </div>
  );
}
