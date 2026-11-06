"use client";
import Image from "next/image";
import { getCharacter, type CharacterId } from "@/lib/characters";
import CharacterArt from "./CharacterArt";
import CharacterPicker from "./CharacterPicker";
import Arrow from "./Arrow";
export default function Welcome({
  selected,
  onSelect,
  onPlay,
  status,
  number,
}: {
  selected: CharacterId;
  onSelect: (id: CharacterId) => void;
  onPlay: () => void;
  status: "new" | "resume" | "complete";
  number: string;
}) {
  const c = getCharacter(selected);
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <div className="welcome-brand">
        <svg className="brand-crown" viewBox="0 0 64 40" aria-hidden="true">
          <path
            d="M6 8l12 10L31 3l12 15L58 7l-6 27H12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
        </svg>
        <h1 id="welcome-title">SLANGILLION</h1>
        <p>How deep is your slang?</p>
      </div>
      <div className="welcome-content">
        <div className="welcome-scene">
          <Image
            className="lift-background"
            src="/art/lift.webp"
            alt=""
            fill
            unoptimized
            preload
            sizes="(max-width: 700px) 100vw, 55vw"
          />
          <div className="lift-light" aria-hidden="true" />
          <div className="preview-sprite" key={selected}>
            <CharacterArt id={selected} preload />
          </div>
          <div className="scene-caption">
            <span>STREET LEVEL</span>
            <span>YOUR DESCENT STARTS HERE ↓</span>
          </div>
        </div>
        <div className="welcome-selection">
          <div className="welcome-eyebrow">
            DAILY DROP #{number} <span>•</span> ALL CHARACTERS FREE
          </div>
          <h2>
            CHOOSE YOUR
            <br className="desktop-break" /> CHARACTER
          </h2>
          <div
            className="selected-character"
            aria-live="polite"
            aria-atomic="true"
          >
            <strong data-testid="selected-character-name">{c.name}</strong>
            <span>✓ SELECTED</span>
          </div>
          <p className="character-description">{c.description}</p>
          <CharacterPicker selected={selected} onSelect={onSelect} />
          <p className="welcome-motto">Same game. Your style.</p>
          <button className="primary welcome-play" onClick={onPlay}>
            {status === "complete"
              ? "VIEW RESULTS"
              : status === "resume"
                ? "RESUME DAILY"
                : "PLAY DAILY"}
            <Arrow down />
          </button>
          <p className="welcome-rules">
            7 rounds <span>•</span> 25 seconds <span>•</span> 700 points
          </p>
          <p className="welcome-account">No account needed</p>
          <p className="welcome-fairness">
            Characters are cosmetic. Your words do the work.
          </p>
        </div>
      </div>
    </section>
  );
}
