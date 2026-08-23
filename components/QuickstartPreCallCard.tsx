'use client';

import { Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DelphyOrb } from './DelphyAtmosphere';

type QuickstartPreCallCardProps = {
  isLoading: boolean;
  error: string | null;
  onStartConversation: () => void;
};

const ROUNDS = [
  { id: '01', label: 'Opening' },
  { id: '02', label: 'Pressure' },
  { id: '03', label: 'Closing' },
];

const RULES = [
  'It never states. It only asks.',
  'Answer well and the next round unlocks.',
  'One verdict, at the very end.',
];

export function QuickstartPreCallCard({
  isLoading,
  error,
  onStartConversation,
}: QuickstartPreCallCardProps) {
  return (
    <div className="relative mx-auto flex w-[min(92vw,36rem)] flex-col items-center px-2 text-center">
      {/* The orb rides with the wordmark rather than the viewport, so it stays
          centred behind "Delphy" on a laptop and on a tall phone alike. */}
      <DelphyOrb
        className="pointer-events-none absolute left-1/2 top-[7.5rem] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 opacity-90 sm:h-[36rem] sm:w-[36rem]"
      />

      {/* --- Masthead --------------------------------------------------- */}

      <div className="animate-fade-up relative flex w-full max-w-xs items-center gap-4">
        <span aria-hidden className="delphy-rule h-px flex-1" />
        <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Devil&apos;s advocate
        </p>
        <span aria-hidden className="delphy-rule h-px flex-1" />
      </div>

      <h1 className="animate-fade-up animate-fade-up-d1 relative mt-6 font-serif text-[4.5rem] font-normal leading-[0.92] tracking-[-0.02em] text-foreground sm:text-[5.5rem]">
        Delphy
      </h1>

      <p className="animate-fade-up animate-fade-up-d1 relative mt-5 max-w-[26rem] text-balance text-[15px] leading-7 text-muted-foreground">
        Bring a position you actually hold. Delphy will not tell you what it
        thinks &mdash; it only asks, and it goes straight for the weakest thing
        you just said.
      </p>

      {/* --- Round rail --------------------------------------------------
          Three rounds, only the first unlocked. The active round gets a lit
          track and a glow; the rest stay dim so the progression reads. --- */}

      <div
        className="animate-fade-up animate-fade-up-d2 relative mt-11 flex w-full max-w-sm items-center gap-2.5"
        role="list"
        aria-label="Session rounds"
      >
        {ROUNDS.map((round, i) => {
          const isActive = i === 0;
          return (
            <div
              key={round.id}
              role="listitem"
              className="flex flex-1 flex-col items-start gap-2.5"
            >
              <span
                aria-hidden
                className={`h-[2px] w-full rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary shadow-[0_0_12px_-1px_hsl(var(--primary)/0.7)]'
                    : 'bg-border'
                }`}
              />
              <span className="flex items-baseline gap-1.5">
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    isActive ? 'text-primary' : 'text-muted-foreground/50'
                  }`}
                >
                  {round.id}
                </span>
                <span
                  className={`text-[11px] tracking-wide ${
                    isActive ? 'text-foreground/85' : 'text-muted-foreground/50'
                  }`}
                >
                  {round.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* --- House rules -------------------------------------------------- */}

      <ul className="animate-fade-up animate-fade-up-d2 relative mt-10 flex w-full max-w-sm flex-col gap-3 border-t border-border/70 pt-8 text-left">
        {RULES.map((rule) => (
          <li
            key={rule}
            className="flex items-start gap-3 text-[13px] leading-6 text-muted-foreground"
          >
            <span
              aria-hidden
              className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.9)]"
            />
            {rule}
          </li>
        ))}
      </ul>

      {/* --- Call to action ----------------------------------------------- */}

      <Button
        onClick={onStartConversation}
        disabled={isLoading}
        className="delphy-cta animate-fade-up animate-fade-up-d3 relative mt-10 h-12 w-full max-w-sm rounded-xl bg-primary text-[13px] font-semibold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary disabled:opacity-70"
        aria-label={
          isLoading
            ? 'Starting session with Delphy'
            : 'Start session with Delphy'
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening the floor
          </>
        ) : (
          'Take the stand'
        )}
      </Button>

      <p className="animate-fade-up animate-fade-up-d3 relative mt-5 flex items-center gap-2 text-[11px] text-muted-foreground/70">
        <Mic aria-hidden className="h-3 w-3" />
        Microphone required &middot; interrupt it whenever you like
      </p>

      {error && (
        <p role="alert" className="relative mt-4 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
