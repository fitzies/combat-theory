"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Doc } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

type EnrichedBreakdown = Doc<"breakdowns"> & { teacher: string };

type BreakdownCardProps = {
  breakdown: EnrichedBreakdown;
};

export default function BreakdownCard({ breakdown }: BreakdownCardProps) {
  const hasAccess = useQuery(api.breakdowns.hasAccessToBreakdown, {
    breakdownId: breakdown._id,
  });

  return (
    <Link href={`/breakdowns/${breakdown._id}`}>
    <Card className="overflow-hidden p-0 bg-transparent border-transparent rounded-none shadow-none cursor-pointer">
      <motion.div
        className="relative bg-muted aspect-video w-full cursor-pointer rounded-sm"
        whileHover="hover"
        initial="initial"
      >
        {breakdown.imageUrl ? (
          <img
            src={breakdown.imageUrl}
            alt={breakdown.title}
            className="absolute inset-0 w-full h-full object-cover rounded-sm"
          />
        ) : null}
        {!hasAccess && (
          <Badge
            variant="secondary"
            className="absolute top-4 py-1 left-4 z-10 backdrop-blur-sm border-0 bg-black/50"
          >
            <Lock className="w-3 h-3" />
          </Badge>
        )}
        <Badge
          variant="secondary"
          className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm border-0 text-white"
        >
          {breakdown.type}
        </Badge>
        <motion.div
          variants={{
            initial: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-end justify-between p-4"
        >
          {hasAccess ? (
            <>
              <motion.div
                variants={{
                  initial: { opacity: 0, y: 10 },
                  hover: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-sm text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded"
              >
                {breakdown.duration}
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
                Subscribe to {breakdown.teacher}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      <div className="space-y-1 pt-2">
        <h3 className="font-semibold text-sm line-clamp-2">{breakdown.title}</h3>
        <div className="text-xs text-muted-foreground">
          {breakdown.teacher} · {breakdown.martialArt}
        </div>
      </div>
    </Card>
    </Link>
  );
}
