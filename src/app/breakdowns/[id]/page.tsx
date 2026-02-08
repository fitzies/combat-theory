"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import MuxVideoPlayer from "@/components/mux-video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, Lock } from "lucide-react";

import Link from "next/link";

export default function BreakdownWatchPage() {
  const params = useParams();
  const breakdownId = params.id as Id<"breakdowns">;

  const breakdown = useQuery(api.breakdowns.getBreakdownById, { breakdownId });
  const hasAccess = useQuery(api.breakdowns.hasAccessToBreakdown, {
    breakdownId,
  });
  const hasWatched = useQuery(api.breakdowns.hasWatchedBreakdown, {
    breakdownId,
  });
  const markWatched = useMutation(api.breakdowns.markBreakdownWatched);

  if (breakdown === undefined || hasAccess === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[95vh]">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (breakdown === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Breakdown not found</h1>
        <Link
          href="/breakdowns"
          className="text-muted-foreground hover:underline mt-4 inline-block"
        >
          Back to breakdowns
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back nav */}
      <Link
        href="/breakdowns"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to breakdowns
      </Link>

      <div className="space-y-6">
        {/* Video player — 11/12 width, centered */}
        <div className="w-full mx-auto">
          {hasAccess && breakdown.muxPlaybackId ? (
            <MuxVideoPlayer
              playbackId={breakdown.muxPlaybackId}
              title={breakdown.title}
              onEnded={() => {
                if (!hasWatched) markWatched({ breakdownId });
              }}
            />
          ) : hasAccess && !breakdown.muxPlaybackId ? (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
              {breakdown.imageUrl ? (
                <img
                  src={breakdown.imageUrl}
                  alt={breakdown.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Video not yet available
                </p>
              )}
            </div>
          ) : (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center relative">
              {breakdown.imageUrl && (
                <img
                  src={breakdown.imageUrl}
                  alt={breakdown.title}
                  className="w-full h-full object-cover rounded-lg opacity-50"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                  <Button variant="secondary">
                    Subscribe to {breakdown.teacher}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown info */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{breakdown.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{breakdown.type}</Badge>
            <Badge variant="outline">{breakdown.martialArt}</Badge>
            <span className="text-sm text-muted-foreground">
              {breakdown.teacher} · {breakdown.duration}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {breakdown.description}
          </p>

          {hasWatched && (
            <span className="text-sm text-primary font-medium">Watched ✓</span>
          )}
        </div>
      </div>
    </div>
  );
}
