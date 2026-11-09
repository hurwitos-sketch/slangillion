import { QUESTIONS as ORIGINAL_QUESTIONS } from "./legacy-data";
import { SLANG_BANK } from "./slang-bank";
export { TIERS } from "./tiers";
export type { Tier } from "./tiers";
export type Answer = {
  canonical: string;
  variants: string[];
  aliases: string[];
  prompt: string;
  tier: import("./tiers").Tier;
  points: number;
  explanation: string;
  reviewStatus: "editorially-reviewed";
};
export type Question = { id: string; label: string; answers: Answer[] };
// Preserve the original category array order: the seeded daily shuffle is stable.
export const QUESTIONS: Question[] = ORIGINAL_QUESTIONS.map((q) => ({
  id: q.id,
  label: q.label,
  answers: SLANG_BANK.filter((a) => a.question === q.id).map((a) => ({
    canonical: a.canonical,
    variants: a.aliases,
    aliases: a.aliases,
    prompt: a.question,
    tier: a.tier,
    points: a.points,
    explanation: a.explanation,
    reviewStatus: a.reviewStatus,
  })),
}));
