import { test, expect } from "@playwright/test";
import { dailyQuestions } from "../../lib/game";
test("complete daily game, resume, all reveals and clipboard fallback", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Play Daily" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Play Daily" }).click();
  const date = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  const questions = dailyQuestions(date);
  await page.getByRole("button", { name: "Lock it in" }).click();
  await expect(page.getByRole("status")).toContainText("Enter an expression");
  for (let i = 0; i < 7; i++) {
    const tier = i < 5 ? i + 1 : 1;
    const answer =
      i === 5
        ? "invented nonsense"
        : questions[i].answers.find((a) => a.tier === tier)!.canonical;
    if (i === 0) {
      const deadline = await page.evaluate(
        (date) =>
          JSON.parse(localStorage.getItem(`slangillion:v1:${date}`)!).deadline,
        date,
      );
      await page.reload();
      await expect(page.getByLabel("Your slang expression")).toBeVisible();
      expect(
        await page.evaluate(
          (date) =>
            JSON.parse(localStorage.getItem(`slangillion:v1:${date}`)!)
              .deadline,
          date,
        ),
      ).toBe(deadline);
    }
    await page.getByLabel("Your slang expression").fill(answer);
    await page.getByLabel("Your slang expression").press("Enter");
    if (i === 5) {
      await expect(
        page.getByRole("heading", { name: "No score this round" }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "My answer should count" })
        .click();
      await expect(
        page.getByRole("button", { name: "Feedback saved" }),
      ).toBeDisabled();
      expect(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("slangillion:feedback")!).length,
        ),
      ).toBe(1);
    } else
      await expect(page.locator(".points")).toContainText(
        `+${[10, 25, 50, 75, 100][tier - 1]}`,
      );
    await page
      .getByRole("button", { name: i === 6 ? "See my results" : "Next round" })
      .click();
  }
  await expect(page.locator(".final-score")).toContainText("270");
  await expect(page.locator(".result-list>div")).toHaveCount(7);
  await page.reload();
  await expect(page.locator(".final-score")).toContainText("270");
  await expect(page.getByRole("button", { name: "Play Daily" })).toHaveCount(0);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.getByRole("button", { name: "Share your depth" }).click();
  await expect(page.getByRole("status")).toContainText("Results copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "Score: 270/700",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("expired round after refresh scores zero; midnight unlocks next daily", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-04T23:59:30Z") });
  await page.goto("/");
  await page.getByRole("button", { name: "Play Daily" }).click();
  await page.clock.fastForward(26_000);
  await expect(page.locator(".points")).toContainText("+0");
  await expect(page.getByText("TIME’S UP", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator(".points")).toContainText("+0");
  await page.clock.fastForward(5000);
  await expect(page.getByRole("button", { name: "Play Daily" })).toBeVisible();
});
test("expired saved active round restores to zero", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play Daily" }).click();
  await page.evaluate(() => {
    const key = `slangillion:v1:${new Date().toISOString().slice(0, 10)}`;
    const state = JSON.parse(localStorage.getItem(key)!);
    state.deadline = Date.now() - 1;
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload();
  await expect(page.locator(".points")).toContainText("+0");
  await expect(page.getByText("TIME’S UP", { exact: true })).toBeVisible();
});

test("native sharing and manual copy fallback", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const date = new Date().toISOString().slice(0, 10);
    const response = await fetch("/");
    if (!response.ok) throw new Error("App unavailable");
    localStorage.setItem("test-date", date);
  });
  const date = await page.evaluate(() => localStorage.getItem("test-date")!);
  const { newGame, submit, advance } = await import("../../lib/game");
  let state = newGame(date);
  for (const q of dailyQuestions(date)) {
    state = submit(state, q.answers[0].canonical, state.deadline - 1);
    state = advance(state);
  }
  await page.evaluate(
    (state) =>
      localStorage.setItem(
        `slangillion:v1:${state.date}`,
        JSON.stringify(state),
      ),
    state,
  );
  await page.reload();
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        sessionStorage.setItem("shared", data.text!);
      },
    }),
  );
  await page.getByRole("button", { name: "Share your depth" }).click();
  await expect(page.getByRole("status")).toHaveText("Results shared.");
  expect(await page.evaluate(() => sessionStorage.getItem("shared"))).toContain(
    "SLANGILLION",
  );
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
  });
  await page.getByRole("button", { name: "Share your depth" }).click();
  await expect(
    page.getByRole("textbox", { name: "Copy your results" }),
  ).toContainText("SLANGILLION");
});
