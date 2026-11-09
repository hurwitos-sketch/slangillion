"use client";
import { useEffect, useRef, useState } from "react";
import {
  descentAt,
  descentDuration,
  neededAssets,
  spriteAsset,
} from "@/lib/descent";
import { getCharacter, type CharacterId } from "@/lib/characters";
import { TIERS, type Tier } from "@/lib/tiers";
import World from "./World";
import CharacterArt from "../CharacterArt";
import Environment from "../Environment";
export default function Descent({
  tier,
  character,
  animate,
  onComplete,
}: {
  tier: Tier;
  character: CharacterId;
  animate: boolean;
  onComplete: (focusNext: boolean) => void;
}) {
  const [initialCharacter] = useState(character);
  const [reducedAtMount] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const total = descentDuration(tier);
  const [elapsed, setElapsed] = useState(
    animate && !reducedAtMount ? 0 : total,
  );
  const [failed, setFailed] = useState(false);
  const completeRef = useRef(!animate || reducedAtMount);
  const callback = useRef(onComplete);
  useEffect(() => {
    callback.current = onComplete;
  }, [onComplete]);
  const [loading, setLoading] = useState(animate && !reducedAtMount);
  function skip() {
    if (completeRef.current) return;
    completeRef.current = true;
    setLoading(false);
    setElapsed(total);
    callback.current(true);
  }
  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const images: HTMLImageElement[] = [];
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = (assetFailure = false) => {
      if (disposed) return;
      const first = !completeRef.current;
      completeRef.current = true;
      setLoading(false);
      setElapsed(total);
      if (assetFailure) setFailed(true);
      if (first) callback.current(false);
    };
    const changed = () => {
      if (media.matches) finish();
    };
    media.addEventListener("change", changed);
    if (!animate || media.matches) {
      queueMicrotask(() => {
        if (!disposed) {
          finish();
          callback.current(false);
        }
      });
    }
    {
      const preload = neededAssets(tier, initialCharacter).map(
        (src) =>
          new Promise<void>((resolve, reject) => {
            const image = new window.Image();
            images.push(image);
            image.onload = () => resolve();
            image.onerror = () =>
              reject(new Error("Animation artwork unavailable"));
            image.src = src;
          }),
      );
      const loadTimeout = new Promise<void>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Animation artwork timed out")),
          1800,
        );
      });
      Promise.race([Promise.all(preload), loadTimeout])
        .then(() => {
          if (timeout) clearTimeout(timeout);
          if (disposed || completeRef.current) return;
          setLoading(false);
          const started = performance.now();
          let previous = -100;
          const tick = (time: number) => {
            if (disposed || completeRef.current) return;
            const position = Math.min(total, time - started);
            if (position >= total) {
              finish();
              return;
            }
            if (position - previous >= 30) {
              setElapsed(position);
              previous = position;
            }
            raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        })
        .catch(() => {
          finish(true);
        });
    }
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
      media.removeEventListener("change", changed);
      for (const image of images) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [animate, initialCharacter, tier, total]);
  useEffect(() => {
    if (character === initialCharacter) return;
    const image = new window.Image();
    image.src = spriteAsset(character);
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [character, initialCharacter]);
  function failedArtwork() {
    const first = !completeRef.current;
    completeRef.current = true;
    setFailed(true);
    setLoading(false);
    setElapsed(total);
    if (first) callback.current(false);
  }
  const scene = descentAt(tier, elapsed);
  const actor = scene.done ? character : initialCharacter;
  const destination = TIERS[tier - 1].name;
  return (
    <div className="descent-wrap">
      <div
        className={`descent-stage ${scene.done ? "has-arrived" : ""}`}
        role="img"
        aria-label={`${getCharacter(actor).name} ${scene.done ? "at" : "traveling to"} ${destination}`}
        data-destination={tier}
        data-action={scene.action}
        data-character={actor}
        data-status={scene.done ? "arrived" : loading ? "loading" : "playing"}
        data-elapsed={Math.round(elapsed)}
        data-fallback={failed ? "true" : "false"}
      >
        {failed ? (
          <div className="descent-fallback">
            <Environment tier={tier} />
            <CharacterArt id={character} />
          </div>
        ) : (
          <World
            tier={tier}
            scene={scene}
            character={actor}
            onAssetError={failedArtwork}
          />
        )}
        <div className="descent-depth" aria-hidden="true">
          <span>
            {scene.done
              ? destination
              : loading
                ? "PREPARING THE DESCENT"
                : scene.action === "portal"
                  ? "ENTERING THE UNDERGROUND"
                  : ["CITY", "SUBWAY", "CAVES", "TRENCHES", "THE UNDERGROUND"][
                      Math.min(4, Math.floor(scene.level + 0.1))
                    ]}
          </span>
          <span>{Math.round(scene.level * 250)}M ↓</span>
        </div>
      </div>
      {!scene.done && (
        <div className="descent-controls">
          <span aria-hidden="true">
            {loading ? "Your answer is saved." : "Digging deeper…"}
          </span>
          <button type="button" onClick={skip} className="skip-animation">
            Skip Animation →
          </button>
        </div>
      )}
      {!scene.done && character !== initialCharacter && (
        <p className="descent-note">
          Your new character joins after this descent.
        </p>
      )}
      {failed && (
        <p className="descent-note" role="status">
          Animation unavailable. Your result is saved.
        </p>
      )}
    </div>
  );
}
