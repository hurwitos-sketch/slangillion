import { QUESTIONS, type Tier } from "./data";
export const ROUND_MS = 25_000;
export type Result = {
  questionId: string;
  answer: string;
  canonical: string | null;
  tier: Tier | null;
  points: number;
  timedOut: boolean;
};
export type GameState = {
  version: 1;
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
export const normalize = (s: string) =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
export function evaluate(
  questionId: string,
  input: string,
  timedOut = false,
): Result {
  const q = QUESTIONS.find((q) => q.id === questionId);
  const normalized = normalize(input);
  const a =
    timedOut || !normalized
      ? undefined
      : q?.answers.find((a) =>
          [a.canonical, ...a.variants].some((v) => normalize(v) === normalized),
        );
  return {
    questionId,
    answer: input.trim().slice(0, 80),
    canonical: a?.canonical ?? null,
    tier: a?.tier ?? null,
    points: a?.points ?? 0,
    timedOut,
  };
}
export function newGame(date = utcDate(), now = Date.now()): GameState {
  return {
    version: 1,
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
      s.version !== 1 ||
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
      const checked = evaluate(r.questionId, r.answer, r.timedOut);
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
export function shareText(s: GameState, url: string) {
  const icons = ["🩶", "🩵", "💜", "🧡", "❤️"];
  return `SLANGILLION #${String(challengeNumber(s.date)).padStart(3, "0")}\nHow deep is your slang?\nScore: ${total(s)}/700\n${s.results.map((r) => (r.tier ? icons[r.tier - 1] : "⬛")).join(" ")}\nCan you go deeper?\n${url}`;
}
