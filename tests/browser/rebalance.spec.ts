import { test, expect } from "@playwright/test";
import {
  newGame,
  dailyQuestions,
  submit,
  advance,
  type GameState,
} from "../../lib/game";
function fixture(id: string): GameState {
  for (let day = 1; day <= 60; day++) {
    const date = new Date(Date.UTC(2026, 10, day)).toISOString().slice(0, 10);
    const now = Date.parse(date + "T12:00:00Z");
    let state = newGame(date, now);
    for (const q of dailyQuestions(date)) {
      if (q.id === id) return state;
      state = advance(submit(state, q.answers[0].canonical, now + 1), now);
    }
  }
  throw new Error(`Missing fixture ${id}`);
}
for (const row of [
  { id: "friend", invalid: "stranger", input: "brah", canonical: "bro" },
  { id: "money", invalid: "cash", input: "motion", canonical: "motion" },
  {
    id: "attractive",
    invalid: "beautiful",
    input: "fine shyt",
    canonical: "fine shit",
  },
])
  test(`rebalanced ${row.id} rejects a generic answer and recognizes requested slang`, async ({
    page,
  }) => {
    const state = fixture(row.id);
    await page.clock.install({ time: new Date(state.deadline - 25000) });
    await page.addInitScript(
      (state) =>
        localStorage.setItem(
          `slangillion:v1:${state.date}`,
          JSON.stringify(state),
        ),
      state,
    );
    await page.goto("/");
    await page.getByRole("button", { name: "RESUME DAILY" }).click();
    await page.getByLabel("Your slang expression").fill(row.invalid);
    await page.getByLabel("Your slang expression").press("Enter");
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Slang not recognized! Try another word.",
    );
    expect(
      await page.evaluate(
        (date) =>
          JSON.parse(localStorage.getItem(`slangillion:v1:${date}`)!).results
            .length,
        state.date,
      ),
    ).toBe(state.results.length);
    await page.getByLabel("Your slang expression").fill(row.input);
    await page.getByLabel("Your slang expression").press("Enter");
    await expect(page.locator(".reveal h1")).toHaveText(row.canonical);
    const saved = await page.evaluate(
      (date) => JSON.parse(localStorage.getItem(`slangillion:v1:${date}`)!),
      state.date,
    );
    expect(saved.results.at(-1).recognitionVersion).toBe(4);
    expect(saved.results.at(-1).points).toBeGreaterThan(0);
    expect(saved.results.length).toBe(state.results.length + 1);
  });
