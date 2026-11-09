import { test, expect, type Page } from "@playwright/test";
import { CHARACTERS, type CharacterId } from "../../lib/characters";
import { dailyQuestions } from "../../lib/game";
import { descentDuration } from "../../lib/descent";
import type { Tier } from "../../lib/tiers";
type Trace = {
  action: string;
  frame: number;
  character: string;
  elapsed: number;
};
async function observe(page: Page) {
  await page.evaluate(() => {
    const state = window as unknown as { descentTrace: Trace[] };
    state.descentTrace = [];
    new MutationObserver(() => {
      const stage = document.querySelector<HTMLElement>(".descent-stage");
      if (!stage) return;
      const row = {
        action: stage.dataset.action!,
        frame: Number(
          stage
            .querySelector("[data-sprite-frame]")
            ?.getAttribute("data-sprite-frame"),
        ),
        character: stage.dataset.character!,
        elapsed: Number(stage.dataset.elapsed),
      };
      const last = state.descentTrace.at(-1);
      if (!last || row.action !== last.action || row.frame !== last.frame)
        state.descentTrace.push(row);
    }).observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-action", "data-sprite-frame", "data-status"],
    });
  });
}
async function start(page: Page, id: CharacterId = "courier") {
  await page.clock.install({ time: new Date("2026-11-09T12:00:00Z") });
  await page.goto("/");
  await page
    .getByRole("radio", {
      name: CHARACTERS.find((c) => c.id === id)!.name,
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "PLAY DAILY" }).click();
  await observe(page);
}
async function lock(page: Page, tier: Tier) {
  const answer = dailyQuestions("2026-11-09")[0].answers.find(
    (a) => a.tier === tier,
  )!;
  await page.getByLabel("Your slang expression").fill(answer.canonical);
  await page.getByLabel("Your slang expression").press("Enter");
  return answer;
}
async function saved(page: Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("slangillion:v1:2026-11-09")!),
  );
}
for (const c of CHARACTERS)
  test(`${c.name} actually walks, digs, falls, lands and enters the portal`, async ({
    page,
  }) => {
    await start(page, c.id);
    const answer = await lock(page, 4);
    expect((await saved(page)).results[0].points).toBe(100);
    await expect(page.locator(".descent-stage")).toHaveAttribute(
      "data-status",
      "playing",
    );
    await expect(page.getByRole("button", { name: "Next round" })).toHaveCount(
      0,
    );
    await expect(page.locator(".descent-stage")).toHaveAttribute(
      "data-status",
      "arrived",
      { timeout: 8000 },
    );
    await expect(page.locator(".descent-stage")).toHaveAttribute(
      "data-character",
      c.id,
    );
    await expect(page.locator(".descent-stage")).toHaveAttribute(
      "data-fallback",
      "false",
    );
    const trace = await page.evaluate(
      () => (window as unknown as { descentTrace: Trace[] }).descentTrace,
    );
    for (const action of [
      "walking",
      "digging",
      "breaking",
      "falling",
      "landing",
      "portal",
      "arrived",
    ])
      expect(
        trace.some((frame) => frame.action === action),
        `${c.id}:${action}`,
      ).toBe(true);
    expect(
      new Set(trace.filter((f) => f.action === "walking").map((f) => f.frame))
        .size,
    ).toBeGreaterThan(1);
    expect(
      new Set(trace.filter((f) => f.action === "digging").map((f) => f.frame))
        .size,
    ).toBeGreaterThan(1);
    expect((await saved(page)).results).toHaveLength(1);
    expect((await saved(page)).results[0].canonical).toBe(answer.canonical);
    await expect(
      page.getByRole("button", { name: "Next round" }),
    ).toBeVisible();
  });
