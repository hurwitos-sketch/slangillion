import type { Tier } from "./tiers";
import type { CharacterId } from "./characters";
export type DescentAction =
  | "idle"
  | "walking"
  | "digging"
  | "breaking"
  | "falling"
  | "landing"
  | "portal"
  | "arrived";
export type Point = { x: number; y: number };
export type DescentStep = {
  action: DescentAction;
  duration: number;
  from: Point;
  to: Point;
  fromLevel: number;
  toLevel: number;
};
export const LAYER_HEIGHT = 500;
export const WORLD_ASSETS = [
  "city",
  "subway",
  "caves",
  "trenches",
  "underground",
].map((name) => `/art/descent/${name}.webp`);
export const spriteAsset = (id: CharacterId) =>
  `/art/descent/${id}-actions.webp`;
export const STOPS: Point[] = [
  { x: 170, y: 442 },
  { x: 650, y: 910 },
  { x: 460, y: 1410 },
  { x: 280, y: 1910 },
  { x: 260, y: 2410 },
];
export function descentPlan(tier: Tier): DescentStep[] {
  const plan: DescentStep[] = [
    {
      action: "walking",
      duration: 1100,
      from: STOPS[0],
      to: STOPS[1],
      fromLevel: 0,
      toLevel: 1,
    },
  ];
  if (tier >= 2)
    plan.push(
      {
        action: "digging",
        duration: 450,
        from: STOPS[1],
        to: STOPS[1],
        fromLevel: 1,
        toLevel: 1,
      },
      {
        action: "breaking",
        duration: 100,
        from: STOPS[1],
        to: STOPS[1],
        fromLevel: 1,
        toLevel: 1,
      },
      {
        action: "falling",
        duration: 280,
        from: STOPS[1],
        to: STOPS[2],
        fromLevel: 1,
        toLevel: 2,
      },
      {
        action: "landing",
        duration: 120,
        from: STOPS[2],
        to: STOPS[2],
        fromLevel: 2,
        toLevel: 2,
      },
    );
  if (tier >= 3)
    plan.push(
      {
        action: "digging",
        duration: 350,
        from: STOPS[2],
        to: STOPS[2],
        fromLevel: 2,
        toLevel: 2,
      },
      {
        action: "breaking",
        duration: 100,
        from: STOPS[2],
        to: STOPS[2],
        fromLevel: 2,
        toLevel: 2,
      },
      {
        action: "falling",
        duration: 400,
        from: STOPS[2],
        to: STOPS[3],
        fromLevel: 2,
        toLevel: 3,
      },
      {
        action: "landing",
        duration: 150,
        from: STOPS[3],
        to: STOPS[3],
        fromLevel: 3,
        toLevel: 3,
      },
    );
  if (tier === 4)
    plan.push(
      {
        action: "walking",
        duration: 200,
        from: STOPS[3],
        to: { x: 640, y: 1910 },
        fromLevel: 3,
        toLevel: 3,
      },
      {
        action: "portal",
        duration: 500,
        from: { x: 640, y: 1910 },
        to: { x: 170, y: 2410 },
        fromLevel: 3,
        toLevel: 4,
      },
      {
        action: "arrived",
        duration: 200,
        from: { x: 170, y: 2410 },
        to: STOPS[4],
        fromLevel: 4,
        toLevel: 4,
      },
    );
  return plan;
}
export const descentDuration = (tier: Tier) =>
  descentPlan(tier).reduce((n, s) => n + s.duration, 0);
export function animationFrame(action: DescentAction, elapsed: number) {
  const cycle = (frames: number[], speed: number) =>
    frames[Math.floor(elapsed / speed) % frames.length];
  switch (action) {
    case "walking":
      return cycle([1, 10, 2, 10], 100);
    case "digging":
      return cycle([3, 11, 4, 11], 85);
    case "breaking":
      return 5;
    case "falling":
      return 6;
    case "landing":
      return 7;
    case "portal":
      return 8;
    case "arrived":
      return 9;
    default:
      return 0;
  }
}
export function descentAt(tier: Tier, elapsed: number) {
  const plan = descentPlan(tier);
  const total = descentDuration(tier);
  const clamped = Math.max(0, Math.min(total, elapsed));
  let offset = 0;
  for (const step of plan) {
    if (clamped < offset + step.duration) {
      const p = (clamped - offset) / step.duration;
      let point: Point;
      if (step.action === "walking" && step.fromLevel === 0) {
        const stops = [
          { p: 0, x: 170, y: 442 },
          { p: 0.2, x: 420, y: 442 },
          { p: 0.55, x: 640, y: 590 },
          { p: 0.85, x: 455, y: 865 },
          { p: 1, x: 650, y: 910 },
        ];
        const segment = stops.findIndex(
          (stop, i) =>
            i < stops.length - 1 && p >= stop.p && p < stops[i + 1].p,
        );
        const from = stops[Math.max(0, segment)],
          to = stops[Math.max(0, segment) + 1];
        const t = (p - from.p) / (to.p - from.p);
        point = {
          x: from.x + (to.x - from.x) * t,
          y: from.y + (to.y - from.y) * t,
        };
      } else if (step.action === "portal")
        point = p < 0.5 ? step.from : step.to;
      else {
        const t = step.action === "falling" ? p * p : p;
        point = {
          x: step.from.x + (step.to.x - step.from.x) * t,
          y: step.from.y + (step.to.y - step.from.y) * t,
        };
      }
      return {
        action: step.action,
        facing:
          step.action === "walking" &&
          step.fromLevel === 0 &&
          p >= 0.55 &&
          p < 0.85
            ? -1
            : 1,
        point,
        cameraY: Math.max(0, point.y - 410),
        level:
          step.action === "portal"
            ? p < 0.5
              ? 3
              : 4
            : step.fromLevel + (step.toLevel - step.fromLevel) * p,
        frame: animationFrame(step.action, clamped - offset),
        progress: p,
        elapsed: clamped,
        total,
        done: false,
        opacity: step.action === "portal" ? Math.abs(p - 0.5) * 2 : 1,
        portalFlash: step.action === "portal" ? Math.sin(Math.PI * p) : 0,
      };
    }
    offset += step.duration;
  }
  return {
    action: "arrived" as DescentAction,
    facing: 1,
    point: STOPS[tier],
    cameraY: tier * 500,
    level: tier,
    frame: 9,
    progress: 1,
    elapsed: total,
    total,
    done: true,
    opacity: 1,
    portalFlash: 0,
  };
}
export function neededAssets(tier: Tier, character: CharacterId) {
  return [...WORLD_ASSETS.slice(0, tier + 1), spriteAsset(character)];
}
