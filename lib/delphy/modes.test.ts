import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_MODE,
  isDelphyMode,
  MODE_COPY,
  MODE_IDS,
  MODE_LIST,
  resolveMode,
} from './modes';
import { getPersona } from './personas';

describe('resolveMode', () => {
  it('passes through every known mode', () => {
    for (const id of MODE_IDS) {
      assert.equal(resolveMode(id), id);
    }
  });

  it('falls back to the default rather than throwing', () => {
    // The invite route depends on this: a stale client that sends nothing, or
    // a bad value, should still get a session instead of a 400.
    assert.equal(resolveMode(undefined), DEFAULT_MODE);
    assert.equal(resolveMode(null), DEFAULT_MODE);
    assert.equal(resolveMode('RAGEBAIT'), DEFAULT_MODE);
    assert.equal(resolveMode('socratic'), DEFAULT_MODE);
    assert.equal(resolveMode(7), DEFAULT_MODE);
    assert.equal(resolveMode({ mode: 'critical' }), DEFAULT_MODE);
  });

  it('guards narrowly', () => {
    assert.equal(isDelphyMode('critical'), true);
    assert.equal(isDelphyMode('Critical'), false);
    assert.equal(isDelphyMode(''), false);
  });
});

describe('mode copy', () => {
  it('covers every id exactly once, in both the map and the list', () => {
    assert.deepEqual(
      [...MODE_LIST.map((mode) => mode.id)].sort(),
      [...MODE_IDS].sort(),
    );
    assert.equal(MODE_LIST.length, MODE_IDS.length);
    for (const id of MODE_IDS) {
      assert.equal(MODE_COPY[id].id, id, `${id} copy is filed under the wrong key`);
    }
  });

  it('leads the selector with the default mode', () => {
    assert.equal(MODE_LIST[0].id, DEFAULT_MODE);
  });

  it('never ships an empty string to the page', () => {
    for (const copy of MODE_LIST) {
      for (const [key, value] of Object.entries(copy)) {
        if (typeof value === 'string') {
          assert.ok(value.trim().length > 0, `${copy.id}.${key} is blank`);
        }
      }
      assert.ok(copy.steps.length > 0, `${copy.id} has no steps`);
      assert.ok(copy.rounds.length > 0, `${copy.id} has no rounds`);
      assert.ok(copy.starters.length > 0, `${copy.id} has no starters`);
    }
  });
});

describe('the playable demo', () => {
  it('only ever has Delphy asking questions', () => {
    // A demo that breaks the one rule teaches the wrong thing on the homepage.
    for (const copy of MODE_LIST) {
      for (const [id, node] of Object.entries(copy.demo.nodes)) {
        assert.ok(
          node.question.trim().endsWith('?'),
          `${copy.id}.${id} is not a question: ${node.question}`,
        );
      }
    }
  });

  it('has a root that exists and every choice pointing somewhere real', () => {
    // A dangling `next` would crash the component on click, and the tree is
    // hand-written data with no type-level guarantee that ids line up.
    for (const copy of MODE_LIST) {
      const { nodes, rootId } = copy.demo;
      assert.ok(nodes[rootId], `${copy.id} root ${rootId} is missing`);
      for (const [id, node] of Object.entries(nodes)) {
        for (const choice of node.choices ?? []) {
          assert.ok(
            nodes[choice.next],
            `${copy.id}.${id} points at missing node ${choice.next}`,
          );
        }
      }
    }
  });

  it('can reach every node from the root, and every path terminates', () => {
    for (const copy of MODE_LIST) {
      const { nodes, rootId } = copy.demo;
      const seen = new Set<string>();
      const queue = [rootId];
      let terminals = 0;

      while (queue.length > 0) {
        const id = queue.shift() as string;
        if (seen.has(id)) continue;
        seen.add(id);
        const node = nodes[id];
        if (!node.choices || node.choices.length === 0) {
          terminals += 1;
          continue;
        }
        queue.push(...node.choices.map((choice) => choice.next));
      }

      assert.equal(
        seen.size,
        Object.keys(nodes).length,
        `${copy.id} has nodes unreachable from the root`,
      );
      assert.ok(terminals > 0, `${copy.id} never ends`);
    }
  });

  it('offers exactly two replies wherever it offers any', () => {
    // The layout is built for a pair; three would overflow the panel.
    for (const copy of MODE_LIST) {
      for (const [id, node] of Object.entries(copy.demo.nodes)) {
        if (!node.choices) continue;
        assert.equal(node.choices.length, 2, `${copy.id}.${id}`);
      }
    }
  });

  it('states the position being defended', () => {
    for (const copy of MODE_LIST) {
      assert.ok(copy.demo.topic.trim().length > 0, `${copy.id} has no topic`);
    }
  });
});

describe('personas', () => {
  it('gives every mode its own prompt and greeting', () => {
    const seen = new Set<string>();
    for (const id of MODE_IDS) {
      const persona = getPersona(id);
      assert.ok(persona.instructions.length > 0);
      assert.equal(seen.has(persona.instructions), false, `${id} reuses a prompt`);
      seen.add(persona.instructions);
    }
  });

  it('tells both personas that every line is a question', () => {
    for (const id of MODE_IDS) {
      assert.match(getPersona(id).instructions, /every (single )?thing you say is a question/i);
    }
  });

  it('keeps critical thinking more patient than ragebait', () => {
    const critical = getPersona('critical').turnDetection;
    const ragebait = getPersona('ragebait').turnDetection;
    assert.ok(critical.interruptDurationMs > ragebait.interruptDurationMs);
    assert.ok(critical.silenceDurationMs > ragebait.silenceDurationMs);
    assert.ok(critical.maxWaitMs > ragebait.maxWaitMs);
  });

  it('never lets max_wait fall below the silence it waits through', () => {
    for (const id of MODE_IDS) {
      const { silenceDurationMs, maxWaitMs } = getPersona(id).turnDetection;
      assert.ok(
        maxWaitMs > silenceDurationMs,
        `${id} would time out before the semantic check ever runs`,
      );
    }
  });
});
