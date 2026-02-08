"use client";

import MuxPlayer from "@mux/mux-player-react/lazy";

type MuxVideoPlayerProps = {
  playbackId: string;
  title?: string;
  onEnded?: () => void;
};

export default function MuxVideoPlayer({
  playbackId,
  title,
  onEnded,
}: MuxVideoPlayerProps) {
  return (
    <div onContextMenu={(e) => e.preventDefault()}>
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      accentColor="#ffe0c2"
      // maxResolution="1080p"
      minResolution="1080p"
      metadata={{
        video_title: title,
      }}
      onEnded={onEnded}
      className="w-full aspect-video rounded-lg"
      style={{
        "--media-primary-color": "rgba(42, 42, 42, 0.9)",
        "--media-secondary-color": "rgba(0, 0, 0, 0.6)",
        "--media-control-background": "rgba(0, 0, 0, 0.4)",
        "--media-control-hover-background": "rgba(255, 255, 255, 0.2)",
        "--media-range-track-background": "rgba(255, 255, 255, 0.3)",
        "--media-range-thumb-background": "#ffe0c2",
        "--volume-range": "initial",
        "--pip-button": "initial",
        "--captions-button": "initial",
        "--airplay-button": "initial",
        "--cast-button": "initial",
        "--rendition-selectmenu": "initial",
        "--duration-display": "initial",
      }}
    />
    </div>
  );
}
