"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { UserProfile } from "@clerk/nextjs";
import { User, Settings, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { BeltSelector, BELT_CONFIGS } from "@/components/belt-select";
import CourseCard from "@/components/course-card";

const TABS = [
  { id: "me", label: "Me", icon: User },
  { id: "account", label: "Account", icon: Settings },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
] as const;

type Tab = (typeof TABS)[number]["id"];

const BELT_DISCIPLINE_NAMES = Object.keys(BELT_CONFIGS);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("me");
  const user = useQuery(api.users.getUser);
  const enrollments = useQuery(api.enrollments.getUserEnrollments);
  const updateBelts = useMutation(api.users.updateUserBelts);

  if (user === undefined || enrollments === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[95vh]">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[95vh]">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  const beltDisciplines = user.disciplines.filter((d) =>
    BELT_DISCIPLINE_NAMES.includes(d),
  );

  const handleBeltChange = (
    discipline: string,
    belt: string,
    stripe: number,
    dan: number,
  ) => {
    const otherBelts = (user.belts ?? []).filter(
      (b) => b.discipline !== discipline,
    );
    const updated = [
      ...otherBelts,
      {
        discipline,
        belt,
        stripe: stripe > 0 ? stripe : undefined,
        dan: dan > 0 ? dan : undefined,
      },
    ];
    updateBelts({ belts: updated });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <nav className="md:w-56 shrink-0">
          {/* Mobile: horizontal tabs */}
          <div className="flex md:flex-col gap-1 overflow-x-auto md:sticky md:top-24">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap w-full text-left",
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {activeTab === "me" && (
            <div className="space-y-10">
              {/* Profile Header */}
              <div className="flex items-center gap-5">
                <Avatar className="size-20">
                  <AvatarImage src={user.imageUrl} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">@{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.country}</p>
                </div>
              </div>

              {/* Info Section */}
              <section className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Disciplines
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.disciplines.map((d) => (
                      <Badge key={d} variant="outline">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Goals
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.goals.map((g) => (
                      <Badge key={g} variant="secondary">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              </section>

              {/* Belt Ranks */}
              {beltDisciplines.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Belt Ranks
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {beltDisciplines.map((discipline) => {
                      const config = BELT_CONFIGS[discipline];
                      if (!config) return null;
                      const saved = user.belts?.find(
                        (b) => b.discipline === discipline,
                      );

                      return (
                        <div key={discipline} className="space-y-2">
                          <h3 className="text-sm font-medium text-muted-foreground text-center">
                            {discipline}
                          </h3>
                          <BeltSelector
                            belts={config.belts}
                            maxStripes={config.maxStripes}
                            maxDan={config.maxDan}
                            initialBelt={saved?.belt}
                            initialStripe={saved?.stripe}
                            initialDan={saved?.dan}
                            onChange={(belt, stripe, dan) =>
                              handleBeltChange(discipline, belt, stripe, dan)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Started Courses */}
              {enrollments.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    My Courses
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments
                      .filter(
                        (e): e is NonNullable<typeof e> => e !== null,
                      )
                      .map((enrollment) => (
                        <CourseCard
                          key={enrollment._id}
                          course={enrollment.course}
                        />
                      ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === "account" && (
            <div className="flex justify-center [&_.cl-rootBox]:w-full [&_.cl-card]:shadow-none [&_.cl-card]:border-0 [&_.cl-card]:bg-transparent [&_.cl-navbar]:hidden">
              <UserProfile
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    cardBox: "w-full shadow-none",
                    card: "w-full shadow-none border-0",
                  },
                }}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SlidersHorizontal className="size-10 text-muted-foreground/50 mb-4" />
              <h2 className="text-lg font-semibold">Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Settings coming soon.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
