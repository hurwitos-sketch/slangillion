import { reconcileProgress, restore, type GameState } from "./game";

export const storageKey = (date: string) => `slangillion:v1:${date}`;

export function readProgress(
  date: string,
  local: GameState | null = null,
): GameState | null {
  const current = local?.date === date ? local : null;
  try {
    return reconcileProgress(
      current,
      restore(localStorage.getItem(storageKey(date)), date),
    );
  } catch {
    return current;
  }
}
