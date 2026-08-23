/**
 * Delphy's one hard rule: every line it speaks is a question.
 *
 * The system prompt asks for it; this check enforces it. A failing generation
 * is retried once with a stricter instruction, then falls back to a canned
 * in-character deflection.
 */

export type GuardResult = { ok: true } | { ok: false; reason: string };

/** Appended to the system prompt on the single retry after a failed check. */
export const STRICTER_INSTRUCTION =
  'Your last reply broke the rule. Reply with exactly one sentence that ends in a question mark. No statements, no preamble, no explanation.';

/** Used when even the retry produces a statement. Always in character. */
export const FALLBACK_QUESTION = 'What answer are you expecting me to give here?';

/** Spoken when the user has gone quiet. */
export const IDLE_NUDGE = 'Still there — want to take another shot at that?';

/** Spoken when a judge or generation call fails, so the session never stalls. */
export const STALL_QUESTION = 'Give me a second — what was your strongest point again?';

/**
 * Openers that assert a position before the question mark ever arrives.
 * "You're right, and here's why that matters?" is a statement in disguise.
 */
const ASSERTIVE_OPENERS = [
  'i think',
  'i believe',
  'id say',
  'in my view',
  'in my opinion',
  'youre right',
  'youre wrong',
  'thats true',
  'thats correct',
  'thats right',
  'thats wrong',
  'the answer is',
  'my view is',
  'my answer is',
  'my take is',
  'personally',
  'to be honest',
  'honestly,',
  'the truth is',
  'yes,',
  'no,',
];

/** Sentences this short are abbreviations or interjections, not claims. */
const MIN_WORDS_FOR_CLAIM = 3;

function normalize(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[*_>#`]/g, '')
    .replace(/^[\s"'\u201c\u201d\u2018\u2019]+|[\s"'\u201c\u201d\u2018\u2019]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Lowercased, apostrophes and contractions flattened, for prefix matching. */
function forPrefixMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/\byou are\b/g, 'youre')
    .replace(/\bthat is\b/g, 'thats')
    .replace(/\bi would\b/g, 'id')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(segment: string): number {
  const words = segment.match(/[\p{L}\p{N}']+/gu);
  return words ? words.length : 0;
}

export function checkQuestionOnly(raw: string): GuardResult {
  const text = normalize(raw ?? '');

  if (!text) {
    return { ok: false, reason: 'empty response' };
  }

  if (!text.endsWith('?')) {
    return { ok: false, reason: 'does not end in a question mark' };
  }

  const head = forPrefixMatch(text);

  for (const opener of ASSERTIVE_OPENERS) {
    if (head.startsWith(opener)) {
      return { ok: false, reason: `states a position before asking: "${opener}"` };
    }
  }

  // Any sentence long enough to carry a claim must itself be a question.
  const segments = text.split(/(?<=[.!?])\s+/);

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed || trimmed.endsWith('?')) continue;
    if (countWords(trimmed) >= MIN_WORDS_FOR_CLAIM) {
      return { ok: false, reason: `declarative sentence: "${trimmed}"` };
    }
  }

  return { ok: true };
}
