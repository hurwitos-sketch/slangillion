import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  CHARACTERS,
  CHARACTER_KEY,
  characterId,
  getCharacter,
  characterArt,
} from "../lib/characters";
test("eight stable character identities and separate image assets", () => {
  assert.equal(CHARACTERS.length, 8);
  assert.equal(new Set(CHARACTERS.map((c) => c.id)).size, 8);
  assert.deepEqual(
    CHARACTERS.map((c) => c.name),
    ["COURIER", "MC", "PATHFINDER", "TAG", "KICKFLIP", "DJ", "REMIX", "ECHO"],
  );
  for (const c of CHARACTERS) {
    assert.equal(characterId(c.id), c.id);
    assert.equal(getCharacter(c.id), c);
    assert.ok(existsSync("public" + characterArt(c.id)));
    assert.ok(existsSync("public" + characterArt(c.id, true)));
  }
});
test("invalid stored preference safely falls back without referencing daily progress", () => {
  for (const value of [
    null,
    undefined,
    "",
    "unknown",
    "DJ",
    "../../secret",
    {},
    1,
  ])
    assert.equal(characterId(value), "courier");
  assert.equal(CHARACTER_KEY, "slangillion:character:v1");
});
