'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MODE_COPY, type DelphyModeId } from '@/lib/delphy/modes';

type HomeTryItProps = {
  mode: DelphyModeId;
  onStartConversation: () => void;
};

type Turn = { speaker: 'delphy' | 'you'; line: string };

const TYPING_MS_PER_CHAR = 22;

/**
 * Types `text` out one character at a time. Returns the visible slice, whether
 * it finished, and a way to jump to the end.
 *
 * Reduced motion resolves to the finished string immediately rather than typing
 * fast, because the objection to motion here is the movement itself.
 */
function useTypewriter(text: string) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  // A ref, not state: reading it must not re-run the typing effect, or
  // skipping would restart the very animation it is cancelling.
  const skippedRef = useRef(false);

  useEffect(() => {
    skippedRef.current = false;
    setShown('');
    setDone(false);

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(text);
      setDone(true);
      return;
    }

    let index = 0;
    const id = setInterval(() => {
      if (skippedRef.current) {
        clearInterval(id);
        setShown(text);
        setDone(true);
        return;
      }
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, TYPING_MS_PER_CHAR);

    return () => clearInterval(id);
  }, [text]);

  const skip = useCallback(() => {
    skippedRef.current = true;
    setShown(text);
    setDone(true);
  }, [text]);

  return { shown, done, skip };
}

/**
 * The demo you can actually play.
 *
 * A static transcript asks you to imagine being questioned. This one questions
 * you: pick a reply and the next question is built on the one you picked, which
 * is the only way to show on a webpage that Delphy is listening rather than
 * reciting. No microphone, no session, no credentials.
 */
export function HomeTryIt({ mode, onStartConversation }: HomeTryItProps) {
  const copy = MODE_COPY[mode];
  const script = copy.demo;

  const [nodeId, setNodeId] = useState(script.rootId);
  const [history, setHistory] = useState<Turn[]>([]);
  const streamRef = useRef<HTMLDivElement>(null);

  // Switching mode swaps the whole script, so the run so far is meaningless.
  useEffect(() => {
    setNodeId(script.rootId);
    setHistory([]);
  }, [script]);

  const node = script.nodes[nodeId];
  const { shown, done, skip } = useTypewriter(node.question);

  const isFinished = done && !node.choices;

  const choose = useCallback(
    (label: string, next: string) => {
      setHistory((prev) => [
        ...prev,
        { speaker: 'delphy', line: node.question },
        { speaker: 'you', line: label },
      ]);
      setNodeId(next);
    },
    [node.question],
  );

  const restart = useCallback(() => {
    setNodeId(script.rootId);
    setHistory([]);
  }, [script.rootId]);

  // Keep the newest turn in view without yanking the whole page around: only
  // scrolls the transcript's own box.
  useEffect(() => {
    const element = streamRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [history.length, shown]);

  const turnNumber = useMemo(() => history.length / 2 + 1, [history.length]);
  const totalTurns = 3;

  return (
    <section id="try" className="home-section bg-muted">
      <div className="mx-auto w-full max-w-3xl px-6">
        <div
          data-reveal
          className="flex flex-wrap items-baseline justify-between gap-3"
        >
          <h2 className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Try it, no microphone
          </h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            {copy.name}
          </span>
        </div>

        <p
          data-reveal
          style={{ '--reveal-delay': '70ms' } as React.CSSProperties}
          className="mt-6 max-w-xl text-[15px] leading-8 text-muted-foreground"
        >
          {copy.tryItIntro}
        </p>

        <div
          data-reveal
          style={{ '--reveal-delay': '140ms' } as React.CSSProperties}
          className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_18px_50px_-32px_hsl(24_10%_12%/0.55)]"
        >
          {/* Window chrome, so it reads as a thing running rather than a figure. */}
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Delphy, {copy.name}
              </span>
            </div>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {Math.min(turnNumber, totalTurns)} / {totalTurns}
            </span>
          </div>

          <div
            ref={streamRef}
            className="flex max-h-[26rem] flex-col gap-4 overflow-y-auto px-5 py-6 sm:px-7"
          >
            {/* The position under examination, stated once at the top. */}
            <div className="flex justify-end">
              <div className="max-w-[85%]">
                <span className="block text-right text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
                  You
                </span>
                <p className="mt-2 rounded-2xl rounded-tr-sm bg-foreground/[0.055] px-5 py-3.5 text-[15px] leading-7 text-muted-foreground">
                  {script.topic}
                </p>
              </div>
            </div>

            {history.map((turn, index) => {
              const isDelphy = turn.speaker === 'delphy';
              return (
                <div
                  // Index is stable here: history only ever grows, and a key
                  // carrying nodeId would remount every past turn each round.
                  key={`${index}-${turn.speaker}`}
                  className={`flex ${isDelphy ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="max-w-[85%]">
                    <span
                      className={`block text-[10px] font-medium uppercase tracking-[0.18em] ${
                        isDelphy
                          ? 'text-primary'
                          : 'text-right text-muted-foreground/70'
                      }`}
                    >
                      {isDelphy ? 'Delphy' : 'You'}
                    </span>
                    <p
                      className={`mt-2 px-5 py-3.5 text-[15px] leading-7 ${
                        isDelphy
                          ? 'rounded-2xl rounded-tl-sm border border-border bg-surface text-foreground'
                          : 'rounded-2xl rounded-tr-sm bg-foreground/[0.055] text-muted-foreground'
                      }`}
                    >
                      {turn.line}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* The live question. Click it to stop waiting for the typing. */}
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                  Delphy
                </span>
                <p
                  onClick={skip}
                  className={`mt-2 rounded-2xl rounded-tl-sm border border-border bg-surface px-5 py-3.5 text-[15px] leading-7 text-foreground ${
                    done ? '' : 'cursor-pointer'
                  }`}
                >
                  {shown}
                  {!done && <span className="type-caret" aria-hidden />}
                </p>
              </div>
            </div>

            {/* Announced once, rather than on every character. */}
            <span aria-live="polite" className="sr-only">
              {done ? node.question : ''}
            </span>
          </div>

          <div className="border-t border-border bg-surface/50 px-5 py-4 sm:px-7">
            {node.choices && (
              <div
                className={`flex flex-col gap-2 transition-opacity duration-300 ${
                  done ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
              >
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
                  Your answer
                </span>
                {node.choices.map((choice) => (
                  <button
                    key={choice.next}
                    type="button"
                    onClick={() => choose(choice.label, choice.next)}
                    disabled={!done}
                    className="demo-choice"
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            )}

            {isFinished && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] leading-6 text-muted-foreground">
                  Three questions in and it is still asking. That is the whole
                  product.
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={restart}
                    className="h-9 gap-2 rounded-full border border-border px-4 text-[13px]"
                  >
                    <RotateCcw aria-hidden className="h-3.5 w-3.5" />
                    Again
                  </Button>
                  <Button
                    size="sm"
                    onClick={onStartConversation}
                    className="home-cta h-9 gap-2 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <Mic aria-hidden className="h-3.5 w-3.5" />
                    Out loud
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
