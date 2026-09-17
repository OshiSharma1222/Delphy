import { MODE_COPY, type DelphyModeId } from '@/lib/delphy/modes';

type HomeSampleExchangeProps = {
  mode: DelphyModeId;
};

/**
 * Illustrative, not a recording. It exists to show the shape of the pressure,
 * and it is the clearest place to feel the difference between the two modes:
 * the same claim, questioned for two different reasons.
 */
export function HomeSampleExchange({ mode }: HomeSampleExchangeProps) {
  const copy = MODE_COPY[mode];

  return (
    <section id="sample" className="home-section bg-muted">
      <div className="mx-auto w-full max-w-3xl px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            A sample exchange
          </h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            {copy.name}
          </span>
        </div>

        <p className="mt-6 max-w-xl text-[15px] leading-8 text-muted-foreground">
          {copy.sampleIntro}
        </p>

        <div className="mt-12 flex flex-col gap-5">
          {copy.sample.map((turn, i) => {
            const isDelphy = turn.speaker === 'delphy';
            return (
              <div
                key={`${mode}-${i}`}
                className={`flex ${isDelphy ? 'justify-start' : 'justify-end'}`}
              >
                <div className="max-w-[85%] sm:max-w-[75%]">
                  <span
                    className={`block text-[10px] font-medium uppercase tracking-[0.18em] ${
                      isDelphy
                        ? 'text-primary'
                        : 'text-right text-muted-foreground/70'
                    }`}
                  >
                    {isDelphy ? 'Delphy' : 'You'}
                  </span>
                  <p
                    className={`mt-2 rounded-2xl px-5 py-3.5 text-[15px] leading-7 ${
                      isDelphy
                        ? 'rounded-tl-sm border border-border bg-card text-foreground'
                        : 'rounded-tr-sm bg-foreground/[0.055] text-muted-foreground'
                    }`}
                  >
                    {turn.line}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-[12px] text-muted-foreground/70">
          Illustrative transcript. Your session will not go like this, which is
          rather the point.
        </p>
      </div>
    </section>
  );
}
