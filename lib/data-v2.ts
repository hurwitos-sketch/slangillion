import { QUESTIONS as ORIGINAL_QUESTIONS } from "./legacy-data";
import { SLANG_BANK, OVERHAULED_QUESTIONS } from "./slang-bank-v2";
export { TIERS } from "./legacy-data";
export type { Tier } from "./legacy-data";
export type Answer = {
  canonical: string;
  variants: string[];
  aliases: string[];
  prompt: string;
  tier: import("./legacy-data").Tier;
  points: number;
  explanation: string;
  reviewStatus: "editorially-reviewed";
};
export type Question = { id: string; label: string; answers: Answer[] };
// Preserve the original category array order: the seeded daily shuffle is stable.
export const QUESTIONS: Question[] = ORIGINAL_QUESTIONS.map((q) => ({
  ...q,
  answers: OVERHAULED_QUESTIONS.includes(q.id)
    ? SLANG_BANK.filter((a) => a.question === q.id).map((a) => ({
        canonical: a.canonical,
        variants: a.aliases,
        aliases: a.aliases,
        prompt: a.question,
        tier: a.tier,
        points: a.points,
        explanation: a.explanation,
        reviewStatus: a.reviewStatus,
      }))
    : q.answers.map((a) => ({ ...a, aliases: a.variants })),
}));
