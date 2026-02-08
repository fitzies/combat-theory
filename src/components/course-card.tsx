"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Lock, Clock, Circle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Doc } from "../../convex/_generated/dataModel";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type EnrichedCourse = Doc<"courses"> & { teacher: string };

type CourseCardProps = {
  course: EnrichedCourse;
};

function isNewCourse(creationTime: number): boolean {
  const createdDate = new Date(creationTime);
  const now = new Date();
  return (
    createdDate.getFullYear() === now.getFullYear() &&
    createdDate.getMonth() === now.getMonth()
  );
}

function isFree(price?: number): boolean {
  return !price || price === 0;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function CourseCard({ course }: CourseCardProps) {
  const isNew = isNewCourse(course._creationTime);
  const free = isFree(course.price);
  const totalVolumes = course.volumes?.length ?? 0;

  const hasAccess = useQuery(api.purchases.hasAccessToCourse, {
    courseId: course._id,
  });
  const enrollment = useQuery(api.enrollments.getEnrollment, {
    courseId: course._id,
  });
  const enroll = useMutation(api.enrollments.enrollInCourse);
  const createSubscriptionCheckout = useAction(api.stripe.createSubscriptionCheckout);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden p-0 bg-transparent border-transparent rounded-none shadow-none cursor-pointer">
          <motion.div
            className="relative bg-muted aspect-video w-full cursor-pointer rounded-sm"
            whileHover="hover"
            initial="initial"
          >
            {course.imageUrl ? (
              <img
                src={course.imageUrl}
                alt={course.title}
                className="absolute inset-0 w-full h-full object-cover rounded-sm"
              />
            ) : null}
            {!free && (
              <Badge
                variant="secondary"
                className="absolute top-4 py-1 left-4 z-10 backdrop-blur-sm border-0 bg-black/50"
              >
                <Lock className="w-3 h-3" />
              </Badge>
            )}
            {isNew && (
              <Badge
                variant="secondary"
                className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm border-0 text-white"
              >
                NEW
              </Badge>
            )}
            <motion.div
              variants={{
                initial: { opacity: 0 },
                hover: { opacity: 1 },
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-end justify-between p-4"
            >
              {free ? (
                <>
                  <motion.div
                    variants={{
                      initial: { opacity: 0, y: 10 },
                      hover: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-sm text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded"
                  >
                    {course.duration}
                  </motion.div>
                  <motion.div
                    variants={{
                      initial: { opacity: 0, scale: 0.8 },
                      hover: { opacity: 1, scale: 1 },
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white rounded-full p-3 shadow-lg"
                  >
                    <Play className="w-5 h-5 text-black fill-black" />
                  </motion.div>
                </>
              ) : (
                <motion.div
                  variants={{
                    initial: { opacity: 0, y: 10 },
                    hover: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="w-full flex items-center justify-center"
                >
                  <div className="text-sm text-white bg-black/50 backdrop-blur-sm px-4 py-2 rounded">
                    Subscribe to {course.teacher}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <div className="text-sm text-muted-foreground">{course.teacher}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {course.difficulty} · {course.martialArt}
                {/* · {free ? "Free" : `${course.price?.toFixed(2)}/mo`} */}
              </span>
              {/* {!free && course.price && (
                <Badge variant="outline" className="text-xs">
                  ${course.price.toFixed(2)}/mo
                </Badge>
              )}
              {free && (
                <Badge variant="outline" className="text-xs">
                  Free
                </Badge>
              )} */}
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="md:min-w-3xl max-h-[85vh] overflow-y-auto p-0">
        {/* Course image header */}
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full aspect-video object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full aspect-video bg-muted rounded-t-lg" />
        )}

        <div className="px-6 pb-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge variant="default">{course.difficulty}</Badge>
              <Badge variant="default">{course.martialArt}</Badge>
              {totalVolumes > 0 && (
                <Badge variant="secondary">
                  {totalVolumes} {totalVolumes === 1 ? "volume" : "volumes"}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-3xl mb-2">{course.title}</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">{course.description}</DialogDescription>
            <p className="text-md text-muted-foreground mt-2">
              Taught by <span className="font-bold text-foreground">{course.teacher}</span> · {course.duration}
            </p>
          </DialogHeader>

          {/* CTA */}
          <Card className="p-4 space-y-4">
            {hasAccess && enrollment ? (
            <div className="space-y-3">
              <div className="space-y-2">
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
              <Button asChild className="w-full">
                <Link href={`/courses/${course._id}`}>
                  <Play className="w-4 h-4 mr-2" />
                  Continue Watching
                </Link>
              </Button>
            </div>
          ) : hasAccess && !enrollment ? (
            <div className="space-y-2">
              <Button
                className="w-full text-center"
                onClick={() => enroll({ courseId: course._id })}
              >
                Start Course
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/courses/${course._id}`}>View Course</Link>
              </Button>
            </div>
          ) : free && !hasAccess ? (
            <SignUpButton mode="modal" forceRedirectUrl="/account-setup">
              <Button className="w-full text-center">
                Sign up to access
              </Button>
            </SignUpButton>
          ) : (
            <Button
              className="w-full text-center"
              disabled={isCheckoutLoading}
              onClick={async () => {
                setIsCheckoutLoading(true);
                try {
                  const url = await createSubscriptionCheckout({
                    instructorId: course.instructorId,
                    successUrl: window.location.href,
                    cancelUrl: window.location.href,
                  });
                  window.location.href = url;
                } catch {
                  setIsCheckoutLoading(false);
                }
              }}
            >
              {isCheckoutLoading
                ? "Redirecting..."
                : `Subscribe to ${course.teacher} from $${course.price?.toFixed(2)}/month`}
            </Button>
          )}
          </Card>
          {/* Volume breakdown */}
          {course.volumes && course.volumes.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold mb-4">
                Volumes
              </h4>
              <Accordion type="single" collapsible className="w-full">
                {course.volumes.map((volume, vi) => (
                  <AccordionItem key={vi} value={`volume-${vi}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {String(vi + 1).padStart(2, "0")}
                          </span>
                          <span className="font-medium text-sm">{volume.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDuration(volume.durationMinutes)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {volume.sections.length > 0 ? (
                        <div className="space-y-2 pt-2">
                          {volume.sections.map((section, si) => {
                            const sectionId = `${vi}-${si}`;
                            const isCompleted =
                              enrollment?.completedSections.includes(sectionId) ??
                              false;

                            return (
                              <div
                                key={si}
                                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-2">
                                  {enrollment ? (
                                    isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                                    ) : (
                                      <Circle className="w-4 h-4 shrink-0 text-muted-foreground" />
                                    )
                                  ) : null}
                                  <span
                                    className={`text-base ${isCompleted ? "line-through text-muted-foreground/70" : "text-foreground"}`}
                                  >
                                    {section.title}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  {formatDuration(section.durationMinutes)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground pt-2">
                          No sections available
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
