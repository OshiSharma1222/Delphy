// Illustrative, not a recording — it exists to show the shape of the pressure:
// every Delphy turn is a question, and each one targets the previous answer.
const EXCHANGE = [
  { speaker: 'delphy', line: 'What topic are you bringing me today?' },
  { speaker: 'you', line: 'Remote work makes engineering teams more productive.' },
  {
    speaker: 'delphy',
    line: 'Productive at what — output per person, or the things that only happen when people overlap?',
  },
  { speaker: 'you', line: 'Output per person. Our closed-ticket count went up.' },
  { speaker: 'delphy', line: 'Did the tickets get smaller?' },
  { speaker: 'you', line: '...possibly. We did start splitting them up.' },
  {
    speaker: 'delphy',
    line: 'So which number moved — the work, or the way you count it?',
  },
] as const;

export function HomeSampleExchange() {
  return (
    <section id="sample" className="home-section bg-muted">
      <div className="mx-auto w-full max-w-3xl px-6">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
          A sample exchange
        </h2>

        <p className="mt-6 max-w-xl text-[15px] leading-8 text-muted-foreground">
          Notice that it never argues the other side. It just keeps asking the
          question you would rather it skipped.
        </p>

        <div className="mt-12 flex flex-col gap-5">
          {EXCHANGE.map((turn, i) => {
            const isDelphy = turn.speaker === 'delphy';
            return (
              <div
                key={i}
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
