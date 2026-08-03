"use client";

import { useRef, useState } from "react";

export default function AudioPlayer({
  title,
  src,
}: {
  title: string;
  src: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="flex items-center gap-4 border-b border-line py-5">
      <button
        type="button"
        onClick={toggle}
        className="font-mono-ui shrink-0 text-xs uppercase tracking-wide text-muted hover:text-ink"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "Pause" : "Play"}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg leading-tight">{title}</p>
        <div className="mt-3 h-px w-full bg-line">
          <div
            className="h-px bg-ink transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (!el.duration) return;
          setProgress(el.currentTime / el.duration);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
      />
    </div>
  );
}
