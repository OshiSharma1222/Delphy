'use client';

// Deterministic heights: a random array would differ between the server and
// client render, and the bars only need to look uneven, not be uneven.
const SKELETON_BAR_HEIGHTS = Array.from(
  { length: 28 },
  (_, index) => `${20 + ((index * 17) % 60)}%`,
);

/**
 * Stands in for ConversationComponent while its browser-only bundle loads.
 *
 * It mirrors QuickstartConversationLayout region for region: header, transcript
 * rail, visualizer, control dock. The previous version used fixed positioning
 * that matched nothing in the real layout, so the swap moved every element on
 * screen at once.
 */
export function LoadingSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 animate-pulse flex-col"
      role="status"
      aria-label="Loading the conversation"
    >
      {/* Header: brand block and metrics on the left, status and exit on the right. */}
      <div className="flex shrink-0 flex-col gap-4 border-b border-border px-4 py-4 md:h-[76px] md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-56 rounded bg-muted/70" />
          </div>
        </div>
        <div className="flex items-center gap-3 md:pr-1">
          <div className="h-2 w-2 rounded-full bg-muted" />
          <div className="h-8 w-36 rounded-md bg-muted" />
        </div>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 px-4 pb-4 pt-4 md:px-6 lg:flex-row lg:gap-0">
        {/* Transcript rail: below the stage on small screens, beside it on large. */}
        <div className="order-2 h-64 min-h-0 w-full shrink-0 lg:order-1 lg:h-full lg:w-[26rem]">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/60">
            <div className="flex h-14 shrink-0 flex-col justify-center gap-2 border-b border-border px-4">
              <div className="h-3.5 w-24 rounded bg-muted" />
              <div className="h-2.5 w-32 rounded bg-muted/70" />
            </div>
            <div className="flex flex-1 flex-col gap-5 px-4 py-4">
              <div className="flex flex-col items-start gap-1.5">
                <div className="h-2 w-16 rounded bg-muted/70" />
                <div className="h-14 w-3/4 rounded-2xl rounded-tl-sm bg-muted" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="h-2 w-10 rounded bg-muted/70" />
                <div className="h-10 w-2/3 rounded-2xl rounded-tr-sm bg-muted/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Stage: visualizer above, control dock below. */}
        <div className="order-1 flex min-h-0 flex-1 flex-col lg:order-2 lg:border-l lg:border-border/80 lg:pl-6">
          <div className="flex min-h-0 flex-1 flex-col pb-2 pt-3 md:pb-6">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="flex h-32 w-full max-w-md items-end justify-center gap-1.5">
                {SKELETON_BAR_HEIGHTS.map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-muted"
                    style={{ height }}
                  />
                ))}
              </div>
            </div>
            <div className="shrink-0 pt-4">
              <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2">
                <div className="h-12 w-12 rounded-full bg-muted sm:h-14 sm:w-14" />
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="h-1 w-24 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only">Connecting to Delphy</span>
    </div>
  );
}
