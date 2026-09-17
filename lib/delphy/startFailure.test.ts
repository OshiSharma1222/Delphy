import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { describeStartFailure } from './startFailure';

describe('describeStartFailure', () => {
  it('names the missing-credentials case and how to fix it', () => {
    // This is the message a fresh clone with no .env actually hits.
    const message = describeStartFailure('Agora credentials are not set');
    assert.match(message, /no Agora credentials/i);
    assert.match(message, /env\.local\.example/);
    // Never tell someone to retry something that cannot succeed.
    assert.doesNotMatch(message, /try again/i);
  });

  it('separates rejected credentials from absent ones', () => {
    const message = describeStartFailure(
      'Status code: 401\nBody: {\n  "message": "Invalid token"\n}',
    );
    assert.match(message, /rejected/i);
    assert.match(message, /same Agora project/);
    assert.doesNotMatch(message, /try again/i);
  });

  it('falls back to retry advice for anything genuinely transient', () => {
    assert.match(describeStartFailure('socket hang up'), /try again/i);
    assert.match(describeStartFailure(''), /try again/i);
  });

  it('does not mistake an unrelated number for an auth failure', () => {
    // A bare 401 inside a longer id should not hijack the message.
    assert.match(describeStartFailure('request 94013 timed out'), /try again/i);
  });
});
