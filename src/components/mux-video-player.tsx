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
        "--media-primary-color": "#2a2a2a",
        "--media-secondary-color": "rgba(0, 0, 0, 0.75)",
        "--media-control-background": "transparent",
        "--media-control-hover-background": "rgba(255, 255, 255, 0.1)",
        "--media-range-track-background": "rgba(255, 255, 255, 0.2)",
        "--media-range-thumb-background": "#ffe0c2",
        "--volume-range": "none",
        "--pip-button": "none",
        "--captions-button": "none",
        "--airplay-button": "none",
        "--cast-button": "none",
        "--rendition-selectmenu": "none",
        "--duration-display": "none",
      }}
    />
    </div>
  );
}
