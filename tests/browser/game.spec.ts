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
    const tier = i < 4 ? i + 1 : 1;
    const answer = questions[i].answers.find((a) => a.tier === tier)!.canonical;
    if (i === 0) {
      const deadline = await page.evaluate(
        (date) =>
          JSON.parse(localStorage.getItem(`slangillion:v1:${date}`)!).deadline,
        date,
      );
      await page.reload();
      await page
        .getByRole("button", { name: /RESUME DAILY|VIEW RESULTS/ })
        .click();
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
    if (i === 5) {
      await page.getByLabel("Your slang expression").fill("invented nonsense");
      await page.getByLabel("Your slang expression").press("Enter");
      await expect(page.getByRole("main").getByRole("alert")).toHaveText(
        "Slang not recognized! Try another word.",
      );
      await expect(page.getByLabel("Your slang expression")).toHaveValue(
        "invented nonsense",
      );
      await expect(
        page.getByRole("button", { name: "Next round" }),
      ).toHaveCount(0);
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
    }
    await page.getByLabel("Your slang expression").fill(answer);
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
    await page.getByLabel("Your slang expression").press("Enter");
    await expect(page.locator(".points")).toContainText(
      `+${[20, 50, 85, 100][tier - 1]}`,
    );
    await page
      .getByRole("button", { name: i === 6 ? "See my results" : "Next round" })
      .click();
  }
  await expect(page.locator(".final-score")).toContainText("315");
  await expect(page.locator(".result-list>div")).toHaveCount(7);
  await page.reload();
  await page.getByRole("button", { name: /RESUME DAILY|VIEW RESULTS/ }).click();
  await expect(page.locator(".final-score")).toContainText("315");
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
    "Score: 315/700",
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
  await page.getByRole("button", { name: /RESUME DAILY|VIEW RESULTS/ }).click();
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
  await page.getByRole("button", { name: /RESUME DAILY|VIEW RESULTS/ }).click();
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
  await page.getByRole("button", { name: /RESUME DAILY|VIEW RESULTS/ }).click();
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

test("delayed storage events cannot rewind a round or erase a draft", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play Daily" }).click();
  const date = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  const old = await page.evaluate(
    (date) => localStorage.getItem(`slangillion:v1:${date}`)!,
    date,
  );
  await page
    .getByLabel("Your slang expression")
    .fill(dailyQuestions(date)[0].answers[0].canonical);
  await page.getByLabel("Your slang expression").press("Enter");
  await page.getByRole("button", { name: "Next round" }).click();
  await page.getByLabel("Your slang expression").fill("draft answer");
  await page.evaluate(
    ({ date, old }) =>
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `slangillion:v1:${date}`,
          newValue: old,
        }),
      ),
    { date, old },
  );
  await expect(page.locator(".game-top")).toContainText("ROUND 2 OF 7");
  await expect(page.getByLabel("Your slang expression")).toHaveValue(
    "draft answer",
  );
});

test("failed native share falls back to clipboard; cancellation is quiet", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const { newGame, submit, advance } = await import("../../lib/game");
  const date = new Date().toISOString().slice(0, 10);
  let state = newGame(date);
  for (const q of dailyQuestions(date))
    state = advance(submit(state, q.answers[0].canonical, state.deadline - 1));
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem(
        `slangillion:v1:${state.date}`,
        JSON.stringify(state),
      ),
    state,
  );
  await page.reload();
  await page.getByRole("button", { name: /RESUME DAILY|VIEW RESULTS/ }).click();
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => {
        throw new DOMException("Not supported", "NotSupportedError");
      },
    }),
  );
  await page.getByRole("button", { name: "Share your depth" }).click();
  await expect(page.getByRole("status")).toContainText("Results copied");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => {
        throw new DOMException("Cancelled", "AbortError");
      },
    }),
  );
  await page.getByRole("button", { name: "Share your depth" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(
    page.getByRole("textbox", { name: "Copy your results" }),
  ).toHaveCount(0);
});

