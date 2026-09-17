import { MODE_COPY, type DelphyModeId } from '@/lib/delphy/modes';

/**
 * The one drawing on the page, and the fastest way to feel the difference
 * between the modes: both are shown the same claim, and they do visibly
 * different things to it.
 *
 * Drawn rather than photographed so it can read the accent tokens. Every
 * coloured stroke here is hsl(var(--primary)), which means the artwork
 * recolours with the mode along with the rest of the page, something a raster
 * asset could never do. It also costs nothing to download.
 */

type HomeAnatomyProps = {
  mode: DelphyModeId;
};

const ACCENT = 'hsl(var(--primary))';
const INK = 'hsl(var(--foreground))';
const FAINT = 'hsl(var(--border))';
const MUTED = 'hsl(var(--muted-foreground))';

/** Critical thinking: the claim is the tip, and the questions go underneath it. */
function CriticalDiagram() {
  const layers = [
    { y: 128, w: 300, label: 'The reason', sub: 'where the belief came from' },
    { y: 190, w: 330, label: 'The assumption', sub: 'what it quietly rests on' },
    { y: 252, w: 360, label: 'The test', sub: 'what would change it' },
  ];

  return (
    <svg
      viewBox="0 0 520 324"
      className="h-auto w-full"
      role="img"
      aria-labelledby="anatomy-critical-title anatomy-critical-desc"
    >
      <title id="anatomy-critical-title">
        What critical thinking mode does to a claim
      </title>
      <desc id="anatomy-critical-desc">
        The claim sits above a surface line. Below it, three widening layers are
        labelled the reason, the assumption and the test, with a probe running
        down the left connecting all three.
      </desc>

      <text
        x="96"
        y="34"
        fill={MUTED}
        fontSize="10"
        letterSpacing="1.8"
        fontWeight="500"
      >
        WHAT YOU SAY OUT LOUD
      </text>

      {/* The claim: the only part that ever gets said. */}
      <rect x="96" y="48" width="240" height="44" rx="9" fill={ACCENT} />
      <text
        x="114"
        y="76"
        fill="hsl(var(--primary-foreground))"
        fontSize="14"
        fontWeight="500"
      >
        Remote work makes us faster
      </text>

      {/* Waterline. Everything below it is what the mode goes after. */}
      <line x1="40" y1="106" x2="480" y2="106" stroke={FAINT} strokeWidth="1" />
      <text
        x="480"
        y="124"
        fill={MUTED}
        fontSize="10"
        letterSpacing="1.8"
        fontWeight="500"
        textAnchor="end"
      >
        WHAT IT STANDS ON
      </text>

      {/* The probe, descending past every layer rather than stopping at the first. */}
      <line
        x1="72"
        y1="96"
        x2="72"
        y2="292"
        stroke={ACCENT}
        strokeWidth="1.5"
        strokeDasharray="3 4"
        opacity="0.7"
      />
      <path d="M 66 292 L 72 302 L 78 292 Z" fill={ACCENT} opacity="0.7" />

      {layers.map((layer) => {
        const mid = layer.y + 22;
        return (
          <g key={layer.label}>
            <line
              x1="72"
              y1={mid}
              x2="96"
              y2={mid}
              stroke={ACCENT}
              strokeWidth="1.5"
              opacity="0.7"
            />
            <circle cx="72" cy={mid} r="4.5" fill={ACCENT} />
            <rect
              x="96"
              y={layer.y}
              width={layer.w}
              height="44"
              rx="9"
              fill={ACCENT}
              fillOpacity="0.07"
              stroke={ACCENT}
              strokeOpacity="0.35"
            />
            <text
              x="114"
              y={layer.y + 20}
              fill={INK}
              fontSize="13"
              fontWeight="500"
            >
              {layer.label}
            </text>
            <text x="114" y={layer.y + 36} fill={MUTED} fontSize="11.5">
              {layer.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Ragebait: the span is fine everywhere except one block, and that is where the load goes. */
function RagebaitDiagram() {
  const blocks = [0, 1, 2, 3, 4].map((i) => ({ i, x: 100 + i * 66 }));
  const weak = 2;
  const weakX = 100 + weak * 66;
  const weakMid = weakX + 30;

  return (
    <svg
      viewBox="0 0 520 324"
      className="h-auto w-full"
      role="img"
      aria-labelledby="anatomy-ragebait-title anatomy-ragebait-desc"
    >
      <title id="anatomy-ragebait-title">
        What ragebait mode does to a claim
      </title>
      <desc id="anatomy-ragebait-desc">
        A span of five blocks rests on two supports. One block is drawn as the
        weak joint, and the whole load is placed directly on it until it cracks.
      </desc>

      <text
        x="66"
        y="34"
        fill={MUTED}
        fontSize="10"
        letterSpacing="1.8"
        fontWeight="500"
      >
        THE POSITION YOU ARRIVED WITH
      </text>

      {/* The load, aimed at one block rather than spread across the span. */}
      <line
        x1={weakMid}
        y1="58"
        x2={weakMid}
        y2="146"
        stroke={ACCENT}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d={`M ${weakMid - 11} 146 L ${weakMid} 164 L ${weakMid + 11} 146 Z`}
        fill={ACCENT}
      />
      <line
        x1={weakMid - 34}
        y1="140"
        x2={weakMid - 26}
        y2="152"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <line
        x1={weakMid + 34}
        y1="140"
        x2={weakMid + 26}
        y2="152"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Piers, inset under the first and last block so the deck visibly rests
          on them. Sitting them outside the span left a gap at both ends. */}
      <rect x="100" y="214" width="34" height="62" rx="4" fill={INK} opacity="0.12" />
      <rect x="390" y="214" width="34" height="62" rx="4" fill={INK} opacity="0.12" />

      {/* The span. Four blocks are sound, one is not, and only one gets touched. */}
      {blocks.map((block) => {
        const isWeak = block.i === weak;
        return (
          <rect
            key={block.i}
            x={block.x}
            y="170"
            width="60"
            height="44"
            rx="5"
            fill={isWeak ? ACCENT : INK}
            fillOpacity={isWeak ? 0.1 : 0.07}
            stroke={isWeak ? ACCENT : FAINT}
            strokeWidth={isWeak ? 1.5 : 1}
            strokeDasharray={isWeak ? '4 3' : undefined}
          />
        );
      })}

      {/* The joint giving way. */}
      <polyline
        points={`${weakMid} 170, ${weakMid - 7} 186, ${weakMid + 6} 197, ${weakMid - 2} 214`}
        fill="none"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <line x1="40" y1="276" x2="480" y2="276" stroke={FAINT} strokeWidth="1" />

      <line
        x1={weakMid}
        y1="222"
        x2={weakMid}
        y2="248"
        stroke={ACCENT}
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <text
        x={weakMid}
        y="264"
        fill={ACCENT}
        fontSize="10"
        letterSpacing="1.8"
        fontWeight="500"
        textAnchor="middle"
      >
        THE WEAKEST JOINT
      </text>
    </svg>
  );
}

const CAPTION: Record<DelphyModeId, string> = {
  critical:
    'It goes under the claim rather than at it. The same position can survive all three layers and come out better attached to you than it went in.',
  ragebait:
    'It finds the one block the span cannot spare and puts the whole load there. Nothing else on the bridge gets touched.',
};

export function HomeAnatomy({ mode }: HomeAnatomyProps) {
  const copy = MODE_COPY[mode];

  return (
    <section id="anatomy" className="home-section">
      <div className="mx-auto w-full max-w-4xl px-6">
        <div data-reveal className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Where the question lands
          </h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            {copy.name}
          </span>
        </div>

        <div
          data-reveal
          style={{ '--reveal-delay': '90ms' } as React.CSSProperties}
          className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-10"
        >
          {mode === 'critical' ? <CriticalDiagram /> : <RagebaitDiagram />}
        </div>

        <p className="mt-8 max-w-xl text-[15px] leading-8 text-muted-foreground">
          {CAPTION[mode]}
        </p>
      </div>
    </section>
  );
}
