/**
 * Delphy runs in one of two modes. They share the one hard rule, every line is
 * a question, and differ in what the questions are for.
 *
 *   ragebait  finds the weakest joint in what you just said and leans on it.
 *   critical  finds out why you believe it at all, and why not the other thing.
 *
 * This module is imported by both the browser and the API route, so it holds
 * only ids and copy. The system prompts and pipeline tuning live in
 * `personas.ts`, which the client never imports.
 */

export type DelphyModeId = 'ragebait' | 'critical';

export const MODE_IDS = ['ragebait', 'critical'] as const;

/** Critical thinking is the default; pressure is opt-in. */
export const DEFAULT_MODE: DelphyModeId = 'critical';

export type ExchangeTurn = { speaker: 'delphy' | 'you'; line: string };

export type DelphyModeCopy = {
  id: DelphyModeId;
  /** Selector card, in-call badge. */
  name: string;
  /** One line under the name, what the mode does to you. */
  kicker: string;
  /** Selector card body. */
  blurb: string;
  heroHeading: string;
  heroBody: string;
  ctaLabel: string;
  ctaLoadingLabel: string;
  micNote: string;
  steps: { n: string; title: string; body: string }[];
  sampleIntro: string;
  sample: ExchangeTurn[];
  roundsHeading: string;
  rounds: { id: string; label: string; body: string }[];
};

const RAGEBAIT: DelphyModeCopy = {
  id: 'ragebait',
  name: 'Ragebait',
  kicker: "Devil's advocate",
  blurb:
    'It takes the weakest thing you just said and stays on it. Dry, unimpressed, and not interested in letting a lazy step past.',
  heroHeading: 'It will not tell you what it thinks.',
  heroBody:
    'Bring a position you actually hold and say it out loud. Delphy answers only in questions, and goes straight for the weakest thing you just said.',
  ctaLabel: 'Take the stand',
  ctaLoadingLabel: 'Opening the floor',
  micNote: 'Microphone required, interrupt it whenever you like',
  steps: [
    {
      n: '01',
      title: 'Bring a position',
      body: 'Say something you actually believe. The stronger your conviction, the more there is to test.',
    },
    {
      n: '02',
      title: 'It only asks',
      body: 'Delphy never states, never agrees, never takes a side. Every turn is a single question aimed at your weakest link.',
    },
    {
      n: '03',
      title: 'Hold your ground',
      body: 'Answer the question that was actually asked. Dodge it and it will name the dodge and ask again.',
    },
  ],
  sampleIntro:
    'Notice that it never argues the other side. It just keeps asking the question you would rather it skipped.',
  sample: [
    { speaker: 'delphy', line: 'What topic are you bringing me today?' },
    {
      speaker: 'you',
      line: 'Remote work makes engineering teams more productive.',
    },
    {
      speaker: 'delphy',
      line: 'Productive at what: output per person, or the things that only happen when people overlap?',
    },
    {
      speaker: 'you',
      line: 'Output per person. Our closed-ticket count went up.',
    },
    { speaker: 'delphy', line: 'Did the tickets get smaller?' },
    { speaker: 'you', line: '...possibly. We did start splitting them up.' },
    {
      speaker: 'delphy',
      line: 'So which number moved, the work, or the way you count it?',
    },
  ],
  roundsHeading: 'Three rounds',
  rounds: [
    {
      id: '01',
      label: 'Opening',
      body: 'It finds out what you are defending, and what you actually believe about it.',
    },
    {
      id: '02',
      label: 'Pressure',
      body: 'It picks the softest part of your last answer and stays there until it gives.',
    },
    {
      id: '03',
      label: 'Closing',
      body: 'It tests whether the position you are left holding is still the one you walked in with.',
    },
  ],
};

const CRITICAL: DelphyModeCopy = {
  id: 'critical',
  name: 'Critical thinking',
  kicker: 'Socratic examiner',
  blurb:
    'It asks why you believe it, and why not the other thing. You leave holding the same idea, or knowing exactly why you dropped it.',
  heroHeading: 'Why do you think that?',
  heroBody:
    'Bring a position you actually hold and say it out loud. Delphy answers only in questions, and every one of them is aimed at the reason underneath, not at you.',
  ctaLabel: 'Think it through',
  ctaLoadingLabel: 'Pulling up a chair',
  micNote: 'Microphone required, take as long as you need to answer',
  steps: [
    {
      n: '01',
      title: 'State what you believe',
      body: 'Not a topic, a position. Say the thing you would defend at a dinner table.',
    },
    {
      n: '02',
      title: 'Say why',
      body: 'Delphy asks for the reason under the belief, then asks why that reason counts as a reason.',
    },
    {
      n: '03',
      title: 'Say why not the other thing',
      body: 'Every position rules something out. It makes you say what is wrong with the view you did not take.',
    },
  ],
  sampleIntro:
    'It is not trying to change your mind. It is making you say out loud what your mind is actually resting on.',
  sample: [
    { speaker: 'delphy', line: 'What do you believe that you would defend?' },
    {
      speaker: 'you',
      line: 'Remote work makes engineering teams more productive.',
    },
    {
      speaker: 'delphy',
      line: 'Why do you think that, what made you believe it?',
    },
    {
      speaker: 'you',
      line: 'Our closed-ticket count went up after we went remote.',
    },
    {
      speaker: 'delphy',
      line: 'Why does a ticket count tell you about productivity rather than about how you split tickets?',
    },
    { speaker: 'you', line: 'Because the tickets were roughly the same size.' },
    {
      speaker: 'delphy',
      line: 'What would you have expected to see instead if remote had made you slower?',
    },
  ],
  roundsHeading: 'Four questions it keeps coming back to',
  rounds: [
    {
      id: '01',
      label: 'The reason',
      body: 'Why do you believe this? Something you saw, something you read, or something that just feels obvious?',
    },
    {
      id: '02',
      label: 'The alternative',
      body: 'Why this and not the obvious other view? What exactly is wrong with the one you did not take?',
    },
    {
      id: '03',
      label: 'The assumption',
      body: 'What has to be true, that you have not said out loud, for your reason to work at all?',
    },
    {
      id: '04',
      label: 'The test',
      body: 'What would you expect to see if you were wrong? If nothing, the belief is not doing any work.',
    },
  ],
};

export const MODE_COPY: Record<DelphyModeId, DelphyModeCopy> = {
  ragebait: RAGEBAIT,
  critical: CRITICAL,
};

/** Selector order: the calmer mode reads first because it is the default. */
export const MODE_LIST: DelphyModeCopy[] = [CRITICAL, RAGEBAIT];

export function isDelphyMode(value: unknown): value is DelphyModeId {
  return (
    typeof value === 'string' && (MODE_IDS as readonly string[]).includes(value)
  );
}

/** Anything unrecognised, including undefined from an older client, resolves to the default. */
export function resolveMode(value: unknown): DelphyModeId {
  return isDelphyMode(value) ? value : DEFAULT_MODE;
}