test("storage failures keep the game playable and show an honest warning", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Play Daily" }).click();
  await expect(page.getByRole("status")).toContainText(
    "progress cannot be saved",
  );
  const date = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  await page
    .getByLabel("Your slang expression")
    .fill(dailyQuestions(date)[0].answers[0].canonical);
  await page.getByLabel("Your slang expression").press("Enter");
  await expect(page.locator(".points")).toContainText("+20");
});

test("multiple tabs share locked answers without duplicating points", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/");
  await page.getByRole("button", { name: "Play Daily" }).click();
  await other.getByRole("button", { name: "RESUME DAILY" }).click();
  await expect(other.getByLabel("Your slang expression")).toBeVisible();
  const date = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  await page
    .getByLabel("Your slang expression")
    .fill(dailyQuestions(date)[0].answers[0].canonical);
  await page.getByLabel("Your slang expression").press("Enter");
  await expect(other.locator(".points")).toContainText("+20");
  await other.getByRole("button", { name: "Next round" }).click();
  await expect(page.locator(".game-top")).toContainText("ROUND 2 OF 7");
  expect(
    await page.evaluate(
      (date) =>
        JSON.parse(localStorage.getItem(`slangillion:v1:${date}`)!).results
          .length,
      date,
    ),
  ).toBe(1);
  await other.close();
});

test("keyboard focus follows reveals, next round, and results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play Daily" }).click();
  await expect(page.getByLabel("Your slang expression")).toBeFocused();
  const date = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  await page
    .getByLabel("Your slang expression")
    .fill(dailyQuestions(date)[0].answers[0].canonical);
  await page.getByLabel("Your slang expression").press("Enter");
  await expect(page.locator(".reveal h1")).toBeFocused();
  await expect(page.getByRole("button", { name: "Next round" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Next round" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Your slang expression")).toBeFocused();
});

test("phone widths and reduced motion keep the game usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Play Daily" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 640 });
  await page.getByRole("button", { name: "Play Daily" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("midnight restores an already-started new daily instead of restarting it", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-04T23:59:59Z") });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Play Daily" })).toBeVisible();
  const { newGame, submit, advance } = await import("../../lib/game");
  const date = "2026-11-05";
  let state = newGame(date, Date.parse("2026-11-05T00:00:00Z"));
  state = advance(
    submit(
      state,
      dailyQuestions(date)[0].answers[0].canonical,
      state.deadline - 1,
    ),
    Date.parse("2026-11-05T00:00:01Z"),
  );
  await page.evaluate(
    (state) =>
      localStorage.setItem(
        `slangillion:v1:${state.date}`,
        JSON.stringify(state),
      ),
    state,
  );
  await page.clock.fastForward(1500);
  await page.getByRole("button", { name: "RESUME DAILY" }).click();
  await expect(page.locator(".game-top")).toContainText("ROUND 2 OF 7");
  await expect(page.getByRole("button", { name: "Play Daily" })).toHaveCount(0);
});

test("a queued cross-tab update cannot submit an old answer to the next prompt", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play Daily" }).click();
  await page.getByLabel("Your slang expression").fill("old draft");
  const { submit, advance } = await import("../../lib/game");
  const state = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem(
        `slangillion:v1:${new Date().toISOString().slice(0, 10)}`,
      )!,
    ),
  );
  const next = advance(
    submit(
      state,
      dailyQuestions(state.date)[0].answers[0].canonical,
      state.deadline - 1,
    ),
  );
  await page.evaluate(
    (next) =>
      localStorage.setItem(`slangillion:v1:${next.date}`, JSON.stringify(next)),
    next,
  );
  await page.getByRole("button", { name: "Lock it in" }).click();
  await expect(page.locator(".game-top")).toContainText("ROUND 2 OF 7");
  await expect(page.getByLabel("Your slang expression")).toHaveValue("");
  expect(
    await page.evaluate(
      (date) =>
        JSON.parse(localStorage.getItem(`slangillion:v1:${date}`)!).results
          .length,
      state.date,
    ),
  ).toBe(1);
});
