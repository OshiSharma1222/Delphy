import { initialRoundState, type RoundState, type Verdict } from './roundState';
import type { Difficulty } from './prompts';

export type Turn = { role: 'delphy' | 'user'; content: string; at: number };

export type Scored = { question: string; answer: string; verdict: Verdict; reason: string };

export type SessionState = {
  id: string;
  topic: string;
  difficulty: Difficulty;
  channel: string;
  round: RoundState;
  transcript: Turn[];
  scored: Scored[];
  /** Set once the closing verdict has been delivered — it only ever fires once. */
  revealed: boolean;
  startedAt: number;
};

/** Soft cap; reaching it ends the session with the closing verdict. */
export const SESSION_LIMIT_MS = 8 * 60 * 1000;

const sessions = new Map<string, SessionState>();

export function createSession(input: {
  id: string;
  topic: string;
  difficulty: Difficulty;
  channel: string;
}): SessionState {
  const session: SessionState = {
    ...input,
    round: initialRoundState(),
    transcript: [],
    scored: [],
    revealed: false,
    startedAt: Date.now(),
  };

  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): SessionState | undefined {
  return sessions.get(id);
}

export function appendTurn(id: string, role: Turn['role'], content: string): void {
  const session = sessions.get(id);
  if (!session) return;
  session.transcript.push({ role, content, at: Date.now() });
}

/** The last thing Delphy asked, for the judge to score against. */
export function lastQuestion(session: SessionState): string | undefined {
  for (let i = session.transcript.length - 1; i >= 0; i--) {
    if (session.transcript[i].role === 'delphy') return session.transcript[i].content;
  }
  return undefined;
}

export function isExpired(session: SessionState): boolean {
  return Date.now() - session.startedAt >= SESSION_LIMIT_MS;
}

/** True when the closing verdict should fire: rounds cleared, timed out, or host forced it. */
export function shouldReveal(session: SessionState, forced = false): boolean {
  if (session.revealed) return false;
  return forced || session.round.complete || isExpired(session);
}

export function endSession(id: string): void {
  sessions.delete(id);
}
