'use client';

import { useEffect, useRef, useState } from 'react';

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Elapsed time since the call view opened.
 *
 * Owns its own state so the one-second tick re-renders this span and nothing
 * else. Lifting it into ConversationComponent would re-render the visualizer,
 * the transcript, and the control dock once a second for a two digit change.
 *
 * Deliberately not a live region: a timer that announces itself every second is
 * unusable with a screen reader. The label carries the value for anyone who
 * navigates to it.
 */
export function SessionTimer() {
  // Held in a ref and stamped from the effect, never during render: reading the
  // clock while rendering is impure, and the ref keeps the start instant across
  // StrictMode's simulated remount so the clock does not restart.
  const startedAtRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
    const startedAt = startedAtRef.current;
    // Recomputed from the start instant rather than accumulated, so a
    // throttled background tab resumes at the right time instead of drifting.
    const tick = () => setElapsedMs(Date.now() - startedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const label = formatElapsed(elapsedMs);
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor(elapsedMs / 1000) % 60;

  return (
    <span
      className="hidden shrink-0 font-mono text-xs tabular-nums text-muted-foreground sm:inline"
      aria-label={`Session time ${minutes} minutes ${seconds} seconds`}
      title="Time in this session"
    >
      {label}
    </span>
  );
}