for (const tier of [1, 2, 3, 4] as Tier[])
  test(`tier ${tier} stops at its depth without traveling beyond it`, async ({
    page,
  }) => {
    await start(page);
    await lock(page, tier);
    await expect(page.locator(".descent-stage")).toHaveAttribute(
      "data-status",
      "arrived",
      { timeout: 8000 },
    );
    const trace = await page.evaluate(
      () => (window as unknown as { descentTrace: Trace[] }).descentTrace,
    );
    expect(trace.some((t) => t.action === "portal")).toBe(tier === 4);
    expect(trace.some((t) => t.action === "digging")).toBe(tier >= 2);
    await expect(page.locator(".descent-stage")).toHaveAttribute(
      "data-destination",
      String(tier),
    );
    expect(
      Number(await page.locator(".descent-stage").getAttribute("data-elapsed")),
    ).toBe(descentDuration(tier));
  });
test("keyboard skip preserves one score; next round starts only on explicit action", async ({
  page,
}) => {
  await start(page);
  await lock(page, 4);
  const locked = await saved(page);
  await page.getByRole("button", { name: /Skip Animation/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-status",
    "arrived",
  );
  await expect(page.getByRole("button", { name: "Next round" })).toBeFocused();
  expect(await saved(page)).toEqual(locked);
  await page.getByRole("button", { name: "Next round" }).evaluate((button) => {
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  const next = await saved(page);
  expect(next.index).toBe(1);
  expect(next.results).toHaveLength(1);
  expect(next.phase).toBe("answer");
  await expect(page.getByLabel("Your slang expression")).toBeVisible();
});
test("refresh during descent restores the final result without replay or another award", async ({
  page,
}) => {
  await start(page);
  await lock(page, 4);
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-status",
    "playing",
  );
  const locked = await saved(page);
  await page.reload();
  await page.getByRole("button", { name: "RESUME DAILY" }).click();
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-status",
    "arrived",
  );
  await expect(
    page.getByRole("button", { name: /Skip Animation/ }),
  ).toHaveCount(0);
  expect(await saved(page)).toEqual(locked);
});
test("character change finishes the current action before applying the new appearance", async ({
  page,
}) => {
  await start(page);
  await lock(page, 4);
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-status",
    "playing",
  );
  const before = Number(
    await page.locator(".descent-stage").getAttribute("data-elapsed"),
  );
  const locked = await saved(page);
  await page.getByRole("button", { name: /Change character/ }).click();
  await page.getByRole("radio", { name: "DJ", exact: true }).check();
  await page.getByRole("button", { name: "Done", exact: false }).click();
  await expect(
    page.getByText("Your new character joins after this descent."),
  ).toBeVisible();
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-character",
    "courier",
  );
  expect(
    Number(await page.locator(".descent-stage").getAttribute("data-elapsed")),
  ).toBeGreaterThanOrEqual(before);
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-status",
    "arrived",
    { timeout: 8000 },
  );
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-character",
    "dj",
  );
  expect(await saved(page)).toEqual(locked);
});
test("reduced motion bypasses travel while retaining the destination and result", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await start(page, "echo");
  await lock(page, 4);
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-status",
    "arrived",
  );
  await expect(
    page.getByRole("button", { name: /Skip Animation/ }),
  ).toHaveCount(0);
  expect(
    await page
      .locator(".portal-swirl")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect((await saved(page)).results).toHaveLength(1);
});
test("missing animation artwork falls back and never traps the player", async ({
  page,
}) => {
  await page.route("**/art/descent/**", (route) => route.abort());
  await start(page);
  await lock(page, 3);
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-fallback",
    "true",
  );
  await expect(page.getByRole("button", { name: "Next round" })).toBeVisible();
  await expect(
    page.getByText("Animation unavailable. Your result is saved."),
  ).toBeVisible();
  expect((await saved(page)).results[0].points).toBe(85);
  await page.getByRole("button", { name: "Next round" }).click();
  await expect(page.getByLabel("Your slang expression")).toBeVisible();
});
test("invalid answers and timeouts do not trigger a successful descent", async ({
  page,
}) => {
  await start(page);
  await page.getByLabel("Your slang expression").fill("qzxvplm");
  await page.getByLabel("Your slang expression").press("Enter");
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await expect(page.locator(".descent-stage")).toHaveCount(0);
  await page.clock.fastForward(26000);
  await expect(page.getByText("TIME’S UP", { exact: true })).toBeVisible();
  await expect(page.locator(".descent-stage")).toHaveCount(0);
  expect((await saved(page)).results[0].points).toBe(0);
});
