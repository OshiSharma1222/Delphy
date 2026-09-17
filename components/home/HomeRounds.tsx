import { MODE_COPY, type DelphyModeId } from '@/lib/delphy/modes';

type HomeRoundsProps = {
  mode: DelphyModeId;
};

export function HomeRounds({ mode }: HomeRoundsProps) {
  const copy = MODE_COPY[mode];

  return (
    <section id="rounds" className="home-section mx-auto w-full max-w-5xl px-6">
      <h2
        data-reveal
        className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground"
      >
        {copy.roundsHeading}
      </h2>

      {/* Ragebait runs three rounds, critical thinking four questions, so the
          grid follows the content rather than assuming a fixed count. */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
        {copy.rounds.map((round, index) => (
          <article
            key={`${mode}-${round.id}`}
            data-reveal
            style={
              { '--reveal-delay': `${index * 80}ms` } as React.CSSProperties
            }
            className="lift rounded-2xl border border-border bg-card p-7"
          >
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono text-[11px] tabular-nums text-primary">
                {round.id}
              </span>
              <h3 className="text-[13px] font-medium uppercase tracking-[0.14em] text-foreground">
                {round.label}
              </h3>
            </div>
            <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
              {round.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
