import { test, expect } from "@playwright/test";
import { dailyQuestions } from "../../lib/game";

test("station keeps invalid typing, focus, deadline and score intact", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-09T12:00:00Z") });
  await page.goto("/");
  await page.getByRole("button", { name: "Play Daily" }).click();
  const input = page.getByLabel("Your slang expression");
  await expect(input).toBeFocused();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    dailyQuestions("2026-11-09")[0].label,
  );
  await expect(page.getByRole("timer")).toHaveAccessibleName(
    "25 seconds remaining",
  );
  const snapshot = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem("slangillion:v1:2026-11-09")!),
    );
  const before = await snapshot();
  await input.fill("invented nonsense");
  await input.press("Enter");
  await expect(input).toHaveValue("invented nonsense");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "not recognized",
  );
  await page.clock.runFor(21000);
  await expect(page.getByRole("timer")).toHaveAccessibleName(
    "4 seconds remaining",
  );
  await expect(page.locator(".station-clock")).toHaveClass(/urgent/);
  const after = await snapshot();
  expect(after.deadline).toBe(before.deadline);
  expect(after.results).toEqual([]);
  const answer = dailyQuestions("2026-11-09")[0].answers.find(
    (a) => a.tier === 1,
  )!;
  await input.fill(answer.canonical);
  await input.press("Enter");
  await expect(page.locator(".descent-stage")).toHaveAttribute(
    "data-destination",
    "1",
  );
  expect((await snapshot()).results).toHaveLength(1);
  expect((await snapshot()).results[0].points).toBe(20);
});

test("narrow station keeps touch controls in view and typing stable at keyboard-sized height", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 620 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Play Daily" }).click();
  const input = page.getByLabel("Your slang expression");
  expect(
    await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(16);
  await page.setViewportSize({ width: 320, height: 480 });
  await input.scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => scrollY);
  await input.pressSequentially("some slang", { delay: 20 });
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await expect(input).toBeFocused();
  const button = page.getByRole("button", { name: "Lock it in" });
  const box = await button.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.y + box!.height).toBeLessThanOrEqual(480);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".station-companion img")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});
