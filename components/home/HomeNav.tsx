'use client';

import { Button } from '@/components/ui/button';

type HomeNavProps = {
  isLoading: boolean;
  onStartConversation: () => void;
};

export function HomeNav({ isLoading, onStartConversation }: HomeNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6"
        aria-label="Main"
      >
        <span className="font-serif text-xl tracking-tight text-foreground">
          Delphy
        </span>

        <div className="flex items-center gap-6">
          {/* Anchors are hidden on small screens, the page is short enough to scroll. */}
          <a
            href="#how-it-works"
            className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            How it works
          </a>
          <a
            href="#sample"
            className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Sample
          </a>
          <Button
            onClick={onStartConversation}
            disabled={isLoading}
            className="home-cta h-9 rounded-full bg-foreground px-4 text-[13px] font-medium text-background hover:bg-foreground/90 disabled:opacity-60"
          >
            Start a round
          </Button>
        </div>
      </nav>
    </header>
  );
}
