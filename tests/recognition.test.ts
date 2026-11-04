import { test } from "node:test";
import assert from "node:assert/strict";
import { SLANG_BANK, OVERHAULED_QUESTIONS } from "../lib/slang-bank";
import { QUESTIONS, TIERS } from "../lib/data";
import { QUESTIONS as LEGACY } from "../lib/legacy-data";
import { recognize, normalize } from "../lib/recognition";
import {
  advance,
  dailyQuestions,
  newGame,
  restore,
  submit,
  total,
  type GameState,
  type Result,
} from "../lib/game";

test("every canonical and registered alias resolves to exactly one answer and inherits its score", () => {
  for (const q of OVERHAULED_QUESTIONS) {
    const rows = SLANG_BANK.filter((a) => a.question === q);
    assert.ok(rows.length >= 40 && rows.length <= 60, `${q}: ${rows.length}`);
    const seen = new Set<string>();
    for (const entry of rows) {
      assert.equal(entry.points, TIERS[entry.tier - 1].points);
      for (const input of [entry.canonical, ...entry.aliases]) {
        const key = normalize(input);
        assert.ok(!seen.has(key), `${q}: duplicate input ${input}`);
        seen.add(key);
        for (const variant of [input, `  ${input.toUpperCase()}!!!  `]) {
          const match = recognize(q, variant);
          assert.equal(
            match?.answer.canonical,
            entry.canonical,
            `${q}: ${variant}`,
          );
          assert.equal(match?.answer.points, entry.points);
        }
      }
    }
  }
});
test("the seven requested original answers are reviewed rather than accepted indiscriminately", () => {
  for (const [q, input, expected] of [
    ["attractive", "trim", null],
    ["poor", "broke", "broke"],
    ["lying", "fraud", null],
    ["angry", "crash out", "crash out"],
    ["partying", "turnt", "turnt"],
    ["laughing", "silly", null],
    ["talking", "yap", "yap"],
  ] as const)
    assert.equal(recognize(q, input)?.answer.canonical ?? null, expected);
});
test("specified variants, punctuation, morphology, emoji and obvious typos autocorrect", () => {
  const cases: [string, string, string][] = [
    ["poor", "broke boy", "broke"],
    ["poor", "broke girl", "broke"],
    ["poor", "broke af", "broke"],
    ["poor", "dead broke", "broke"],
    ["poor", "brokke", "broke"],
    ["poor", "borke", "broke"],
    ["talking", "yapping", "yap"],
    ["talking", "yappin", "yap"],
    ["talking", "yapper", "yap"],
    ["talking", "yaping", "yap"],
    ["lying", "capping", "cap"],
    ["lying", "cappin", "cap"],
    ["lying", "big cap", "cap"],
    ["angry", "crashing out", "crash out"],
    ["angry", "crashout", "crash out"],
    ["angry", "crashng out", "crash out"],
    ["partying", "getting turnt", "turnt"],
    ["partying", "turnt up", "turnt"],
    ["partying", "turntt", "turnt"],
    ["laughing", "lmaooo", "lmao"],
    ["laughing", "lmfaO", "lmao"],
    ["laughing", "im dead", "I'm dead"],
    ["laughing", "wheezinggg", "wheezing"],
    ["laughing", "😂", "I'm crying"],
    ["laughing", "💀💀", "I'm dead"],
    ["attractive", "face card never decline", "face card never declines"],
    ["attractive", "10/10", "ten"],
    ["poor", "pockets on E", "pockets on E"],
  ];
  for (const [q, input, expected] of cases)
    assert.equal(
      recognize(q, input)?.answer.canonical,
      expected,
      `${q}: ${input}`,
    );
});
test("meaning-changing negation, unrelated words, random inputs and unsafe close spellings reject", () => {
  const cases: [string, string][] = [
    ["lying", "no cap"],
    ["lying", "no capping"],
    ["lying", "not cap"],
    ["lying", "gaslighting"],
    ["lying", "fraud"],
    ["attractive", "trim"],
    ["attractive", "gyatt"],
    ["attractive", "drippy"],
    ["attractive", "ate"],
    ["attractive", "mogging"],
    ["laughing", "silly"],
    ["laughing", "serious"],
    ["poor", "brake"],
    ["poor", "broccoli"],
    ["poor", "book"],
    ["poor", "not broke"],
    ["angry", "crushing out"],
    ["angry", "not angry"],
    ["talking", "vaping"],
    ["partying", "vibing"],
    ["partying", "link up"],
    ["partying", "good vibes"],
    ["poor", "rich"],
    ["money", "broke"],
    ["talking", "turnt"],
    ["laughing", "yap"],
    ["partying", "💀"],
    ["angry", "💀"],
    ["lying", "🧢"],
  ];
  for (const [q, input] of cases)
    assert.equal(recognize(q, input), null, `${q}: ${input}`);
  for (const q of OVERHAULED_QUESTIONS)
    for (const input of [
      "",
      " ",
      "!!!",
      "qzxvplm",
      "banana spaceship",
      "not " + q,
      "a".repeat(81),
    ])
      assert.equal(recognize(q, input), null, `${q}: ${input}`);
});
test("distinct expressions stay distinct instead of becoming a single generic answer", () => {
  const groups: Record<string, string[]> = {
    poor: ["broke", "pockets on E", "financially cooked", "in the trenches"],
    angry: ["pressed", "salty", "heated", "crash out"],
    talking: ["yap", "chop it up", "spill the tea", "run your mouth"],
  };
  for (const [q, inputs] of Object.entries(groups))
    assert.equal(
      new Set(inputs.map((input) => recognize(q, input)?.answer.canonical))
        .size,
      inputs.length,
    );
});
test("invalid attempts are a no-op for all seven categories; valid answers lock once", () => {
  for (const q of OVERHAULED_QUESTIONS) {
    let state: GameState | undefined;
    outer: for (let day = 1; day <= 100; day++) {
      const date = new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10);
      let s = newGame(date, 1000);
      for (let i = 0; i < 7; i++) {
        if (dailyQuestions(date)[i].id === q) {
          state = s;
          break outer;
        }
        s = advance(
          submit(s, dailyQuestions(date)[i].answers[0].canonical, 1001),
          1000,
        );
      }
    }
    assert.ok(state);
    const before = JSON.stringify(state);
    for (const input of [
      "not a real slang answer",
      "qzxvplm",
      "",
      "   ",
      "!!!",
    ]) {
      assert.equal(submit(state, input, 1001), state);
      assert.equal(JSON.stringify(state), before);
    }
    const accepted = submit(
      state,
      SLANG_BANK.find((a) => a.question === q)!.canonical,
      1002,
    );
    assert.equal(accepted.phase, "reveal");
    assert.equal(accepted.results.length, state.results.length + 1);
    assert.equal(submit(accepted, "different", 1003), accepted);
    assert.equal(accepted.index, state.index);
    assert.equal(accepted.deadline, state.deadline);
    assert.ok(total(accepted) > total(state));
    const timedOut = submit(state, "no match", state.deadline);
    assert.equal(timedOut.results.at(-1)?.points, 0);
    assert.equal(timedOut.results.at(-1)?.timedOut, true);
  }
});
test("existing question order and non-target category vocabularies are unchanged", () => {
  assert.deepEqual(
    QUESTIONS.map((q) => q.id),
    LEGACY.map((q) => q.id),
  );
  for (const q of QUESTIONS.filter((q) => !OVERHAULED_QUESTIONS.includes(q.id)))
    assert.deepEqual(
      q.answers.map(({ aliases, ...a }) => {
        void aliases;
        return a;
      }),
      LEGACY.find((old) => old.id === q.id)!.answers,
    );
});
test("old completed and unfinished games retain original editorial scores", () => {
  const date = "2026-11-04";
  let legacy: GameState = { ...newGame(date, 1000), version: 1 };
  for (const q of dailyQuestions(date)) {
    const old = LEGACY.find((old) => old.id === q.id)!.answers.at(-1)!;
    const r: Result = {
      questionId: q.id,
      answer: old.canonical,
      canonical: old.canonical,
      tier: old.tier,
      points: old.points,
      timedOut: false,
    };
    legacy = { ...legacy, phase: "reveal", results: [...legacy.results, r] };
    assert.deepEqual(restore(JSON.stringify(legacy), date), legacy);
    legacy = advance(legacy, 1000);
  }
  assert.equal(legacy.phase, "complete");
  assert.deepEqual(restore(JSON.stringify(legacy), date), legacy);
  const oldInvalid: GameState = {
    ...newGame(date, 1000),
    version: 1,
    phase: "reveal",
    results: [
      {
        questionId: dailyQuestions(date)[0].id,
        answer: "made up slang",
        canonical: null,
        tier: null,
        points: 0,
        timedOut: false,
      },
    ],
  };
  assert.deepEqual(restore(JSON.stringify(oldInvalid), date), oldInvalid);
});
test("modern results cannot restore an invalid answer as a completed round", () => {
  const s = newGame("2026-11-04", 1000);
  const invalid = {
    ...s,
    phase: "reveal",
    results: [
      {
        questionId: dailyQuestions(s.date)[0].id,
        answer: "qzxvplm",
        canonical: null,
        tier: null,
        points: 0,
        timedOut: false,
        recognitionVersion: 2,
      },
    ],
  };
  assert.equal(restore(JSON.stringify(invalid), s.date), null);
});
