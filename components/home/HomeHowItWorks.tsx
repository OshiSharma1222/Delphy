const STEPS = [
  {
    n: '01',
    title: 'Bring a position',
    body: 'Say something you actually believe. The stronger your conviction, the more there is to test.',
  },
  {
    n: '02',
    title: 'It only asks',
    body: 'Delphy never states, never agrees, never takes a side. Every turn is a single question aimed at your weakest link.',
  },
  {
    n: '03',
    title: 'One verdict',
    body: 'Hold up across three rounds and you get the only statement it will ever make — right at the end.',
  },
];

export function HomeHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="home-section mx-auto w-full max-w-5xl px-6"
    >
      <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        How it works
      </h2>

      <ol className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.n} className="border-t border-border pt-6">
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
