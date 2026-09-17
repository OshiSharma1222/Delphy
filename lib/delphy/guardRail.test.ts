import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkQuestionOnly } from './guardRail';

/**
 * The guardrail is the only mechanical enforcement of Delphy's one hard rule,
 * so the cases that matter are the ones where a statement is wearing a question
 * mark. Those are the failures a human reviewer waves through.
 */

function reject(text: string): string {
  const result = checkQuestionOnly(text);
  assert.equal(result.ok, false, `expected a rejection for: ${text}`);
  return result.ok ? '' : result.reason;
}

function accept(text: string): void {
  const result = checkQuestionOnly(text);
  assert.equal(
    result.ok,
    true,
    `expected acceptance for: ${text}${result.ok ? '' : ` (got: ${result.reason})`}`,
  );
}

describe('checkQuestionOnly', () => {
  it('accepts a plain question', () => {
    accept('Productive at what, output per hour or per person?');
  });

  it('accepts a question wrapped in quotes or markdown emphasis', () => {
    accept('"What would change your mind?"');
    accept('**What would change your mind?**');
  });

  it('accepts a short interjection in front of a question', () => {
    // Under the three word threshold, so it cannot be carrying a claim.
    accept('Right. What would change your mind?');
  });

  it('rejects an empty or whitespace-only reply', () => {
    assert.match(reject(''), /empty/);
    assert.match(reject('   '), /empty/);
  });

  it('rejects anything that does not end in a question mark', () => {
    assert.match(
      reject('That depends on what you mean by productive.'),
      /question mark/,
    );
  });

  it('rejects a position stated before the question mark arrives', () => {
    // The whole point: this ends in "?" and is still a statement.
    assert.match(reject('You are right, so why bother asking?'), /states a position/);
    assert.match(reject('I think you are wrong, or are you?'), /states a position/);
  });

  it('treats contractions and curly apostrophes as the same opener', () => {
    assert.match(reject("You're right, so what now?"), /states a position/);
    assert.match(reject('You’re right, so what now?'), /states a position/);
  });

  it('rejects a declarative sentence smuggled in beside a question', () => {
    const reason = reject(
      'Remote work clearly lowers output. What do you say to that?',
    );
    assert.match(reason, /declarative sentence/);
  });

  it('rejects a trailing declarative after the question', () => {
    assert.match(
      reject('What would change your mind? I doubt anything would.'),
      /question mark/,
    );
  });

  it('accepts several questions in a row', () => {
    accept('Productive at what? Output per hour, or per person?');
  });
});
