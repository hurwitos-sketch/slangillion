import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS } from "../lib/data";
import { SLANG_BANK } from "../lib/slang-bank";
import { recognize } from "../lib/recognition";
import { recognize as recognizeV2 } from "../lib/recognition-v2";
import {
  advance,
  dailyQuestions,
  newGame,
  restore,
  total,
  type GameState,
  type Result,
} from "../lib/game";
test("requested friend and money slang recognizes in the correct category", () => {
  for (const input of [
    "dawg",
    "jit",
    "fella",
    "guy",
    "bro",
    "brah",
    "fam",
    "ace",
    "homeslice",
  ])
    assert.ok(recognize("friend", input), input);
  for (const input of ["racks", "scratch", "millis", "bands", "bag", "motion"])
    assert.ok(recognize("money", input), input);
  for (const input of [
    "fine shit",
    "fine shyt",
    "baddie",
    "dime",
    "talent",
    "eye candy",
    "dollface",
  ])
    assert.ok(recognize("attractive", input), input);
});
test("ordinary synonyms and their former aliases cannot score in the revised bank", () => {
  assert.equal(recognize("money", "cash"), null);
  assert.equal(recognize("money", "fetia"), null);
  assert.equal(recognize("friend", "slatt"), null);
  for (const input of [
    "hot",
    "hottie",
    "hot af",
    "cute",
    "cutie",
    "sexy",
    "gorgeous",
    "stunning",
    "pretty",
    "beautiful",
    "handsome",
    "good looking",
    "good-looking",
    "geourge",
    "scute",
  ])
    assert.equal(recognize("attractive", input), null, input);
  for (const [q, words] of [
    ["angry", ["mad", "annoyed", "irritated", "livid"]],
    ["talking", ["talk", "talking", "chatting"]],
    ["excellent", ["awesome"]],
    ["showing off", ["brag", "boast"]],
  ] as const)
    for (const word of words)
      assert.equal(recognize(q, word), null, `${q}:${word}`);
});
test("all fifteen categories have comparable depth and a real answer at every scoring tier", () => {
  const counts = QUESTIONS.map((q) => q.answers.length);
  assert.equal(counts.length, 15);
  assert.ok(Math.max(...counts) / Math.min(...counts) <= 1.5);
  for (const q of QUESTIONS) {
    assert.ok(q.answers.length >= 25 && q.answers.length <= 40, q.id);
    for (const tier of [1, 2, 3, 4, 5])
      assert.ok(
        q.answers.some((a) => a.tier === tier),
        `${q.id}:tier${tier}`,
      );
  }
});
test("source status accurately distinguishes checked community definitions from pending research", () => {
  for (const entry of SLANG_BANK) {
    if (entry.sourceStatus === "community-definition-checked")
      assert.ok(entry.sourceUrls.length > 0);
    else assert.equal(entry.sourceStatus, "pending-web-review");
  }
  assert.ok(
    SLANG_BANK.some(
      (a) =>
        a.question === "friend" &&
        a.canonical === "jit" &&
        a.explanation.includes("younger"),
    ),
  );
  assert.ok(
    SLANG_BANK.some(
      (a) =>
        a.question === "money" &&
        a.canonical === "motion" &&
        a.explanation.includes("income"),
    ),
  );
});
test("v2 saved rounds preserve old scores after answers are removed or rescored", () => {
  const date = "2026-11-04";
  let state: GameState = { ...newGame(date, 1000), version: 2 };
  for (const q of dailyQuestions(date)) {
    const old = recognizeV2(
      q.id,
      q.id === "attractive"
        ? "hot"
        : q.id === "money"
          ? "cash"
          : q.id === "talking"
            ? "chat"
            : q.answers[0].canonical,
    )?.answer;
    // Pick a known old entry when the newly added first answer did not exist in v2.
    const fallback =
      old ??
      recognizeV2(
        q.id,
        (
          {
            friend: "buddy",
            leaving: "bye",
            lying: "cap",
            excellent: "cool",
            angry: "mad",
            tired: "beat",
            rich: "loaded",
            poor: "broke",
            partying: "partying",
            laughing: "lol",
            "showing off": "showing off",
            embarrassing: "cringe",
          } as Record<string, string>
        )[q.id],
      )?.answer;
    assert.ok(fallback, q.id);
    const result: Result = {
      questionId: q.id,
      answer: fallback.canonical,
      canonical: fallback.canonical,
      tier: fallback.tier,
      points: fallback.points,
      timedOut: false,
      recognitionVersion: 2,
    };
    state = { ...state, phase: "reveal", results: [...state.results, result] };
    assert.deepEqual(restore(JSON.stringify(state), date), state);
    state = advance(state, 1000);
  }
  assert.equal(state.phase, "complete");
  const restored = restore(JSON.stringify(state), date);
  assert.ok(restored);
  assert.equal(total(restored), total(state));
});
