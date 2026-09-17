'use client';

import type { DelphyModeId } from '@/lib/delphy/modes';
import { HomeNav } from './home/HomeNav';
import { HomeHero } from './home/HomeHero';
import { HomeHowItWorks } from './home/HomeHowItWorks';
import { HomeAnatomy } from './home/HomeAnatomy';
import { HomeStarters } from './home/HomeStarters';
import { HomeSampleExchange } from './home/HomeSampleExchange';
import { HomeRounds } from './home/HomeRounds';
import { HomeFooter } from './home/HomeFooter';

type HomePageProps = {
  mode: DelphyModeId;
  onModeChange: (mode: DelphyModeId) => void;
  isLoading: boolean;
  error: string | null;
  onStartConversation: () => void;
};

/**
 * The marketing surface. Scrolls normally, unlike the in-call view, which is
 * pinned to the viewport, so the root here must not clamp height or hide
 * overflow.
 *
 * Every section takes `mode`: the page describes whichever Delphy the CTA is
 * about to start, so the choice is never abstract by the time it is made.
 */
export function HomePage({
  mode,
  onModeChange,
  isLoading,
  error,
  onStartConversation,
}: HomePageProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <HomeNav
        mode={mode}
        onModeChange={onModeChange}
        isLoading={isLoading}
        onStartConversation={onStartConversation}
      />

      <main id="main">
        <HomeHero
          mode={mode}
          onModeChange={onModeChange}
          isLoading={isLoading}
          error={error}
          onStartConversation={onStartConversation}
        />

        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="home-divider" />
        </div>

        <HomeHowItWorks mode={mode} />

        <HomeStarters mode={mode} />

        <HomeAnatomy mode={mode} />

        <HomeSampleExchange mode={mode} />

        <HomeRounds mode={mode} />
      </main>

      <HomeFooter />
    </div>
  );
}
