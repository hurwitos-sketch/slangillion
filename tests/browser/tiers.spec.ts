import { test, expect } from "@playwright/test";
import {
  newGame,
  dailyQuestions,
  submit,
  advance,
  type GameState,
  type Result,
} from "../../lib/game";
import { QUESTIONS as V3_QUESTIONS } from "../../lib/data-v3";
test("results have four levels with requested points and no Caves", async ({
  page,
}) => {
  const date = new Date().toISOString().slice(0, 10);
  let state = newGame(date);
  for (const [i, q] of dailyQuestions(date).entries()) {
    state = advance(
      submit(
        state,
        q.answers.find((a) => a.tier === (i % 4) + 1)!.canonical,
        state.deadline - 1,
      ),
    );
  }
  await page.addInitScript(
    (state) =>
      localStorage.setItem(
        `slangillion:v1:${state.date}`,
        JSON.stringify(state),
      ),
    state,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "VIEW RESULTS" }).click();
  await expect(page.locator(".distribution>div")).toHaveCount(4);
  await expect(page.locator(".final-score")).toContainText("410");
  await expect(page.getByText("Caves", { exact: true })).toHaveCount(0);
  await expect(page.locator(".distribution")).toContainText("Trenches");
});
test("old five-tier saved games render safely with original total and four visible levels", async ({
  page,
}) => {
  const date = new Date().toISOString().slice(0, 10);
  let state: GameState = newGame(date);
  for (const q of dailyQuestions(date)) {
    const answer = V3_QUESTIONS.find((old) => old.id === q.id)!.answers.find(
      (a) => a.tier === 5,
    )!;
    const r: Result = {
      questionId: q.id,
      answer: answer.canonical,
      canonical: answer.canonical,
      tier: answer.tier,
      points: answer.points,
      timedOut: false,
      recognitionVersion: 3,
    };
    state = advance({
      ...state,
      phase: "reveal",
      results: [...state.results, r],
    });
  }
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(
    (state) =>
      localStorage.setItem(
        `slangillion:v1:${state.date}`,
        JSON.stringify(state),
      ),
    state,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "VIEW RESULTS" }).click();
  await expect(page.locator(".final-score")).toContainText("700");
  await expect(page.locator(".distribution>div")).toHaveCount(4);
  await expect(page.locator(".result-list")).toContainText("The Underground");
  expect(errors).toEqual([]);
});
