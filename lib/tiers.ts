export const TIERS = [
  { name: "Subway", points: 20, color: "#54c9ff", icon: "▣" },
  { name: "Caves", points: 50, color: "#bc8bff", icon: "◆" },
  { name: "Trenches", points: 85, color: "#ff9a50", icon: "▼" },
  { name: "The Underground", points: 100, color: "#ff547b", icon: "✦" },
] as const;
export type Tier = 1 | 2 | 3 | 4;
