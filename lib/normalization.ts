// Preserve supported laughter emoji, word boundaries, and meaning-changing words.
// In particular, punctuation removal never removes the word "no" from "no cap".
export const normalize = (input: string) =>
  input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}\s💀😂🤣😭]/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
