/**
 * Delphy round progression.
 *
 * Answering well unlocks harder rounds; faltering keeps you in place while
 * Delphy gets more pointed. Pure functions only — no I/O, no LLM calls.
 */

export type Verdict = 'held' | 'hedged' | 'conceded';

/** Extra steer handed to the next question-generation call. */
export type Pressure = 'none' | 'vague' | 'escalate';

export type RoundState = {
  round: number;
  /** `held` verdicts accumulated in the current round. */
  holds: number;
  /** Consecutive non-`held` verdicts in the current round. */
  strikes: number;
  complete: boolean;
};

export type Transition = {
  state: RoundState;
  /** The round advanced — the frontend shows a pip unlocking. */
  unlocked: boolean;
  /** Delphy should sharpen its tone without advancing the round. */
  escalated: boolean;
  pressure: Pressure;
};

export const MAX_ROUND = 3;
export const HOLDS_TO_ADVANCE = 2;
export const STRIKES_TO_ESCALATE = 2;

export function initialRoundState(): RoundState {
  return { round: 1, holds: 0, strikes: 0, complete: false };
}

export function applyVerdict(state: RoundState, verdict: Verdict): Transition {
  if (state.complete) {
    return { state, unlocked: false, escalated: false, pressure: 'none' };
  }

  if (verdict === 'held') {
    const holds = state.holds + 1;

    if (holds < HOLDS_TO_ADVANCE) {
      return {
        state: { ...state, holds, strikes: 0 },
        unlocked: false,
        escalated: false,
        pressure: 'none',
      };
    }

    // Held enough to earn the next round. On the last round, that ends the session.
    if (state.round >= MAX_ROUND) {
      return {
        state: { ...state, holds, strikes: 0, complete: true },
        unlocked: false,
        escalated: false,
        pressure: 'none',
      };
    }

    return {
      state: { round: state.round + 1, holds: 0, strikes: 0, complete: false },
      unlocked: true,
      escalated: false,
      pressure: 'none',
    };
  }

  // hedged | conceded — no advancement, only pressure.
  const strikes = state.strikes + 1;
  const escalated = strikes >= STRIKES_TO_ESCALATE;

  return {
    state: { ...state, strikes },
    unlocked: false,
    escalated,
    pressure: escalated ? 'escalate' : verdict === 'hedged' ? 'vague' : 'none',
  };
}
