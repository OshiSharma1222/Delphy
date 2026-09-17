import { MODE_COPY, type DelphyModeId } from '@/lib/delphy/modes';

type HomeStartersProps = {
  mode: DelphyModeId;
};

/**
 * The blank-page problem, but worse, because the page is a microphone and the
 * silence is audible. Everything else on this page explains what Delphy does
 * and none of it answers "what do I say first".
 *
 * Deliberately not buttons. You say these out loud, so a click target would be
 * promising something the interface cannot do.
 */
export function HomeStarters({ mode }: HomeStartersProps) {
  const copy = MODE_COPY[mode];

  return (
    <section
      id="starters"
      className="home-section mx-auto w-full max-w-5xl px-6"
    >
      <div data-reveal className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Something to bring
        </h2>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          {copy.name}
        </span>
      </div>

      <p className="mt-6 max-w-xl text-[15px] leading-8 text-muted-foreground">
        {copy.startersIntro}
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {copy.starters.map((starter, index) => (
          <li
            key={`${mode}-${starter}`}
            data-reveal
            style={
              { '--reveal-delay': `${index * 70}ms` } as React.CSSProperties
            }
            className="lift flex gap-3 rounded-2xl border border-border bg-card px-6 py-5"
          >
            <span
              aria-hidden
              className="select-none font-serif text-2xl leading-none text-primary/50"
            >
              &ldquo;
            </span>
            <p className="font-serif text-[17px] leading-7 text-foreground">
              {starter}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
