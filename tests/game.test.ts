import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS, TIERS } from "../lib/data";
import {
  advance,
  dailyQuestions,
  evaluate,
  newGame,
  normalize,
  restore,
  shareText,
  submit,
  total,
  utcDate,
} from "../lib/game";
test("UTC days and deterministic seven unique prompts", () => {
  assert.equal(utcDate(Date.parse("2026-11-04T23:59:59Z")), "2026-11-04");
  const first = dailyQuestions("2026-11-04");
  assert.deepEqual(first, dailyQuestions("2026-11-04"));
  assert.equal(new Set(first.map((q) => q.id)).size, 7);
  assert.notDeepEqual(first, dailyQuestions("2026-11-05"));
});
test("normalization and curated variants", () => {
  assert.equal(normalize("  THE   Bee’s KNEES!! "), "the bees knees");
  assert.equal(evaluate("excellent", "  THE Bee’s KNEES!! ").points, 50);
  assert.equal(evaluate("money", "spondulix").points, 85);
  assert.equal(evaluate("money", "GuAp").points, 50);
  assert.equal(evaluate("rich", "well-heeled").points, 50);
  assert.equal(evaluate("money", "totally invented").points, 0);
  assert.equal(evaluate("money", "  ").points, 0);
  assert.equal(evaluate("money", "!!!").points, 0);
});
test("all four tiers score exactly and all questions have useful banks", () => {
  assert.ok(QUESTIONS.length >= 15);
  for (const q of QUESTIONS) {
    assert.ok(q.answers.length >= 5);
    for (const a of q.answers) {
      assert.equal(a.points, TIERS[a.tier - 1].points);
      assert.equal(evaluate(q.id, a.canonical).tier, a.tier);
    }
  }
  for (let i = 0; i < 4; i++)
    assert.equal(
      evaluate(
        "money",
        QUESTIONS[0].answers.find((a) => a.tier === i + 1)!.canonical,
      ).points,
      TIERS[i].points,
    );
});
test("deadline expires at exact boundary and duplicate submissions cannot score", () => {
  let s = newGame("2026-11-04", 1000);
  const q = dailyQuestions(s.date)[0];
  s = submit(s, q.answers[0].canonical, 26000);
  assert.equal(s.results[0].points, 0);
  assert.equal(s.results[0].timedOut, true);
  assert.equal(submit(s, q.answers[0].canonical, 2000), s);
  assert.equal(s.results.length, 1);
});
test("seven rounds, maximum score, persistence, completion and share", () => {
  let s = newGame("2026-11-04", 1000);
  for (let i = 0; i < 7; i++) {
    const q = dailyQuestions(s.date)[i];
    s = submit(
      s,
      q.answers.find((a) => a.tier === 4)!.canonical,
      1001 + i * 100,
    );
    assert.equal(s.index, i);
    assert.deepEqual(restore(JSON.stringify(s), s.date), s);
    s = advance(s, 1002 + i * 100);
  }
  assert.equal(s.phase, "complete");
  assert.equal(total(s), 700);
  assert.equal(submit(s, "x"), s);
  assert.equal(advance(s), s);
  assert.equal(s.results.length, 7);
  assert.equal(restore(JSON.stringify(s), "2026-11-05"), null);
  assert.match(shareText(s, "https://example.com"), /Score: 700\/700/);
  assert.match(shareText(s, "https://example.com"), /❤️ ❤️ ❤️ ❤️ ❤️ ❤️ ❤️/);
});
test("unfinished state preserves deadline and rejects malformed storage", () => {
  const s = newGame("2026-11-04", 123);
  assert.equal(restore(JSON.stringify(s), s.date)?.deadline, 25123);
  assert.equal(restore("{broken", s.date), null);
  assert.equal(restore(JSON.stringify({ ...s, index: 8 }), s.date), null);
  assert.equal(
    restore(JSON.stringify({ ...s, phase: "complete" }), s.date),
    null,
  );
  assert.equal(advance(s), s);
});

test("delayed tab state cannot rewind progress or extend a timer", async () => {
  const { reconcileProgress } = await import("../lib/game");
  const initial = newGame("2026-11-04", 1000);
  const reveal = submit(
    initial,
    dailyQuestions(initial.date)[0].answers[0].canonical,
    1001,
  );
  const next = advance(reveal, 1002);
  assert.equal(reconcileProgress(next, initial), next);
  assert.equal(reconcileProgress(initial, reveal), reveal);
  assert.equal(
    reconcileProgress(initial, {
      ...initial,
      deadline: initial.deadline + 10000,
    }),
    initial,
  );
  assert.equal(
    reconcileProgress(initial, JSON.parse(JSON.stringify(initial))),
    initial,
  );
  assert.equal(reconcileProgress(null, next), next);
});

test("malformed and inconsistent results never restore", () => {
  const state = submit(
    newGame("2026-11-04", 0),
    dailyQuestions("2026-11-04")[0].answers[0].canonical,
    1,
  );
  for (const raw of [
    "null",
    "[]",
    "false",
    JSON.stringify({ ...state, results: [null] }),
    JSON.stringify({
      ...state,
      results: [{ ...state.results[0], points: 700 }],
    }),
    JSON.stringify({ ...state, deadline: "tomorrow" }),
  ]) {
    assert.equal(restore(raw, state.date), null);
  }
});

test("aliases are unambiguous within each prompt", () => {
  for (const question of QUESTIONS) {
    const seen = new Map<string, string>();
    for (const answer of question.answers)
      for (const alias of [answer.canonical, ...answer.variants]) {
        const key = normalize(alias);
        assert.ok(key.length > 0);
        assert.ok(
          !seen.has(key) || seen.get(key) === answer.canonical,
          `${question.id}: ${alias}`,
        );
        seen.set(key, answer.canonical);
      }
  }
});
