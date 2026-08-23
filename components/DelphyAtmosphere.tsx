/**
 * The stage Delphy speaks from — a dark room with one warm lamp.
 *
 * Both exports are purely decorative: `aria-hidden`, `pointer-events-none`,
 * and drawn with SVG/CSS rather than image files, so there is no asset to
 * ship, nothing to preload, and nothing that softens on a 4K display.
 *
 * Split into two pieces on purpose:
 *   - `DelphyAtmosphere` is fixed to the viewport (bloom, grain, vignette).
 *   - `DelphyOrb` is laid out by its parent, so it stays locked behind the
 *     wordmark at any viewport height instead of drifting away from it.
 */

export function DelphyAtmosphere() {
  return (
    <div
      aria-hidden
      className="delphy-atmosphere pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Key light, high and centred — sits behind the wordmark. */}
      <div className="delphy-bloom absolute left-1/2 top-[34%] h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />

      {/* Cool counter-light, low and off-axis so the field is never symmetrical. */}
      <div className="delphy-counterlight absolute -bottom-32 left-[18%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full" />

      {/* Grain sits above the light and below the vignette. */}
      <div className="delphy-grain absolute inset-0" />

      {/* Corners fall away, pulling the eye to the centre. */}
      <div className="delphy-vignette absolute inset-0" />
    </div>
  );
}

export function DelphyOrb({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden
      focusable="false"
      className={className}
    >
      <defs>
        {/* Warm at the centre, cooling as it falls off — the same ramp the
            in-call agent visualizer uses, so the two screens feel related. */}
        <radialGradient id="delphy-core-fill" cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            stopColor="hsl(var(--viz-stop-1))"
            stopOpacity="0.42"
          />
          <stop
            offset="42%"
            stopColor="hsl(var(--viz-stop-2))"
            stopOpacity="0.14"
          />
          <stop
            offset="100%"
            stopColor="hsl(var(--viz-stop-3))"
            stopOpacity="0"
          />
        </radialGradient>

        <linearGradient id="delphy-ring-stroke" x1="0%" y1="0%" x2="85%" y2="100%">
          <stop
            offset="0%"
            stopColor="hsl(var(--viz-stop-1))"
            stopOpacity="0.75"
          />
          <stop
            offset="55%"
            stopColor="hsl(var(--viz-stop-2))"
            stopOpacity="0.16"
          />
          <stop
            offset="100%"
            stopColor="hsl(var(--viz-stop-3))"
            stopOpacity="0.55"
          />
        </linearGradient>
      </defs>

      {/* Soft body of the orb. */}
      <circle
        className="delphy-orb-core"
        cx="200"
        cy="200"
        r="198"
        fill="url(#delphy-core-fill)"
      />

      {/* Solid rings, drifting slowly clockwise. */}
      <g className="delphy-orb-ring-a">
        <circle
          cx="200"
          cy="200"
          r="152"
          fill="none"
          stroke="url(#delphy-ring-stroke)"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="200"
          r="118"
          fill="none"
          stroke="url(#delphy-ring-stroke)"
          strokeWidth="0.75"
          strokeOpacity="0.55"
        />
      </g>

      {/* Dashed outer ring, counter-rotating so the orb never reads as static. */}
      <g className="delphy-orb-ring-b">
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="url(#delphy-ring-stroke)"
          strokeWidth="0.75"
          strokeDasharray="1.5 11"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
