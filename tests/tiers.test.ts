import { test } from "node:test";
import assert from "node:assert/strict";
import { TIERS, QUESTIONS } from "../lib/data";
import { UNDERGROUND_ANSWERS } from "../lib/slang-bank";
import {
  evaluate,
  resultTier,
  restore,
  newGame,
  dailyQuestions,
  type Result,
} from "../lib/game";
import { recognize as recognizeV3 } from "../lib/recognition-v3";
test("exactly four destinations with requested values and no scored city", () => {
  assert.deepEqual(
    TIERS.map((t) => [t.name, t.points]),
    [
      ["Subway", 20],
      ["Caves", 50],
      ["Trenches", 85],
      ["The Underground", 100],
    ],
  );
});
test("one canonical Underground answer per prompt; its aliases inherit 100", () => {
  for (const q of QUESTIONS) {
    const top = q.answers.filter((a) => a.tier === 4);
    assert.equal(top.length, 1, q.id);
    assert.equal(top[0].canonical, UNDERGROUND_ANSWERS[q.id]);
    for (const input of [top[0].canonical, ...top[0].aliases]) {
      const result = evaluate(q.id, input);
      assert.equal(result.points, 100, input);
      assert.equal(result.tier, 4);
      assert.equal(result.recognitionVersion, 4);
    }
    for (const a of q.answers.filter((a) => a.tier !== 4))
      assert.ok([20, 50, 85].includes(a.points));
  }
});
test("legacy results safely map to four visible levels without changing earned scores", () => {
  const base = {
    questionId: "money",
    answer: "guap",
    canonical: "guap",
    points: 50,
    timedOut: false,
    recognitionVersion: 3 as const,
  };
  assert.equal(resultTier({ ...base, tier: 3 }), 2);
  assert.equal(resultTier({ ...base, tier: 4 }), 3);
  assert.equal(resultTier({ ...base, tier: 5 }), 4);
  assert.equal(resultTier({ ...base, tier: 4, recognitionVersion: 4 }), 4);
});
test("version 3 saved results retain their original five-tier scoring", () => {
  const date = "2026-11-04";
  const q = dailyQuestions(date)[0];
  const previous = recognizeV3(q.id, q.answers[0].canonical)!.answer;
  const result: Result = {
    questionId: q.id,
    answer: previous.canonical,
    canonical: previous.canonical,
    tier: previous.tier,
    points: previous.points,
    timedOut: false,
    recognitionVersion: 3,
  };
  const state = { ...newGame(date, 1000), phase: "reveal", results: [result] };
  const restored = restore(JSON.stringify(state), date);
  assert.ok(restored);
  assert.equal(restored.results[0].points, previous.points);
  assert.equal(restored.results[0].recognitionVersion, 3);
});
