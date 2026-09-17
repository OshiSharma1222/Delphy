import { MODE_COPY, type DelphyModeId } from '@/lib/delphy/modes';

type HomeHowItWorksProps = {
  mode: DelphyModeId;
};

export function HomeHowItWorks({ mode }: HomeHowItWorksProps) {
  const copy = MODE_COPY[mode];

  return (
    <section
      id="how-it-works"
      className="home-section mx-auto w-full max-w-5xl px-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          How it works
        </h2>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          {copy.name}
        </span>
      </div>

      <ol className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-3">
        {copy.steps.map((step) => (
          <li key={`${mode}-${step.n}`} className="border-t border-border pt-6">
            <span className="font-mono text-[11px] tabular-nums text-primary">
              {step.n}
            </span>
            <h3 className="mt-4 font-serif text-2xl tracking-tight text-foreground">
              {step.title}
            </h3>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
