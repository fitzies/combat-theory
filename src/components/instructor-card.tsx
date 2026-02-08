"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Doc } from "../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

type InstructorCardProps = {
  instructor: Doc<"instructors">;
  courseCount: number;
};

export default function InstructorCard({
  instructor,
  courseCount,
}: InstructorCardProps) {
  const courses = useQuery(api.courses.getCoursesByInstructor, {
    instructorId: instructor._id,
  });
  const createSubscriptionCheckout = useAction(api.stripe.createSubscriptionCheckout);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  return (
    <Dialog>
      <DialogTrigger className="flex items-start justify-start w-full h-full">
        <Card className="overflow-hidden p-0 bg-transparent border-transparent shadow-none rounded-none w-full h-[320px] flex flex-col">
          <motion.div
            className="relative bg-muted aspect-square w-full cursor-pointer rounded-sm flex-shrink-0"
            whileHover="hover"
            initial="initial"
          >
            {instructor.imageUrl ? (
              <img
                src={instructor.imageUrl}
                alt={instructor.name}
                className="absolute inset-0 w-full h-full object-cover rounded-sm"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <motion.div
              variants={{
                initial: { opacity: 0 },
                hover: { opacity: 1 },
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/40 flex items-end p-4"
            >
              <motion.div
                variants={{
                  initial: { opacity: 0, y: 10 },
                  hover: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-full flex items-center justify-center"
              >
                <div className="text-sm text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded">
                  ${instructor.subscriptionPrice.toFixed(2)} / mth
                </div>
                <div className="flex items-center gap-1.5 text-sm text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded">
                  <BookOpen className="w-3.5 h-3.5" />
                  {courseCount} {courseCount === 1 ? "course" : "courses"}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          <div className="space-y-1 flex-1 flex flex-col min-h-[80px]">
            <div className="flex items-center justify-start gap-2 flex-wrap">
              <h3 className="font-semibold text-lg text-left line-clamp-1">
                {instructor.name}
              </h3>
              {instructor.disciplines.map((discipline) => (
                <Badge key={discipline} variant="outline" className="text-xs">
                  {discipline}
                </Badge>
              ))}
            </div>
            {instructor.bio && (
              <p className="text-sm text-muted-foreground line-clamp-1 text-left">
                {instructor.bio}
              </p>
            )}
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="md:min-w-3xl max-h-[85vh] overflow-y-auto p-0">
        {/* Instructor image header */}
        {instructor.imageUrl ? (
          <img
            src={instructor.imageUrl}
            alt={instructor.name}
            className="w-full aspect-video object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full aspect-video bg-muted rounded-t-lg flex items-center justify-center">
            <User className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        <div className="px-6 pb-6 space-y-6">
          <DialogHeader>
            {/* <div className="flex items-center gap-2 flex-wrap">
              {instructor.disciplines.map((discipline) => (
                <Badge key={discipline} variant="outline">
                  {discipline}
                </Badge>
              ))}
            </div> */}
            <DialogTitle className="text-2xl">{instructor.name}</DialogTitle>
            {instructor.bio && (
              <DialogDescription>{instructor.bio}</DialogDescription>
            )}
          </DialogHeader>

          {/* Subscription price */}
          <Button
            className="w-full text-center"
            disabled={isCheckoutLoading}
            onClick={async () => {
              setIsCheckoutLoading(true);
              try {
                const url = await createSubscriptionCheckout({
                  instructorId: instructor._id,
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
              : `Subscribe to ${instructor.name} from $${instructor.subscriptionPrice.toFixed(2)}/month`}
          </Button>

          {/* Instructor courses */}
          {courses && courses.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Courses ({courses.length})
              </h4>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{course.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{course.difficulty}</span>
                        <span>·</span>
                        <span>{course.martialArt}</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </div>
                      </div>
                    </div>
                    {!course.price || course.price === 0 ? (
                      <Badge
                        variant="secondary"
                        className="text-xs text-green-600 dark:text-green-400"
                      >
                        Free
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        ${course.price.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
