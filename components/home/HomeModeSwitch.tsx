'use client';

import { Check, Compass, Flame } from 'lucide-react';
import { MODE_LIST, type DelphyModeId } from '@/lib/delphy/modes';

const MODE_ICON: Record<DelphyModeId, typeof Compass> = {
  critical: Compass,
  ragebait: Flame,
};

type HomeModeSwitchProps = {
  mode: DelphyModeId;
  onModeChange: (mode: DelphyModeId) => void;
  /** Locked while a session is starting, the persona is fixed at invite time. */
  disabled?: boolean;
};

/**
 * The one choice on the page. Native radios do the keyboard work (arrow keys
 * move between options, space selects) and stay inside the label, so the whole
 * card is the hit target without any custom key handling.
 */
export function HomeModeSwitch({
  mode,
  onModeChange,
  disabled = false,
}: HomeModeSwitchProps) {
  return (
    <fieldset className="w-full" disabled={disabled}>
      <legend className="sr-only">Choose how Delphy questions you</legend>

      <div className="grid gap-3 text-left sm:grid-cols-2">
        {MODE_LIST.map((option) => {
          const Icon = MODE_ICON[option.id];
          const isSelected = option.id === mode;

          return (
            <label
              key={option.id}
              className="mode-card group relative cursor-pointer rounded-2xl"
              data-selected={isSelected ? 'true' : undefined}
            >
              <input
                type="radio"
                name="delphy-mode"
                value={option.id}
                checked={isSelected}
                onChange={() => onModeChange(option.id)}
                className="peer sr-only"
              />

              <div className="mode-card-body h-full rounded-2xl border border-border bg-card p-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
                <div className="flex items-start gap-3">
                  <span className="mode-card-icon mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-foreground">
                        {option.name}
                      </span>
                      {isSelected && (
                        <Check
                          aria-hidden
                          className="h-3.5 w-3.5 shrink-0 text-primary"
                        />
                      )}
                    </div>
                    <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                      {option.kicker}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-[13.5px] leading-6 text-muted-foreground">
                  {option.blurb}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
