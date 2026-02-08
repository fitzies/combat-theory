"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import MuxVideoPlayer from "@/components/mux-video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Play,
  CheckCircle2,
  Circle,
  Clock,
  ChevronLeft,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function CourseWatchPage() {
  const params = useParams();
  const courseId = params.id as Id<"courses">;

  const course = useQuery(api.courses.getCourseById, { courseId });
  const hasAccess = useQuery(api.purchases.hasAccessToCourse, { courseId });
  const enrollment = useQuery(api.enrollments.getEnrollment, { courseId });
  const enroll = useMutation(api.enrollments.enrollInCourse);
  const markComplete = useMutation(api.enrollments.markSectionComplete);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Auto-select the first uncompleted playable section on load
  useEffect(() => {
    if (!course || !hasAccess || activeSectionId) return;
    const allSecs = course.volumes?.flatMap((volume, vi) =>
      volume.sections.map((section, si) => ({ id: `${vi}-${si}`, ...section })),
    ) ?? [];
    if (allSecs.length === 0) return;
    const firstPlayable = enrollment
      ? allSecs.find(
        (s) => s.muxPlaybackId && !enrollment.completedSections.includes(s.id),
      ) ?? allSecs.find((s) => s.muxPlaybackId)
      : allSecs.find((s) => s.muxPlaybackId);
    if (firstPlayable) setActiveSectionId(firstPlayable.id);
  }, [course, enrollment, hasAccess, activeSectionId]);

  if (course === undefined || hasAccess === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[95vh]">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (course === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <Link href="/courses" className="text-muted-foreground hover:underline mt-4 inline-block">
          Back to courses
        </Link>
      </div>
    );
  }

  // Build flat list of all sections for navigation
  const allSections = course.volumes?.flatMap((volume, vi) =>
    volume.sections.map((section, si) => ({
      id: `${vi}-${si}`,
      ...section,
    })),
  ) ?? [];

  // Find the active section's playback ID
  let activePlaybackId: string | undefined;
  let activeTitle: string | undefined;
  if (activeSectionId) {
    const active = allSections.find((s) => s.id === activeSectionId);
    activePlaybackId = active?.muxPlaybackId ?? undefined;
    activeTitle = active?.title;
  }

  // Find next playable section after the current one
  const advanceToNext = () => {
    if (!activeSectionId) return;
    const currentIdx = allSections.findIndex((s) => s.id === activeSectionId);
    for (let i = currentIdx + 1; i < allSections.length; i++) {
      if (allSections[i].muxPlaybackId) {
        setActiveSectionId(allSections[i].id);
        return;
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back nav */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to courses
      </Link>

      <div className="space-y-8">
        {/* Video player area — 11/12 width, centered */}
        <div className="w-full mx-auto space-y-4">
          {activePlaybackId ? (
            <MuxVideoPlayer
              playbackId={activePlaybackId}
              title={activeTitle}
              onEnded={() => {
                if (activeSectionId && enrollment && !enrollment.completedSections.includes(activeSectionId)) {
                  markComplete({ courseId: course._id, sectionId: activeSectionId });
                }
                advanceToNext();
              }}
            />
          ) : (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Select a section to start watching
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{course.difficulty}</Badge>
              <Badge variant="outline">{course.martialArt}</Badge>
              <span className="text-sm text-muted-foreground">
                {course.teacher} · {course.duration}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>
        </div>

        {/* Sections below */}
        <div className="space-y-4">
          {/* Access / enrollment CTA */}
          {hasAccess && enrollment ? (
            <div className="space-y-2 max-w-md">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {enrollment.progress}% complete
                </span>
                <span className="text-muted-foreground">
                  {enrollment.completedSections.length}/{enrollment.totalSections} sections
                </span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
            </div>
          ) : hasAccess && !enrollment ? (
            <Button
              className="w-fit"
              onClick={() => enroll({ courseId: course._id })}
            >
              Start Course
            </Button>
          ) : course.price && course.price > 0 ? (
            <Button className="w-fit" variant="secondary">
              <Lock className="w-4 h-4 mr-2" />
              Subscribe to {course.teacher} — ${course.price.toFixed(2)}/mo
            </Button>
          ) : (
            <SignUpButton mode="modal" forceRedirectUrl="/account-setup">
              <Button className="w-fit">Sign up to access</Button>
            </SignUpButton>
          )}

          {/* Volume / section list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.volumes?.map((volume, vi) => (
              <div key={vi} className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold">
                    <span className="text-muted-foreground font-mono mr-2">
                      {String(vi + 1).padStart(2, "0")}
                    </span>
                    {volume.name}
                  </h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(volume.durationMinutes)}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {volume.sections.map((section, si) => {
                    const sectionId = `${vi}-${si}`;
                    const isActive = activeSectionId === sectionId;
                    const isCompleted =
                      enrollment?.completedSections.includes(sectionId) ?? false;
                    const hasMux = !!section.muxPlaybackId;

                    return (
                      <div
                        key={si}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50"
                          }`}
                        onClick={() => {
                          if (hasAccess && hasMux) setActiveSectionId(sectionId);
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                        ) : hasMux ? (
                          <Play className="w-3 h-3 shrink-0 text-muted-foreground" />
                        ) : (
                          <Circle className="w-3 h-3 shrink-0 text-muted-foreground/50" />
                        )}

                        <span
                          className={`flex-1 truncate ${isCompleted
                            ? "line-through text-muted-foreground/50"
                            : ""
                            }`}
                        >
                          {section.title}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                          {formatDuration(section.durationMinutes)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
