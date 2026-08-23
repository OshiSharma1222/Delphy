const ROUNDS = [
  {
    id: '01',
    label: 'Opening',
    body: 'It finds out what you are defending, and what you actually believe about it.',
  },
  {
    id: '02',
    label: 'Pressure',
    body: 'It picks the softest part of your last answer and stays there until it gives.',
  },
  {
    id: '03',
    label: 'Closing',
    body: 'It tests whether the position you are left holding is still the one you walked in with.',
  },
];

export function HomeRounds() {
  return (
    <section id="rounds" className="home-section mx-auto w-full max-w-5xl px-6">
      <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        Three rounds
      </h2>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {ROUNDS.map((round) => (
          <article
            key={round.id}
            className="rounded-2xl border border-border bg-card p-7"
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
