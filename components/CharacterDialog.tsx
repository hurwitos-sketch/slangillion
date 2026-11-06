"use client";
import { useEffect, useRef } from "react";
import { getCharacter, type CharacterId } from "@/lib/characters";
import CharacterPicker from "./CharacterPicker";
import CharacterArt from "./CharacterArt";
export default function CharacterDialog({
  selected,
  onSelect,
  onClose,
}: {
  selected: CharacterId;
  onSelect: (id: CharacterId) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>("input:checked")?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = original;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="character-dialog"
      aria-labelledby="character-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="character-dialog-content">
        <div className="dialog-heading">
          <h2 id="character-dialog-title">YOUR CHARACTER</h2>
          <button
            className="dialog-close"
            onClick={onClose}
            aria-label="Close character selector"
          >
            ×
          </button>
        </div>
        <p className="dialog-timer-note">
          Your round timer keeps running while you choose.
        </p>
        <div className="dialog-preview">
          <CharacterArt id={selected} />
          <strong aria-live="polite">{getCharacter(selected).name}</strong>
        </div>
        <CharacterPicker selected={selected} onSelect={onSelect} />
        <button className="primary" onClick={onClose}>
          Done <span>✓</span>
        </button>
        <p className="welcome-fairness">
          Same questions. Same score. Your style.
        </p>
      </div>
    </dialog>
  );
}
