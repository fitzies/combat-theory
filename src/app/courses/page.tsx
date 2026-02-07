"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import CourseCard from "@/components/course-card";
import { CourseCommand } from "@/components/course-command";
import { Spinner } from "@/components/ui/spinner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

const sports: ("BJJ" | "Boxing" | "MMA")[] = ["BJJ", "Boxing", "MMA"];

export default function Page() {
  const courses = useQuery(api.courses.getAllCourses);

  if (courses === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[95vh]">
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
            <p className="text-muted-foreground text-sm md:block hidden">
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
            <SportCarousel
              key={sport}
              sport={sport}
              courses={sportCourses}
            />
          );
        })}
      </div>
    </div>
  );
}

function SportCarousel({
  sport,
  courses,
}: {
  sport: string;
  courses: (Doc<"courses"> & { teacher: string })[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on("select", () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });
  }, [api]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{sport}</h2>
      <Carousel
        className="w-full"
        setApi={setApi}
        opts={{
          align: "start",
          slidesToScroll: 1,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {courses.map((course) => (
            <CarouselItem
              key={course._id}
              className="pl-2 md:pl-4 basis-[85%] md:basis-[48%] lg:basis-[18%]"
            >
              <CourseCard course={course} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {canScrollPrev && (
          <CarouselPrevious className="hidden md:flex -left-12" />
        )}
        {canScrollNext && (
          <CarouselNext className="hidden md:flex -right-12" />
        )}
      </Carousel>
    </div>
  );
}
