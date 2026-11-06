import { test, expect } from "@playwright/test";
import {
  dailyQuestions,
  newGame,
  submit,
  advance,
  type GameState,
} from "../../lib/game";
const categories = [
  {
    id: "attractive",
    reject: "trim",
    valid: "face card never decline",
    canonical: "face card never declines",
  },
  { id: "poor", reject: "brake", valid: "brokke", canonical: "broke" },
  { id: "lying", reject: "fraud", valid: "cappin", canonical: "cap" },
  {
    id: "angry",
    reject: "crushing out",
    valid: "crashng out",
    canonical: "crash out",
  },
  { id: "partying", reject: "good vibes", valid: "turntt", canonical: "turnt" },
  { id: "laughing", reject: "silly", valid: "lmaooo", canonical: "lmao" },
  { id: "talking", reject: "vaping", valid: "yaping", canonical: "yap" },
];
function fixtureFor(id: string): GameState {
  for (let day = 1; day <= 100; day++) {
    const date = new Date(Date.UTC(2026, 0, day)).toISOString().slice(0, 10);
    const now = Date.parse(date + "T12:00:00Z");
    let state = newGame(date, now);
    for (const question of dailyQuestions(date)) {
      if (question.id === id) return state;
      state = advance(
        submit(state, question.answers[0].canonical, now + 1),
        now,
      );
    }
  }
  throw new Error(`No fixture for ${id}`);
}
for (const row of categories)
  test(`${row.id}: rejected attempts stay editable; autocorrect locks exactly once`, async ({
    page,
  }) => {
    const state = fixtureFor(row.id);
    const now = state.deadline - 25000;
    await page.clock.install({ time: new Date(now) });
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
    await expect(page.getByLabel("Your slang expression")).toBeVisible();
    const before = await page.evaluate(
      (date) => localStorage.getItem(`slangillion:v1:${date}`),
      state.date,
    );
    const progress = await page.locator(".progress").innerHTML();
    const score = await page.locator(".game-top strong").innerText();
    for (const bad of [row.reject, "qzxvplm", "banana spaceship"]) {
      await page.getByLabel("Your slang expression").fill(bad);
      await page.getByLabel("Your slang expression").press("Enter");
      await expect(page.getByRole("main").getByRole("alert")).toHaveText(
        "Slang not recognized! Try another word.",
      );
      await expect(page.getByLabel("Your slang expression")).toHaveValue(bad);
      await expect(page.getByLabel("Your slang expression")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(await page.locator(".progress").innerHTML()).toBe(progress);
      expect(await page.locator(".game-top strong").innerText()).toBe(score);
      expect(
        await page.evaluate(
          (date) => localStorage.getItem(`slangillion:v1:${date}`),
          state.date,
        ),
      ).toBe(before);
      await expect(page.locator(".reveal")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Next round" }),
      ).toHaveCount(0);
    }
    await page.getByLabel("Your slang expression").fill("");
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
    await page.getByRole("button", { name: "Lock it in" }).click();
    await expect(page.getByRole("status")).toContainText("Enter an expression");
    await page.getByLabel("Your slang expression").fill(row.valid);
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
    await page.locator("form").evaluate((form) => {
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    await expect(page.locator(".reveal h1")).toHaveText(row.canonical);
    const saved = await page.evaluate(
      (date) => JSON.parse(localStorage.getItem(`slangillion:v1:${date}`)!),
      state.date,
    );
    expect(saved.results).toHaveLength(state.results.length + 1);
    expect(saved.results.at(-1).canonical).toBe(row.canonical);
    expect(saved.index).toBe(state.index);
    expect(saved.deadline).toBe(state.deadline);
    expect(saved.results.at(-1).points).toBeGreaterThan(0);
  });

test("invalid retries cannot extend the original countdown", async ({
  page,
}) => {
  const state = fixtureFor("laughing");
  const now = state.deadline - 25000;
  await page.clock.install({ time: new Date(now) });
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
  await page.getByLabel("Your slang expression").fill("silly");
  await page.getByLabel("Your slang expression").press("Enter");
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await page.clock.fastForward(26000);
  await expect(page.getByText("TIME’S UP", { exact: true })).toBeVisible();
  await expect(page.locator(".points")).toContainText("+0");
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});
