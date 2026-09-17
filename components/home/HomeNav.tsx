'use client';

import { Button } from '@/components/ui/button';
import { MODE_COPY, MODE_LIST, type DelphyModeId } from '@/lib/delphy/modes';

type HomeNavProps = {
  mode: DelphyModeId;
  onModeChange: (mode: DelphyModeId) => void;
  isLoading: boolean;
  onStartConversation: () => void;
};

export function HomeNav({
  mode,
  onModeChange,
  isLoading,
  onStartConversation,
}: HomeNavProps) {
  const copy = MODE_COPY[mode];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-6"
        aria-label="Main"
      >
        <span className="font-serif text-xl tracking-tight text-foreground">
          Delphy
        </span>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Anchors are hidden on small screens, the page is short enough to scroll. */}
          <a
            href="#how-it-works"
            className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            How it works
          </a>
          <a
            href="#sample"
            className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Sample
          </a>

          {/* Compact mirror of the hero selector, so the mode stays switchable
              once the hero has scrolled away. */}
          <div
            role="radiogroup"
            aria-label="Delphy mode"
            className="hidden items-center gap-1 rounded-full border border-border bg-card p-0.5 sm:flex"
          >
            {MODE_LIST.map((option) => {
              const isSelected = option.id === mode;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isLoading}
                  onClick={() => onModeChange(option.id)}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.name}
                </button>
              );
            })}
          </div>

          <Button
            onClick={onStartConversation}
            disabled={isLoading}
            className="home-cta h-9 shrink-0 rounded-full bg-foreground px-4 text-[13px] font-medium text-background hover:bg-foreground/90 disabled:opacity-60"
            aria-label={`Start ${copy.name} session with Delphy`}
          >
            Start
          </Button>
        </div>
      </nav>
    </header>
  );
}
