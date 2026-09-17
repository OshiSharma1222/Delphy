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

/**
 * The playable demo. A small branching tree: Delphy asks, you pick one of two
 * replies, and the next question depends on which one. Two levels deep, so
 * every path ends in a question that only makes sense given the answers before
 * it, which is the whole point being demonstrated.
 */
export type DemoChoice = {
  label: string;
  /** Node id this reply leads to. Must exist in the same script. */
  next: string;
};

export type DemoNode = {
  question: string;
  /** Absent means terminal: the question lands and the demo stops there. */
  choices?: DemoChoice[];
};

export type DemoScript = {
  /** The position being defended, shown as the opening turn. */
  topic: string;
  rootId: string;
  nodes: Record<string, DemoNode>;
};

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
  tryItIntro: string;
  demo: DemoScript;
  /** Openers for the blank-page problem, phrased the way you would say them. */
  startersIntro: string;
  starters: string[];
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
  tryItIntro:
    'Answer for yourself and watch where it goes. It never argues the other side, it just keeps asking the question you would rather it skipped.',
  demo: {
    topic: 'Microservices are the wrong default for most teams.',
    rootId: 'open',
    nodes: {
      open: {
        question: 'Wrong by what measure, and for a team of how many?',
        choices: [
          {
            label: 'Under twenty engineers. The overhead eats the benefit.',
            next: 'small',
          },
          {
            label: 'Any size. Most teams never need that isolation.',
            next: 'any',
          },
        ],
      },
      small: {
        question: 'Overhead of what exactly, the deploys or the on-call?',
        choices: [
          {
            label: 'Mostly on-call. The surface area got huge.',
            next: 'oncall',
          },
          {
            label: 'Deploys. We lose a day a week to release plumbing.',
            next: 'deploys',
          },
        ],
      },
      any: {
        question:
          'Netflix disagrees. What do they know about their team that you do not know about yours?',
        choices: [
          {
            label: 'They have scale problems I simply do not have.',
            next: 'scale',
          },
          { label: 'Nothing. Everyone else is cargo culting.', next: 'cargo' },
        ],
      },
      oncall: {
        question:
          'So is the problem microservices, or that you cut the services along the wrong seam?',
      },
      deploys: {
        question:
          'A day a week, against what it cost you before the split. Do you have that number?',
      },
      scale: {
        question:
          'Then the claim is about your team, not most teams. Which one are you defending?',
      },
      cargo: {
        question:
          'Every team shipping this way is wrong, and you worked that out from where?',
      },
    },
  },
  startersIntro:
    'Pick one you would actually argue for. A position you only half hold gives way on the first question and there is nothing to do after that.',
  starters: [
    'Microservices are the wrong default for most teams.',
    'Most meetings could have been a document.',
    'Code review catches far less than people think.',
    'Tabs are better than spaces, and it is not close.',
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
  tryItIntro:
    'Answer for yourself and watch where it goes. It is not trying to change your mind, it is making you say out loud what your mind is resting on.',
  demo: {
    topic: 'Remote work makes engineering teams more productive.',
    rootId: 'open',
    nodes: {
      open: {
        question: 'Why do you think that, what made you believe it?',
        choices: [
          {
            label: 'Our ticket count went up after we went remote.',
            next: 'evidence',
          },
          {
            label: 'It just feels more focused without interruptions.',
            next: 'feeling',
          },
        ],
      },
      evidence: {
        question:
          'Why does a ticket count tell you about productivity rather than about how you split tickets?',
        choices: [
          {
            label: 'The tickets were about the same size either way.',
            next: 'sizes',
          },
          {
            label: 'Honestly, we did start splitting them up.',
            next: 'split',
          },
        ],
      },
      feeling: {
        question:
          'Focused for you, or for the person now waiting a day for an answer you used to give in a minute?',
        choices: [
          { label: 'Mostly for me. The waiting is real.', next: 'waiting' },
          {
            label: 'Both. Writing things down made us clearer.',
            next: 'async',
          },
        ],
      },
      sizes: {
        question:
          'What would you have expected to see instead, if remote had made you slower?',
      },
      split: {
        question: 'So which number moved, the work or the way you count it?',
      },
      waiting: {
        question:
          'Which of those two costs the team more, and how would you find out?',
      },
      async: {
        question:
          'Clearer to write, or clearer to read a week later, and which of those did you measure?',
      },
    },
  },
  startersIntro:
    'Pick something you already believe rather than something you want to work out. The mode is built to examine a conviction, not to manufacture one.',
  starters: [
    'Remote work makes engineering teams more productive.',
    'You should optimise a career for learning, not salary.',
    'Nuclear is the fastest way to decarbonise a grid.',
    'A computer science degree is still worth the cost.',
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
