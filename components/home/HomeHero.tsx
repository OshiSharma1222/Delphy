'use client';

import { Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HomeHeroProps = {
  isLoading: boolean;
  error: string | null;
  onStartConversation: () => void;
};

export function HomeHero({
  isLoading,
  error,
  onStartConversation,
}: HomeHeroProps) {
  return (
    <section className="home-section mx-auto w-full max-w-5xl px-6 text-center">
      <p className="animate-fade-up text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
        Devil&apos;s advocate &middot; voice
      </p>

      <h1 className="animate-fade-up animate-fade-up-d1 mx-auto mt-7 max-w-3xl text-balance font-serif text-[2.75rem] font-normal leading-[1.06] tracking-[-0.02em] text-foreground sm:text-6xl md:text-7xl">
        It will not tell you what it thinks.
      </h1>

      <p className="animate-fade-up animate-fade-up-d2 mx-auto mt-7 max-w-xl text-balance text-[16px] leading-8 text-muted-foreground">
        Bring a position you actually hold and say it out loud. Delphy answers
        only in questions, and goes straight for the weakest thing you
        just said.
      </p>

      <div className="animate-fade-up animate-fade-up-d3 mt-10 flex flex-col items-center">
        <Button
          onClick={onStartConversation}
          disabled={isLoading}
          className="home-cta h-12 rounded-full bg-primary px-8 text-[14px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
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

        <p className="mt-5 flex items-center gap-2 text-[12px] text-muted-foreground">
          <Mic aria-hidden className="h-3 w-3" />
          Microphone required &middot; interrupt it whenever you like
        </p>

        {error && (
          <p role="alert" className="mt-4 text-[13px] text-destructive">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
