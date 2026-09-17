'use client';

import Image from 'next/image';
import { Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MODE_COPY, type DelphyModeId } from '@/lib/delphy/modes';
import { HomeModeSwitch } from './HomeModeSwitch';

type HomeHeroProps = {
  mode: DelphyModeId;
  onModeChange: (mode: DelphyModeId) => void;
  isLoading: boolean;
  error: string | null;
  onStartConversation: () => void;
};

export function HomeHero({
  mode,
  onModeChange,
  isLoading,
  error,
  onStartConversation,
}: HomeHeroProps) {
  const copy = MODE_COPY[mode];

  return (
    <section className="home-section mx-auto w-full max-w-5xl px-6 text-center">
      <p className="animate-fade-up text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        Think out loud &middot; voice
      </p>

      {/* Keyed on mode so the swap replays the entry animation instead of
          silently swapping words under the reader. */}
      <h1
        key={`${mode}-heading`}
        className="animate-fade-up animate-fade-up-d1 mx-auto mt-7 max-w-3xl text-balance font-serif text-[2.75rem] font-normal leading-[1.06] tracking-[-0.02em] text-foreground sm:text-6xl md:text-7xl"
      >
        {copy.heroHeading}
      </h1>

      <p
        key={`${mode}-body`}
        className="animate-fade-up animate-fade-up-d2 mx-auto mt-7 max-w-xl text-balance text-[16px] leading-8 text-muted-foreground"
      >
        {copy.heroBody}
      </p>

      {/* The mode choice sits above the CTA because it changes what the CTA
          starts, and the button label moves with it. */}
      <div className="animate-fade-up animate-fade-up-d3 mx-auto mt-12 w-full max-w-2xl">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Pick how it questions you
        </p>
        <HomeModeSwitch
          mode={mode}
          onModeChange={onModeChange}
          disabled={isLoading}
        />
      </div>

      <div className="animate-fade-up animate-fade-up-d3 mt-9 flex flex-col items-center">
        <Button
          onClick={onStartConversation}
          disabled={isLoading}
          className="home-cta h-12 rounded-full bg-primary px-8 text-[14px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
          aria-label={
            isLoading
              ? `Starting ${copy.name} session with Delphy`
              : `Start ${copy.name} session with Delphy`
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {copy.ctaLoadingLabel}
            </>
          ) : (
            copy.ctaLabel
          )}
        </Button>

        <p className="mt-5 flex items-center gap-2 text-[12px] text-muted-foreground">
          <Mic aria-hidden className="h-3 w-3" />
          {copy.micNote}
        </p>

        {error && (
          <p role="alert" className="mt-4 text-[13px] text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* The face-off closes the hero. Background was cut to transparency so the
          figures sit on the canvas directly rather than in a white box. */}
      <div className="animate-fade-up animate-fade-up-d3 mt-16 flex justify-center">
        <Image
          src="/delphy-face-off.webp"
          alt="A man and a robot facing each other at eye level"
          width={720}
          height={480}
          priority
          sizes="(max-width: 640px) 92vw, 36rem"
          className="h-auto w-full max-w-xl"
        />
      </div>
    </section>
  );
}
