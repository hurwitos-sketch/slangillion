export const TIERS = [
  { name: "Street Level", points: 20, color: "#a8a9b5", icon: "▤" },
  { name: "Subway", points: 50, color: "#54c9ff", icon: "▣" },
  { name: "Trenches", points: 85, color: "#ff9a50", icon: "▼" },
  { name: "The Underground", points: 100, color: "#ff547b", icon: "✦" },
] as const;
export type Tier = 1 | 2 | 3 | 4;
