'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { MODE_COPY, type DelphyModeId } from '@/lib/delphy/modes';

type TranscriptMessage = {
  turn_id?: string | number;
  uid: number;
  text?: string;
  createdAt?: number;
};

type QuickstartTranscriptPanelProps = {
  messageList: TranscriptMessage[];
  currentInProgressMessage: TranscriptMessage | null;
  agentUID: string;
  mode: DelphyModeId;
};

function formatMessageTime(createdAt?: number) {
  if (!createdAt) return null;
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

/** Plain text, because the point is to paste it somewhere, not to style it. */
function toPlainText(
  messages: TranscriptMessage[],
  agentUID: string,
  mode: DelphyModeId,
): string {
  const header = [
    `Delphy transcript (${MODE_COPY[mode].name})`,
    new Date().toLocaleString(),
    '',
  ];

  const body = messages.map((message) => {
    const speaker = String(message.uid) === agentUID ? 'Delphy' : 'You';
    const time = formatMessageTime(message.createdAt);
    const prefix = time ? `[${time}] ${speaker}` : speaker;
    return `${prefix}: ${message.text?.trim() ?? ''}`;
  });

  return [...header, ...body].join('\n');
}

export function QuickstartTranscriptPanel({
  messageList,
  currentInProgressMessage,
  agentUID,
  mode,
}: QuickstartTranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [justCopied, setJustCopied] = useState(false);

  const messages = useMemo(
    () =>
      currentInProgressMessage
        ? [...messageList, currentInProgressMessage]
        : messageList,
    [currentInProgressMessage, messageList],
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages]);

  // Only settled turns are exported. The in-progress one is a partial
  // recognition result and is usually a fragment of a word.
  const hasExportable = messageList.length > 0;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        toPlainText(messageList, agentUID, mode),
      );
      setJustCopied(true);
    } catch (error) {
      // Denied permission or an insecure origin. Nothing is broken, the
      // download button still works, so do not interrupt the call over it.
      console.error('Could not copy the transcript:', error);
    }
  }, [messageList, agentUID, mode]);

  // Clear the confirmation without leaving a timer behind on unmount.
  useEffect(() => {
    if (!justCopied) return;
    const id = setTimeout(() => setJustCopied(false), 1800);
    return () => clearTimeout(id);
  }, [justCopied]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([toPlainText(messageList, agentUID, mode)], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `delphy-${mode}-${stamp}.txt`;
    anchor.click();
    // Revoking straight away can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }, [messageList, agentUID, mode]);

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/60"
      aria-label="Transcription panel"
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-foreground">Transcript</h2>
          <p className="truncate text-xs text-muted-foreground">
            Live voice turns
          </p>
        </div>

        {/* Ending the call is the only exit and it throws the transcript away.
            Whatever you worked out in here should be able to leave with you. */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!hasExportable}
            className="transcript-action"
            aria-label="Copy transcript to clipboard"
            title="Copy transcript"
          >
            {justCopied ? (
              <Check aria-hidden className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy aria-hidden className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasExportable}
            className="transcript-action"
            aria-label="Download transcript as a text file"
            title="Download transcript"
          >
            <Download aria-hidden className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            Start speaking to see the live transcript here.
          </div>
        ) : (
          messages.map((message, index) => {
            const isAgent = String(message.uid) === agentUID;
            const label = isAgent ? 'Delphy' : 'You';
            const text = message.text?.trim();
            const time = formatMessageTime(message.createdAt);

            return (
              <article
                key={`${message.turn_id ?? message.uid}-${index}`}
                className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`mb-1.5 flex items-center gap-2 px-1 text-[10px] font-medium uppercase tracking-[0.16em] ${
                    isAgent ? 'text-primary' : 'text-muted-foreground/70'
                  }`}
                >
                  <span>{label}</span>
                  {time && (
                    <span className="tracking-normal text-muted-foreground/70">
                      {time}
                    </span>
                  )}
                </div>
                <div
                  className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    isAgent
                      ? 'rounded-tl-sm border border-border bg-card text-foreground'
                      : 'rounded-tr-sm bg-foreground/[0.055] text-muted-foreground'
                  }`}
                >
                  {text || '...'}
                </div>
              </article>
            );
          })
        )}
      </div>

      <span aria-live="polite" className="sr-only">
        {justCopied ? 'Transcript copied to clipboard' : ''}
      </span>
    </section>
  );
}
