'use client';

import { HomeNav } from './home/HomeNav';
import { HomeHero } from './home/HomeHero';
import { HomeHowItWorks } from './home/HomeHowItWorks';
import { HomeSampleExchange } from './home/HomeSampleExchange';
import { HomeRounds } from './home/HomeRounds';
import { HomeFooter } from './home/HomeFooter';

type HomePageProps = {
  isLoading: boolean;
  error: string | null;
  onStartConversation: () => void;
};

/**
 * The marketing surface. Scrolls normally, unlike the in-call view, which is
 * pinned to the viewport, so the root here must not clamp height or hide
 * overflow.
 */
export function HomePage({
  isLoading,
  error,
  onStartConversation,
}: HomePageProps) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <HomeNav isLoading={isLoading} onStartConversation={onStartConversation} />

      <main>
        <HomeHero
          isLoading={isLoading}
          error={error}
          onStartConversation={onStartConversation}
        />

        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="home-divider" />
        </div>

        <HomeHowItWorks />

        <HomeSampleExchange />

        <HomeRounds />
      </main>

      <HomeFooter />
    </div>
  );
}
