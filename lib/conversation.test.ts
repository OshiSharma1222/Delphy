import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AgentState } from 'agora-agent-client-toolkit';
import {
  mapAgentVisualizerState,
  normalizeTimestampMs,
  normalizeTranscriptSpacing,
} from './conversation';

/**
 * These three are live code on every call, and all three are the kind of pure
 * function that quietly drifts: a punctuation regex, a units heuristic, and a
 * precedence rule.
 *
 * The transcript adapters are left out on purpose. They only reshape fields,
 * and testing them means importing TurnStatus from the toolkit, which drags a
 * browser-only package into the test run for no assertion worth making.
 */

describe('normalizeTranscriptSpacing', () => {
  it('reinstates the space some providers drop after a sentence', () => {
    assert.equal(
      normalizeTranscriptSpacing('Hello.World is round'),
      'Hello. World is round',
    );
    assert.equal(normalizeTranscriptSpacing('Really?Why'), 'Really? Why');
    assert.equal(normalizeTranscriptSpacing('Stop!Listen'), 'Stop! Listen');
  });

  it('spaces after a comma as well', () => {
    assert.equal(
      normalizeTranscriptSpacing('output per hour,or per person'),
      'output per hour, or per person',
    );
  });

  it('leaves a decimal number alone', () => {
    // The rule only fires before a letter, which is what keeps 3.5 intact.
    assert.equal(normalizeTranscriptSpacing('about 3.5 times'), 'about 3.5 times');
  });

  it('collapses runs of whitespace and trims the ends', () => {
    assert.equal(normalizeTranscriptSpacing('  too   many  spaces '), 'too many spaces');
  });

  it('is idempotent, since it runs on every render', () => {
    const once = normalizeTranscriptSpacing('Hello.World,again');
    assert.equal(normalizeTranscriptSpacing(once), once);
  });
});

describe('normalizeTimestampMs', () => {
  it('scales Unix seconds up to milliseconds', () => {
    assert.equal(normalizeTimestampMs(1_700_000_000), 1_700_000_000_000);
  });

  it('leaves a millisecond value untouched', () => {
    assert.equal(normalizeTimestampMs(1_700_000_000_000), 1_700_000_000_000);
  });

  it('puts both representations of one instant in the same millennium', () => {
    const seconds = 1_758_000_000;
    const yearFromSeconds = new Date(normalizeTimestampMs(seconds)).getFullYear();
    const yearFromMillis = new Date(
      normalizeTimestampMs(seconds * 1000),
    ).getFullYear();
    assert.equal(yearFromSeconds, yearFromMillis);
  });
});

describe('mapAgentVisualizerState', () => {
  it('reports transport trouble ahead of anything the agent claims', () => {
    // The whole reason this function exists: never show "listening" mid-reconnect.
    assert.equal(mapAgentVisualizerState(AgentState.LISTENING, true, 'RECONNECTING'), 'joining');
    assert.equal(mapAgentVisualizerState(AgentState.SPEAKING, true, 'CONNECTING'), 'joining');
    assert.equal(mapAgentVisualizerState(AgentState.SPEAKING, true, 'DISCONNECTED'), 'disconnected');
    assert.equal(
      mapAgentVisualizerState(AgentState.LISTENING, true, 'DISCONNECTING'),
      'disconnected',
    );
  });

  it('shows not-joined while the transport is up but the agent is absent', () => {
    assert.equal(mapAgentVisualizerState(null, false, 'CONNECTED'), 'not-joined');
    // Even if a stale agent state is still hanging around.
    assert.equal(mapAgentVisualizerState(AgentState.SPEAKING, false, 'CONNECTED'), 'not-joined');
  });

  it('maps agent state once the agent is actually present', () => {
    assert.equal(mapAgentVisualizerState(AgentState.LISTENING, true, 'CONNECTED'), 'listening');
    assert.equal(mapAgentVisualizerState(AgentState.THINKING, true, 'CONNECTED'), 'analyzing');
    assert.equal(mapAgentVisualizerState(AgentState.SPEAKING, true, 'CONNECTED'), 'talking');
  });

  it('falls back to ambient for quiet or unknown agent states', () => {
    assert.equal(mapAgentVisualizerState(AgentState.IDLE, true, 'CONNECTED'), 'ambient');
    assert.equal(mapAgentVisualizerState(AgentState.SILENT, true, 'CONNECTED'), 'ambient');
    assert.equal(mapAgentVisualizerState(null, true, 'CONNECTED'), 'ambient');
  });
});
