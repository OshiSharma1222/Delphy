import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyVerdict,
  HOLDS_TO_ADVANCE,
  initialRoundState,
  MAX_ROUND,
  type RoundState,
  type Verdict,
} from './roundState';

/** Feeds a run of verdicts through the machine and hands back the last transition. */
function run(verdicts: Verdict[], from: RoundState = initialRoundState()) {
  let transition = applyVerdict(from, verdicts[0]);
  for (const verdict of verdicts.slice(1)) {
    transition = applyVerdict(transition.state, verdict);
  }
  return transition;
}

describe('applyVerdict', () => {
  it('starts in round one with nothing banked', () => {
    assert.deepEqual(initialRoundState(), {
      round: 1,
      holds: 0,
      strikes: 0,
      complete: false,
    });
  });

  it('banks a hold without advancing until the threshold is reached', () => {
    const first = applyVerdict(initialRoundState(), 'held');
    assert.equal(first.unlocked, false);
    assert.equal(first.state.round, 1);
    assert.equal(first.state.holds, 1);
  });

  it('advances a round once enough holds are banked', () => {
    const held: Verdict[] = Array(HOLDS_TO_ADVANCE).fill('held');
    const result = run(held);
    assert.equal(result.unlocked, true);
    assert.equal(result.state.round, 2);
    // Progress resets so each round is earned on its own.
    assert.equal(result.state.holds, 0);
  });

  it('does not advance past the final round, it completes instead', () => {
    const held: Verdict[] = Array(HOLDS_TO_ADVANCE * MAX_ROUND).fill('held');
    const result = run(held);
    assert.equal(result.state.complete, true);
    assert.equal(result.state.round, MAX_ROUND);
    assert.equal(result.unlocked, false);
  });

  it('keeps a hedge in the same round and asks for a definition', () => {
    const result = applyVerdict(initialRoundState(), 'hedged');
    assert.equal(result.state.round, 1);
    assert.equal(result.pressure, 'vague');
    assert.equal(result.escalated, false);
  });

  it('escalates on the second consecutive strike without advancing', () => {
    const result = run(['hedged', 'conceded']);
    assert.equal(result.escalated, true);
    assert.equal(result.pressure, 'escalate');
    assert.equal(result.state.round, 1);
  });

  it('clears the strike count when they recover', () => {
    const recovered = run(['hedged', 'held']);
    assert.equal(recovered.state.strikes, 0);
    // And the next strike starts counting from scratch rather than escalating.
    const afterRecovery = applyVerdict(recovered.state, 'hedged');
    assert.equal(afterRecovery.escalated, false);
  });

  it('is inert once the session is complete', () => {
    const complete: RoundState = {
      round: MAX_ROUND,
      holds: 2,
      strikes: 0,
      complete: true,
    };
    const result = applyVerdict(complete, 'conceded');
    assert.deepEqual(result.state, complete);
    assert.equal(result.pressure, 'none');
    assert.equal(result.escalated, false);
  });

  it('never mutates the state it was handed', () => {
    const before = initialRoundState();
    const snapshot = { ...before };
    applyVerdict(before, 'held');
    assert.deepEqual(before, snapshot);
  });
});
