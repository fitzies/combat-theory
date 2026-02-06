"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Doc } from "../../convex/_generated/dataModel";
import { Search } from "lucide-react";

type EnrichedCourse = Doc<"courses"> & { teacher: string };

type CourseCommandProps = {
  courses: EnrichedCourse[];
};

export function CourseCommand({ courses }: CourseCommandProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Get unique instructors
  const instructors = React.useMemo(() => {
    const unique = Array.from(new Set(courses.map((c) => c.teacher)));
    return unique.sort();
  }, [courses]);

  // Filter courses based on search
  const filteredCourses = React.useMemo(() => {
    if (!searchValue) {
      return courses.slice(0, 10); // Show max 10 if no search
    }
    const query = searchValue.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.teacher.toLowerCase().includes(query) ||
        course.martialArt.toLowerCase().includes(query) ||
        course.difficulty.toLowerCase().includes(query)
    );
  }, [courses, searchValue]);

  // Filter instructors based on search
  const filteredInstructors = React.useMemo(() => {
    if (!searchValue) {
      return instructors;
    }
    const query = searchValue.toLowerCase();
    return instructors.filter((instructor) =>
      instructor.toLowerCase().includes(query)
    );
  }, [instructors, searchValue]);

  return (
    <>
      <div className="relative w-fit">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search courses..."
          onClick={() => setOpen(true)}
          className="w-[200px] h-8 pl-9 text-sm cursor-pointer"
          readOnly
        />
      </div>
      <CommandDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSearchValue("");
          }
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search for a course, category or instructor..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* Courses */}
            {filteredCourses.length > 0 && (
              <CommandGroup heading="Courses">
                {filteredCourses.map((course) => (
                  <CommandItem
                    key={course._id}
                    value={`${course.title} ${course.teacher} ${course.martialArt} ${course.difficulty}`}
                    onSelect={() => {
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{course.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {course.teacher} · {course.martialArt} · {course.difficulty}
                        {(!course.price || course.price === 0) && " · Free"}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Filters */}
            <CommandGroup heading="Filters">
              <CommandItem
                value="filter martial art bjj"
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                }}
              >
                Filter by Martial Art: BJJ
              </CommandItem>
              <CommandItem
                value="filter martial art boxing"
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                }}
              >
                Filter by Martial Art: Boxing
              </CommandItem>
              <CommandItem
                value="filter martial art mma"
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                }}
              >
                Filter by Martial Art: MMA
              </CommandItem>
              <CommandItem
                value="filter difficulty beginner"
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                }}
              >
                Filter by Difficulty: Beginner
              </CommandItem>
              <CommandItem
                value="filter difficulty intermediate"
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                }}
              >
                Filter by Difficulty: Intermediate
              </CommandItem>
              <CommandItem
                value="filter difficulty advanced"
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                }}
              >
                Filter by Difficulty: Advanced
              </CommandItem>
              <CommandItem
                value="filter free"
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                }}
              >
                Filter by Free Courses
              </CommandItem>
              <CommandItem
                value="filter paid"
                onSelect={() => {
                  setOpen(false);
                  setSearchValue("");
                }}
              >
                Filter by Paid Courses
              </CommandItem>
            </CommandGroup>

            {/* Instructors */}
            {filteredInstructors.length > 0 && (
              <CommandGroup heading="Instructors">
                {filteredInstructors.map((instructor) => (
                  <CommandItem
                    key={instructor}
                    value={`instructor ${instructor}`}
                    onSelect={() => {
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    {instructor}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
