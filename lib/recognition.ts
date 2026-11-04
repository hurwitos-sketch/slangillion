import { QUESTIONS, type Answer } from "./data";
import { normalize } from "./normalization";
export { normalize } from "./normalization";
export type Recognition = {
  answer: Answer;
  matchedBy: "canonical" | "alias" | "spelling" | "fuzzy";
};
const indexes = new Map(
  QUESTIONS.map((question) => {
    const canonical = new Map<string, Answer>();
    const aliases = new Map<string, Answer>();
    for (const answer of question.answers) {
      canonical.set(normalize(answer.canonical), answer);
      for (const alias of answer.aliases) aliases.set(normalize(alias), answer);
    }
    return [question.id, { canonical, aliases }] as const;
  }),
);
function safeTokenTypo(input: string, target: string): boolean {
  if (input.length < 5 || !/^\p{L}+$/u.test(input) || !/^\p{L}+$/u.test(target))
    return false;
  // Adjacent transposed letters, not arbitrary substitution of short words.
  if (input.length === target.length) {
    const differences = [...input].flatMap((c, i) =>
      c === target[i] ? [] : [i],
    );
    if (differences.length === 2) {
      const [a, b] = differences;
      return b === a + 1 && input[a] === target[b] && input[b] === target[a];
    }
    // A single interior mistype in a long word with intact boundaries.
    return (
      input.length >= 8 &&
      differences.length === 1 &&
      input.slice(0, 3) === target.slice(0, 3) &&
      input.slice(-2) === target.slice(-2)
    );
  }
  // A doubled key (brokke) or an omitted interior key in a long word.
  if (input.length === target.length + 1) {
    for (let i = 1; i < input.length; i++)
      if (
        input[i] === input[i - 1] &&
        input.slice(0, i) + input.slice(i + 1) === target
      )
        return true;
  }
  if (
    target.length === input.length + 1 &&
    input.length >= 6 &&
    input.slice(0, 2) === target.slice(0, 2) &&
    input.slice(-2) === target.slice(-2)
  ) {
    for (let i = 2; i < target.length - 2; i++)
      if (target.slice(0, i) + target.slice(i + 1) === input) return true;
  }
  return false;
}
function safePhraseTypo(input: string, target: string): boolean {
  const a = input.split(" "),
    b = target.split(" ");
  if (a.length !== b.length) return false;
  let edits = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    if (++edits > 1 || !safeTokenTypo(a[i], b[i])) return false;
  }
  return edits === 1;
}
export function recognize(
  questionId: string,
  input: string,
): Recognition | null {
  if (input.length > 80) return null;
  const index = indexes.get(questionId);
  const key = normalize(input);
  if (!index || !key) return null;
  const direct = index.canonical.get(key);
  if (direct) return { answer: direct, matchedBy: "canonical" };
  const alias = index.aliases.get(key);
  if (alias) return { answer: alias, matchedBy: "alias" };
  // Only the seven reviewed categories get new spelling/fuzzy behavior.
  if (
    ![
      "attractive",
      "poor",
      "lying",
      "angry",
      "partying",
      "laughing",
      "talking",
    ].includes(questionId)
  )
    return null;
  const spellings = new Set<string>();
  if (questionId === "laughing") {
    if (/^lmf?a+o+$/.test(key)) spellings.add("lmao");
    if (/^(ha){2,}$/.test(key)) spellings.add("haha");
    if (/^([💀😂🤣😭])\1+$/u.test(key)) spellings.add([...key][0]);
  }
  // Expressive final-letter stretches, only if they resolve to a known entry.
  if (/(\p{L})\1{2,}$/u.test(key)) {
    spellings.add(key.replace(/(\p{L})\1{2,}$/u, "$1"));
    spellings.add(key.replace(/(\p{L})\1{2,}$/u, "$1$1"));
  }
  const spellingMatches = new Map<string, Answer>();
  for (const spelling of spellings) {
    const answer = index.canonical.get(spelling) ?? index.aliases.get(spelling);
    if (answer) spellingMatches.set(answer.canonical, answer);
  }
  if (spellingMatches.size === 1)
    return { answer: [...spellingMatches.values()][0], matchedBy: "spelling" };
  if (spellingMatches.size > 1) return null;
  const candidates = new Map<string, Answer>();
  for (const [candidate, answer] of [...index.canonical, ...index.aliases])
    if (safePhraseTypo(key, candidate))
      candidates.set(answer.canonical, answer);
  return candidates.size === 1
    ? { answer: [...candidates.values()][0], matchedBy: "fuzzy" }
    : null;
}
