"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import BreakdownCard from "@/components/breakdown-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const breakdownTypes = ["All", "Discussion", "Spar", "Technique", "Breakdown"] as const;
type FilterType = (typeof breakdownTypes)[number];

export default function Page() {
  const [filter, setFilter] = useState<FilterType>("All");
  const breakdowns = useQuery(api.breakdowns.getAllBreakdowns);

  if (breakdowns === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[95vh]">
        <Spinner className="size-6" />
      </div>
    );
  }

  const filtered =
    filter === "All"
      ? breakdowns
      : breakdowns.filter((b) => b.type === filter);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex flex-col items-start justify-center gap-1">
          <h1 className="text-3xl font-bold">Breakdowns</h1>
          <p className="text-muted-foreground text-sm md:block hidden">
            Spars, rolls, technique breakdowns, and Q&amp;As from top
            instructors.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {breakdownTypes.map((type) => (
            <Button
              key={type}
              size="sm"
              variant={filter === type ? "default" : "outline"}
              onClick={() => setFilter(type)}
            >
              {type}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No breakdowns found.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filtered.map((breakdown) => (
              <BreakdownCard key={breakdown._id} breakdown={breakdown} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
