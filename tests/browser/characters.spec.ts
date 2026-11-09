import { test, expect } from "@playwright/test";
import { CHARACTERS, CHARACTER_KEY } from "../../lib/characters";
import { newGame, dailyQuestions, submit, advance } from "../../lib/game";

test("all eight selections update preview, names, and persistence without starting a timer", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("radio", { name: "COURIER", exact: true }),
  ).toBeChecked();
  for (const character of CHARACTERS) {
    await page
      .getByRole("radio", { name: character.name, exact: true })
      .check();
    await expect(page.getByTestId("selected-character-name")).toHaveText(
      character.name,
    );
    await expect(page.locator(".preview-sprite img")).toHaveAttribute(
      "src",
      `/art/characters/${character.id}.webp`,
    );
    await expect(page.locator("input[type=radio]:checked")).toHaveCount(1);
    expect(
      await page.evaluate((key) => localStorage.getItem(key), CHARACTER_KEY),
    ).toBe(character.id);
    expect(
      await page.evaluate(() =>
        Object.keys(localStorage).filter((k) =>
          k.startsWith("slangillion:v1:"),
        ),
      ),
    ).toEqual([]);
  }
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "ECHO", exact: true }),
  ).toBeChecked();
  await expect(page.getByTestId("selected-character-name")).toHaveText("ECHO");
  await page.getByRole("button", { name: "PLAY DAILY" }).click();
  await expect(page.locator(".station-companion img")).toHaveAttribute(
    "alt",
    "ECHO character",
  );
  await expect(page.getByLabel("Your slang expression")).toBeFocused();
  expect(errors).toEqual([]);
});
test("keyboard arrows select and focus moves accessibly inside the dialog", async ({
  page,
}) => {
  await page.goto("/");
  const courier = page.getByRole("radio", { name: "COURIER", exact: true });
  await courier.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "MC", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "MC", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await page.getByRole("button", { name: "PLAY DAILY" }).click();
  await page.getByRole("button", { name: /Change character/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "MC", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "PATHFINDER", exact: true }),
  ).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByLabel("Your slang expression")).toBeFocused();
});
test("invalid preference defaults safely; blocked storage remains playable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("slangillion:character:v1", "not-a-real-character"),
  );
  await page.goto("/");
  await expect(
    page.getByRole("radio", { name: "COURIER", exact: true }),
  ).toBeChecked();
  await page.evaluate(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.getByRole("radio", { name: "DJ", exact: true }).check();
  await expect(page.getByTestId("selected-character-name")).toHaveText("DJ");
  await expect(page.getByRole("status")).toContainText(
    "could not save this preference",
  );
  await page.getByRole("button", { name: "PLAY DAILY" }).click();
  await expect(page.getByLabel("Your slang expression")).toBeVisible();
  await expect(page.locator(".station-companion img")).toHaveAttribute(
    "alt",
    "DJ character",
  );
});
test("character changes preserve draft, index, results, points, and original deadline", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "PLAY DAILY" }).click();
  await page.getByLabel("Your slang expression").fill("draft answer");
  const date = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  const before = await page.evaluate(
    (date) => localStorage.getItem(`slangillion:v1:${date}`),
    date,
  );
  await page.getByRole("button", { name: /Change character/ }).click();
  await page.getByRole("radio", { name: "DJ", exact: true }).check();
  await page.getByRole("button", { name: "Done", exact: false }).click();
  expect(
    await page.evaluate(
      (date) => localStorage.getItem(`slangillion:v1:${date}`),
      date,
    ),
  ).toBe(before);
  await expect(page.getByLabel("Your slang expression")).toHaveValue(
    "draft answer",
  );
  await page.getByLabel("Your slang expression").fill("qzxvplm");
  await page.getByLabel("Your slang expression").press("Enter");
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  expect(
    await page.evaluate(
      (date) => localStorage.getItem(`slangillion:v1:${date}`),
      date,
    ),
  ).toBe(before);
  await page
    .getByLabel("Your slang expression")
    .fill(dailyQuestions(date)[0].answers[0].canonical);
  await page.getByLabel("Your slang expression").press("Enter");
  await expect(
    page.locator('.descent-stage[data-status="arrived"]'),
  ).toHaveAttribute("data-character", "dj");
  const reveal = await page.evaluate(
    (date) => localStorage.getItem(`slangillion:v1:${date}`),
    date,
  );
  await page.getByRole("button", { name: /Change character/ }).click();
  await page.getByRole("radio", { name: "TAG", exact: true }).check();
  await page.getByRole("button", { name: "Done", exact: false }).click();
  expect(
    await page.evaluate(
      (date) => localStorage.getItem(`slangillion:v1:${date}`),
      date,
    ),
  ).toBe(reveal);
  await expect(
    page.locator('.descent-stage[data-status="arrived"]'),
  ).toHaveAttribute("data-character", "tag");
});
test("timer expires while selector is open and selection cannot restart the round", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-06T12:00:00Z") });
  await page.goto("/");
  await page.getByRole("button", { name: "PLAY DAILY" }).click();
  await page.getByRole("button", { name: /Change character/ }).click();
  await page.clock.fastForward(26000);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("radio", { name: "REMIX", exact: true }).check();
  await page.getByRole("button", { name: "Done", exact: false }).click();
  await expect(page.getByText("TIME’S UP", { exact: true })).toBeVisible();
  await expect(page.locator(".points")).toContainText("+0");
  await expect(page.locator(".descent-stage")).toHaveCount(0);
});
test("welcome resumes original deadline and completed games only offer results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "REMIX", exact: true }).check();
  await page.getByRole("button", { name: "PLAY DAILY" }).click();
  const date = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  const original = await page.evaluate(
    (date) => localStorage.getItem(`slangillion:v1:${date}`),
    date,
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "RESUME DAILY" }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "KICKFLIP", exact: true }).check();
  await page.getByRole("button", { name: "RESUME DAILY" }).click();
  expect(
    await page.evaluate(
      (date) => localStorage.getItem(`slangillion:v1:${date}`),
      date,
    ),
  ).toBe(original);
  let completed = newGame(date);
  for (const q of dailyQuestions(date))
    completed = advance(
      submit(completed, q.answers[0].canonical, completed.deadline - 1),
    );
  await page.evaluate(
    (state) =>
      localStorage.setItem(
        `slangillion:v1:${state.date}`,
        JSON.stringify(state),
      ),
    completed,
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "VIEW RESULTS" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "PLAY DAILY" })).toHaveCount(0);
  await page.getByRole("radio", { name: "ECHO", exact: true }).check();
  await page.getByRole("button", { name: "VIEW RESULTS" }).click();
  await expect(page.locator(".results-companion img")).toHaveAttribute(
    "alt",
    "ECHO character",
  );
  await expect(page.locator(".result-list>div")).toHaveCount(7);
  expect(
    await page.evaluate(
      (date) =>
        JSON.parse(localStorage.getItem(`slangillion:v1:${date}`)!).phase,
      date,
    ),
  ).toBe("complete");
});
test("small screens load real assets and reduced motion disables preview animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "PLAY DAILY" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".preview-sprite img")).toBeVisible();
  expect(
    await page
      .locator(".preview-sprite img")
      .evaluate(
        (img) =>
          (img as HTMLImageElement).complete &&
          (img as HTMLImageElement).naturalWidth > 0,
      ),
  ).toBe(true);
  expect(
    await page
      .locator(".preview-sprite img")
      .evaluate((img) => getComputedStyle(img).animationName),
  ).toBe("none");
  await page.getByRole("button", { name: "PLAY DAILY" }).click();
  await page.getByRole("button", { name: /Change character/ }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Close character selector" }).click();
});
