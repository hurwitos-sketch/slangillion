import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  descentPlan,
  descentDuration,
  descentAt,
  animationFrame,
  neededAssets,
  STOPS,
} from "../lib/descent";
import { CHARACTERS } from "../lib/characters";
import type { Tier } from "../lib/tiers";
test("each destination traverses only the preceding layers and ends at the correct depth", () => {
  for (const tier of [1, 2, 3, 4] as Tier[]) {
    const plan = descentPlan(tier);
    assert.equal(plan[0].fromLevel, 0);
    assert.equal(plan[0].action, "walking");
    assert.equal(Math.max(...plan.map((step) => step.toLevel)), tier);
    assert.equal(
      plan.filter((s) => s.action === "portal").length,
      tier === 4 ? 1 : 0,
    );
    const end = descentAt(tier, descentDuration(tier));
    assert.equal(end.done, true);
    assert.deepEqual(end.point, STOPS[tier]);
    assert.equal(end.cameraY, tier * 500);
    assert.equal(end.action, "arrived");
    assert.ok(plan.every((s) => s.fromLevel <= tier && s.toLevel <= tier));
  }
});
test("durations stay fast and include real digging/fall/landing actions at deeper levels", () => {
  assert.equal(descentDuration(1), 1100);
  assert.equal(descentDuration(2), 2050);
  assert.equal(descentDuration(3), 3050);
  assert.equal(descentDuration(4), 3950);
  assert.deepEqual(
    descentPlan(3).map((s) => s.action),
    [
      "walking",
      "digging",
      "breaking",
      "falling",
      "landing",
      "digging",
      "breaking",
      "falling",
      "landing",
    ],
  );
});
test("sprite cycles use distinct articulated frames for walks and shovel swings", () => {
  assert.deepEqual(
    [0, 100, 200, 300].map((t) => animationFrame("walking", t)),
    [1, 10, 2, 10],
  );
  assert.deepEqual(
    [0, 85, 170, 255].map((t) => animationFrame("digging", t)),
    [3, 11, 4, 11],
  );
  assert.equal(animationFrame("falling", 0), 6);
  assert.equal(animationFrame("landing", 0), 7);
  assert.equal(animationFrame("portal", 0), 8);
  assert.equal(animationFrame("arrived", 0), 9);
});
test("timeline bounds, portal opacity, and camera coordinates remain valid", () => {
  for (const tier of [1, 2, 3, 4] as Tier[])
    for (let t = 0; t <= descentDuration(tier) + 100; t += 17) {
      const frame = descentAt(tier, t);
      assert.ok(
        Number.isFinite(frame.point.x) && Number.isFinite(frame.point.y),
      );
      assert.ok(frame.opacity >= 0 && frame.opacity <= 1);
      assert.ok(frame.cameraY >= 0);
      assert.ok(frame.frame >= 0 && frame.frame <= 11);
    }
  const portalStart = descentPlan(4)
    .slice(0, -2)
    .reduce((n, s) => n + s.duration, 0);
  assert.equal(descentAt(4, portalStart + 250).portalFlash, 1);
});
test("all eight characters have twelve alpha-verified action frames and independent scene assets", () => {
  const manifest = JSON.parse(
    readFileSync("public/art/descent/manifest.json", "utf8"),
  );
  assert.equal(manifest.columns, 4);
  assert.equal(manifest.rows, 3);
  assert.equal(manifest.frames.length, 12);
  for (const c of CHARACTERS) {
    assert.ok(manifest.alphaVerified.includes(c.id));
    for (const asset of neededAssets(4, c.id))
      assert.ok(existsSync("public" + asset), asset);
  }
});
