export const TIERS = [
  { name: "Street Level", points: 10, color: "#a8a9b5", icon: "▤" },
  { name: "Subway", points: 25, color: "#54c9ff", icon: "▣" },
  { name: "Caves", points: 50, color: "#bc8bff", icon: "◆" },
  { name: "Trenches", points: 75, color: "#ff9a50", icon: "▼" },
  { name: "The Underground", points: 100, color: "#ff547b", icon: "✦" },
] as const;
export type Tier = 1 | 2 | 3 | 4 | 5;
export type Answer = {
  canonical: string;
  variants: string[];
  prompt: string;
  tier: Tier;
  points: number;
  explanation: string;
  reviewStatus: "editorially-reviewed";
};
export type Question = { id: string; label: string; answers: Answer[] };
// Tiers are provisional editorial estimates, never measured usage frequencies.
// Each group is ordered from broadly familiar to more niche expressions.
const rows: [string, string[][]][] = [
  [
    "Money",
    [
      ["cash", "bucks", "dough", "bread"],
      ["cheddar", "moolah"],
      ["guap", "paper"],
      ["spondulicks|spondulix", "wonga"],
      [" Ackers", "spondoolies"],
    ],
  ],
  [
    "Friend",
    [
      ["buddy", "pal", "mate"],
      ["homie", "bestie"],
      ["bredrin|bredren", "chum"],
      ["mucker", "marra"],
      ["butty"],
    ],
  ],
  [
    "Attractive",
    [
      ["hot", "cute"],
      ["fine", "a snack|snack"],
      ["peng", "fit"],
      ["a sort|sort"],
      ["banging|bangin"],
    ],
  ],
  [
    "Leaving",
    [
      ["bye", "peace"],
      ["bounce", "dip"],
      ["ghost", "jet"],
      ["book it", "make tracks"],
      ["do a runner"],
    ],
  ],
  [
    "Lying",
    [
      ["bullshit|bs"],
      ["cap", "capping|cappin"],
      ["fibbing"],
      ["talking through your hat"],
      ["telling porkies|porkies|pork pies"],
    ],
  ],
  [
    "Excellent",
    [
      ["cool", "awesome"],
      ["dope", "sick"],
      ["fire", "lit"],
      ["mint", "boss"],
      ["the bees knees|bees knees", "the dogs bollocks|dogs bollocks"],
    ],
  ],
  [
    "Angry",
    [
      ["pissed", "mad"],
      ["salty", "heated"],
      ["cheesed off", "ticked off"],
      ["having the hump|got the hump"],
      ["shirty"],
    ],
  ],
  [
    "Tired",
    [
      ["beat", "wiped"],
      ["knackered", "zonked"],
      ["cream crackered", "bushed"],
      ["jiggered"],
      ["out on your feet"],
    ],
  ],
  [
    "Rich",
    [
      ["loaded"],
      ["rolling in it", "made of money"],
      ["minted", "flush"],
      ["stinking rich"],
      ["well heeled|well-heeled"],
    ],
  ],
  [
    "Poor",
    [
      ["broke"],
      ["skint", "strapped"],
      ["hard up", "on the breadline"],
      ["on your uppers"],
      ["boracic|brassic"],
    ],
  ],
  [
    "Partying",
    [
      ["partying"],
      ["raving", "turning up|turnin up"],
      ["on the lash"],
      ["on the razz|on the razzle"],
      ["painting the town red"],
    ],
  ],
  [
    "Laughing",
    [
      ["lol", "lmao"],
      ["cracking up"],
      ["dying|im dead|dead"],
      ["in stitches"],
      ["creasing|creasing up"],
    ],
  ],
  [
    "Talking",
    [
      ["chatting", "yapping"],
      ["gabbing", "yakking|yacking"],
      ["shooting the breeze"],
      ["chewing the fat"],
      ["chinning|chinwagging"],
    ],
  ],
  [
    "Showing off",
    [
      ["showing off"],
      ["flexing|flexin"],
      ["stunting|stuntin", "peacocking"],
      ["putting on airs"],
      ["swanking"],
    ],
  ],
  [
    "Embarrassing",
    [
      ["cringe", "cringey|cringy"],
      ["awkward"],
      ["cringeworthy|cringe worthy"],
      ["toe curling|toe-curling"],
      ["giving me the ick|the ick"],
    ],
  ],
];
export const QUESTIONS: Question[] = rows.map(([label, groups]) => ({
  id: label.toLowerCase(),
  label,
  answers: groups.flatMap((group, i) =>
    group.map((raw) => {
      const [canonical, ...variants] = raw.trim().split("|");
      return {
        canonical,
        variants,
        prompt: label.toLowerCase(),
        tier: (i + 1) as Tier,
        points: TIERS[i].points,
        explanation: `A slang or informal expression associated with ${label.toLowerCase()}.`,
        reviewStatus: "editorially-reviewed" as const,
      };
    }),
  ),
}));
