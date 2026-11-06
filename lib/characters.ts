export const CHARACTER_KEY = "slangillion:character:v1";
export const CHARACTERS = [
  {
    id: "courier",
    name: "COURIER",
    number: "01",
    description: "Purple windbreaker, cream sneakers. Knows every shortcut.",
    accent: "#bb8bff",
  },
  {
    id: "mc",
    name: "MC",
    number: "02",
    description:
      "Navy varsity jacket, cyan sneakers. Always has the right words.",
    accent: "#69d7ee",
  },
  {
    id: "pathfinder",
    name: "PATHFINDER",
    number: "03",
    description: "Orange technical shell, olive cargos. Finds a way down.",
    accent: "#ffab62",
  },
  {
    id: "tag",
    name: "TAG",
    number: "04",
    description: "Black denim, cream hood. Leaves a mark on the city.",
    accent: "#f394c9",
  },
  {
    id: "kickflip",
    name: "KICKFLIP",
    number: "05",
    description: "Green hoodie, denim vest. Takes the unexpected route.",
    accent: "#9fc99c",
  },
  {
    id: "dj",
    name: "DJ",
    number: "06",
    description: "Teal puffer, purple sneakers. Brings the underground energy.",
    accent: "#69d4ce",
  },
  {
    id: "remix",
    name: "REMIX",
    number: "07",
    description: "Burgundy tracksuit, cream stripes. Makes every word her own.",
    accent: "#eb90ba",
  },
  {
    id: "echo",
    name: "ECHO",
    number: "08",
    description:
      "Sand utility jacket, violet backpack. Hears what others miss.",
    accent: "#e2c692",
  },
] as const;
export type CharacterId = (typeof CHARACTERS)[number]["id"];
export type Character = (typeof CHARACTERS)[number];
export const DEFAULT_CHARACTER: CharacterId = "courier";
export function characterId(value: unknown): CharacterId {
  return CHARACTERS.some((c) => c.id === value)
    ? (value as CharacterId)
    : DEFAULT_CHARACTER;
}
export function getCharacter(id: CharacterId): Character {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}
export const characterArt = (id: CharacterId, portrait = false) =>
  `/art/characters/${id}${portrait ? "-portrait" : ""}.webp`;
