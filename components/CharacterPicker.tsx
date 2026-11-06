"use client";
import Image from "next/image";
import { useId } from "react";
import { CHARACTERS, characterArt, type CharacterId } from "@/lib/characters";
export default function CharacterPicker({
  selected,
  onSelect,
}: {
  selected: CharacterId;
  onSelect: (id: CharacterId) => void;
}) {
  const name = useId();
  return (
    <fieldset className="character-picker">
      <legend className="sr-only">Choose your character</legend>
      <div className="character-grid">
        {CHARACTERS.map((c) => (
          <label
            key={c.id}
            className={`character-option ${c.id === selected ? "is-selected" : ""}`}
            style={{ "--character-accent": c.accent } as React.CSSProperties}
          >
            <input
              type="radio"
              name={name}
              value={c.id}
              checked={c.id === selected}
              onChange={() => onSelect(c.id)}
              aria-label={c.name}
            />
            <span className="portrait-card">
              <Image
                src={characterArt(c.id, true)}
                alt=""
                width={256}
                height={200}
                unoptimized
                loading="eager"
                draggable={false}
              />
              <span className="character-check" aria-hidden="true">
                ✓
              </span>
              <span className="character-label">{c.name}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
