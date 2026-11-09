import { QUESTIONS, type Tier } from "./data";
import { QUESTIONS as LEGACY_QUESTIONS } from "./legacy-data";
import { recognize } from "./recognition";
import { recognize as recognizeV2 } from "./recognition-v2";
import { recognize as recognizeV3 } from "./recognition-v3";
import { TIERS } from "./tiers";
export { normalize } from "./recognition";
export const ROUND_MS = 25_000;
export type Result = {
  questionId: string;
  answer: string;
  canonical: string | null;
  tier: Tier | 5 | null;
  points: number;
  timedOut: boolean;
  recognitionVersion?: 2 | 3 | 4;
};
export type GameState = {
  version: 1 | 2;
  date: string;
  index: number;
  phase: "answer" | "reveal" | "complete";
  deadline: number;
  results: Result[];
};
export const utcDate = (now = Date.now()) =>
  new Date(now).toISOString().slice(0, 10);
export const challengeNumber = (date: string) =>
  Math.max(
    1,
    Math.floor(
      (Date.parse(date + "T00:00:00Z") - Date.UTC(2026, 0, 1)) / 86400000,
    ) + 1,
  );
export function dailyQuestions(date: string) {
  let seed = 2166136261;
  for (const c of date)
    seed = Math.imul(seed ^ c.charCodeAt(0), 16777619) >>> 0;
  const pool = [...QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 7);
}
export function evaluate(
  questionId: string,
  input: string,
  timedOut = false,
): Result {
  const a = timedOut ? undefined : recognize(questionId, input)?.answer;
  return {
    questionId,
    answer: input.trim().slice(0, 80),
    canonical: a?.canonical ?? null,
    tier: a?.tier ?? null,
    points: a?.points ?? 0,
    timedOut,
    recognitionVersion: 4,
  };
}
function evaluateV2(
  questionId: string,
  input: string,
  timedOut: boolean,
): Result {
  const a = timedOut ? undefined : recognizeV2(questionId, input)?.answer;
  return {
    questionId,
    answer: input,
    canonical: a?.canonical ?? null,
    tier: a?.tier ?? null,
    points: a?.points ?? 0,
    timedOut,
    recognitionVersion: 2,
  };
}
function evaluateV3(
  questionId: string,
  input: string,
  timedOut: boolean,
): Result {
  const a = timedOut ? undefined : recognizeV3(questionId, input)?.answer;
  return {
    questionId,
    answer: input,
    canonical: a?.canonical ?? null,
    tier: a?.tier ?? null,
    points: a?.points ?? 0,
    timedOut,
    recognitionVersion: 3,
  };
}
export function resultTier(result: Result | undefined): Tier | null {
  if (!result?.tier) return null;
  if (result.recognitionVersion === 4) return result.tier as Tier;
  return result.tier === 5
    ? 4
    : result.tier === 4
      ? 3
      : result.tier === 3
        ? 2
        : result.tier;
}
export function tierInfo(result: Result) {
  const tier = resultTier(result);
  return tier ? TIERS[tier - 1] : null;
}
// Original stored rounds are validated against their original editorial scores.
// They are never rescored or erased when the current bank changes.
function evaluateLegacy(
  questionId: string,
  input: string,
  timedOut: boolean,
): Result {
  const legacyNormalize = (s: string) =>
    s
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .trim()
      .replace(/\s+/g, " ");
  const key = legacyNormalize(input);
  const a =
    timedOut || !key
      ? undefined
      : LEGACY_QUESTIONS.find((q) => q.id === questionId)?.answers.find((a) =>
          [a.canonical, ...a.variants].some((v) => legacyNormalize(v) === key),
        );
  return {
    questionId,
    answer: input,
    canonical: a?.canonical ?? null,
    tier: a?.tier ?? null,
    points: a?.points ?? 0,
    timedOut,
  };
}
export function newGame(date = utcDate(), now = Date.now()): GameState {
  return {
    version: 2,
    date,
    index: 0,
    phase: "answer",
    deadline: now + ROUND_MS,
    results: [],
  };
}
export function submit(
  state: GameState,
  input: string,
  now = Date.now(),
): GameState {
  if (state.phase !== "answer") return state;
  const result = evaluate(
    dailyQuestions(state.date)[state.index].id,
    input,
    now >= state.deadline,
  );
  if (!result.timedOut && !result.tier) return state;
  return { ...state, phase: "reveal", results: [...state.results, result] };
}
export function advance(state: GameState, now = Date.now()): GameState {
  if (state.phase !== "reveal") return state;
  return state.index === 6
    ? { ...state, phase: "complete" }
    : {
        ...state,
        index: state.index + 1,
        phase: "answer",
        deadline: now + ROUND_MS,
      };
}
export function restore(raw: string | null, date: string): GameState | null {
  try {
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    if (
      (s.version !== 1 && s.version !== 2) ||
      s.date !== date ||
      !Number.isInteger(s.index) ||
      s.index < 0 ||
      s.index > 6 ||
      !["answer", "reveal", "complete"].includes(s.phase) ||
      !Number.isFinite(s.deadline) ||
      !Array.isArray(s.results) ||
      s.results.length !== (s.phase === "answer" ? s.index : s.index + 1) ||
      (s.phase === "complete" && s.index !== 6)
    )
      return null;
    const questions = dailyQuestions(date);
    for (const [i, r] of s.results.entries()) {
      if (
        typeof r.answer !== "string" ||
        typeof r.timedOut !== "boolean" ||
        r.questionId !== questions[i].id
      )
        return null;
      if (
        r.recognitionVersion !== undefined &&
        r.recognitionVersion !== 2 &&
        r.recognitionVersion !== 3 &&
        r.recognitionVersion !== 4
      )
        return null;
      const checked =
        r.recognitionVersion === 4
          ? evaluate(r.questionId, r.answer, r.timedOut)
          : r.recognitionVersion === 3
            ? evaluateV3(r.questionId, r.answer, r.timedOut)
            : r.recognitionVersion === 2
              ? evaluateV2(r.questionId, r.answer, r.timedOut)
              : evaluateLegacy(r.questionId, r.answer, r.timedOut);
      if (r.recognitionVersion !== undefined && !r.timedOut && !checked.tier)
        return null;
      if (
        checked.points !== r.points ||
        checked.tier !== r.tier ||
        checked.canonical !== r.canonical
      )
        return null;
    }
    return s;
  } catch {
    return null;
  }
}
export const total = (s: GameState) =>
  s.results.reduce((sum, r) => sum + r.points, 0);
// Keep delayed events from rewinding a day's progress. On equal stages, storage
// is authoritative, except an active round must never gain a later deadline.
export function reconcileProgress(
  local: GameState | null,
  stored: GameState | null,
): GameState | null {
  if (!local) return stored;
  if (!stored || local.date !== stored.date) return local;
  const stage = (state: GameState) =>
    state.index * 2 +
    (state.phase === "answer" ? 0 : state.phase === "reveal" ? 1 : 2);
  if (stage(local) !== stage(stored))
    return stage(local) > stage(stored) ? local : stored;
  if (local.phase === "answer" && local.deadline < stored.deadline)
    return local;
  return JSON.stringify(local) === JSON.stringify(stored) ? local : stored;
}
export function shareText(s: GameState, url: string) {
  const icons = ["🩶", "🩵", "🧡", "❤️"];
  return `SLANGILLION #${String(challengeNumber(s.date)).padStart(3, "0")}\nHow deep is your slang?\nScore: ${total(s)}/700\n${s.results
    .map((r) => {
      const tier = resultTier(r);
      return tier ? icons[tier - 1] : "⬛";
    })
    .join(" ")}\nCan you go deeper?\n${url}`;
}
