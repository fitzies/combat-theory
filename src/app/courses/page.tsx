"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import CourseCard from "@/components/course-card";
import { CourseCommand } from "@/components/course-command";
import { Spinner } from "@/components/ui/spinner";

const sports: ("BJJ" | "Boxing" | "MMA")[] = ["BJJ", "Boxing", "MMA"];

export default function Page() {
  const courses = useQuery(api.courses.getAllCourses);

  if (courses === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        <div className="w-full flex items-center justify-between">
          <div className="flex flex-col items-start justify-center gap-1">
            <h1 className="text-3xl font-bold">Courses</h1>
            <p className="text-muted-foreground text-sm">
              Step-by-step courses that build real combat skill across boxing,
              Brazilian jiu-jitsu, wrestling, and MMA.
            </p>
          </div>
          <CourseCommand courses={courses} />
        </div>
        {sports.map((sport) => {
          const sportCourses = courses.filter(
            (course) => course.martialArt === sport,
          );
          if (sportCourses.length === 0) return null;
          return (
            <div key={sport} className="space-y-6">
              <h2 className="text-2xl font-bold">{sport}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sportCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
