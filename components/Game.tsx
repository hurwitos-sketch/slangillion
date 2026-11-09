"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TIERS } from "@/lib/data";
import {
  advance,
  challengeNumber,
  dailyQuestions,
  evaluate,
  resultTier,
  tierInfo,
  newGame,
  shareText,
  submit,
  total,
  utcDate,
  type GameState,
} from "@/lib/game";
import Environment from "./Environment";
import Arrow from "./Arrow";
import { readProgress, storageKey } from "@/lib/storage";
import { shareResults } from "@/lib/share";
import Welcome from "./Welcome";
import CharacterArt from "./CharacterArt";
import CharacterDialog from "./CharacterDialog";
import {
  CHARACTER_KEY,
  DEFAULT_CHARACTER,
  characterId,
  getCharacter,
  characterArt,
  type CharacterId,
} from "@/lib/characters";
import Image from "next/image";
export default function Game() {
  const [ready, setReady] = useState(false),
    [date, setDate] = useState(""),
    [game, setGame] = useState<GameState | null>(null),
    [answer, setAnswer] = useState(""),
    [answerError, setAnswerError] = useState(""),
    [now, setNow] = useState(0),
    [notice, setNotice] = useState(""),
    [shareFallback, setShareFallback] = useState(""),
    [reported, setReported] = useState(false),
    [selectedCharacter, setSelectedCharacter] =
      useState<CharacterId>(DEFAULT_CHARACTER),
    [welcomeOpen, setWelcomeOpen] = useState(true),
    [selectorOpen, setSelectorOpen] = useState(false);
  const stateRef = useRef<GameState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  function save(next: GameState) {
    setAnswerError("");
    stateRef.current = next;
    setGame(next);
    try {
      localStorage.setItem(storageKey(next.date), JSON.stringify(next));
    } catch {
      setNotice(
        "Storage is unavailable. Keep this tab open; progress cannot be saved.",
      );
    }
  }
  useEffect(() => {
    const init = setTimeout(() => {
      const today = utcDate();
      const time = Date.now();
      const saved = readProgress(today);
      stateRef.current = saved;
      setGame(saved);
      setDate(today);
      setNow(time);
      try {
        const savedCharacter = characterId(localStorage.getItem(CHARACTER_KEY));
        setSelectedCharacter(savedCharacter);
        localStorage.setItem(CHARACTER_KEY, savedCharacter);
      } catch {
        /* Cosmetic selection remains usable without storage. */
      }
      setReady(true);
      dateRef.current = today;
    }, 0);
    const tick = () => {
      const time = Date.now();
      setNow(time);
      const today = utcDate(time);
      if (dateRef.current && dateRef.current !== today) {
        dateRef.current = today;
        setDate(today);
        const saved = readProgress(today);
        stateRef.current = saved;
        setGame(saved);
        setAnswer("");
        setShareFallback("");
        setReported(false);
        setWelcomeOpen(true);
        setSelectorOpen(false);
        setNotice("A new daily challenge is here.");
      }
      const state = stateRef.current;
      if (state?.phase === "answer" && time >= state.deadline) {
        const latest = readProgress(today, state);
        const next =
          latest?.phase === "answer" && time >= latest.deadline
            ? submit(latest, "", time)
            : latest;
        if (!next) return;
        stateRef.current = next;
        setGame(next);
        setAnswerError("");
        try {
          localStorage.setItem(storageKey(next.date), JSON.stringify(next));
        } catch {
          setNotice("Progress could not be saved.");
        }
      }
    };
    const id = setInterval(tick, 150);
    document.addEventListener("visibilitychange", tick);
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey(utcDate())) return;
      const saved = readProgress(utcDate(), stateRef.current);
      if (!saved || saved === stateRef.current) return;
      stateRef.current = saved;
      setGame(saved);
      setAnswer("");
      setAnswerError("");
      setReported(false);
      dateRef.current = saved.date;
      setDate(saved.date);
    };
    window.addEventListener("storage", sync);
    return () => {
      clearTimeout(init);
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    if (welcomeOpen || selectorOpen) return;
    if (game?.phase === "answer") inputRef.current?.focus();
    else if (game?.phase) headingRef.current?.focus();
  }, [game?.index, game?.phase, welcomeOpen, selectorOpen]);
  // Read storage before acting: another tab may have locked or advanced a round
  // while this tab was suspended and its storage event was still queued.
  function syncCurrent() {
    const today = utcDate();
    const current = readProgress(today, stateRef.current);
    if (today !== dateRef.current) {
      dateRef.current = today;
      setDate(today);
      setAnswer("");
      setShareFallback("");
    }
    if (
      current?.date !== stateRef.current?.date ||
      current?.index !== stateRef.current?.index ||
      current?.phase !== stateRef.current?.phase
    ) {
      setAnswer("");
      setAnswerError("");
      setReported(false);
    }
    stateRef.current = current;
    setGame(current);
    setNow(Date.now());
    return current;
  }
  function start() {
    const saved = syncCurrent();
    setNotice("");
    if (!saved) save(newGame(utcDate()));
    setWelcomeOpen(false);
  }
  function selectCharacter(id: CharacterId) {
    setSelectedCharacter(id);
    try {
      localStorage.setItem(CHARACTER_KEY, id);
    } catch {
      setNotice(
        "Character changed for this visit. Your browser could not save this preference.",
      );
    }
  }
  function lock() {
    const previous = stateRef.current;
    const state = syncCurrent();
    if (previous?.date !== state?.date || previous?.index !== state?.index)
      return;
    if (!state || state.phase !== "answer") return;
    if (!answer.trim()) {
      setNotice("Enter an expression before submitting.");
      return;
    }
    setNotice("");
    const nextState = submit(state, answer, Date.now());
    if (nextState === state) {
      setAnswerError("Slang not recognized! Try another word.");
      setReported(false);
      return;
    }
    save(nextState);
    setReported(false);
  }
  function next() {
    const previous = stateRef.current;
    const state = syncCurrent();
    if (
      !state ||
      previous?.date !== state.date ||
      previous.index !== state.index ||
      state.phase !== "reveal"
    )
      return;
    save(advance(state));
    setAnswer("");
    setNotice("");
    setReported(false);
  }
  function report() {
    const previous = stateRef.current;
    const state = syncCurrent();
    if (
      !state ||
      !["answer", "reveal"].includes(state.phase) ||
      previous?.date !== state.date ||
      previous.index !== state.index
    )
      return;
    const result =
      state.phase === "answer" && answerError
        ? evaluate(dailyQuestions(state.date)[state.index].id, answer)
        : state.results[state.index];
    if (!result || result.tier || result.timedOut) return;
    try {
      const key = "slangillion:feedback";
      const raw = JSON.parse(localStorage.getItem(key) || "[]");
      const reports = Array.isArray(raw)
        ? raw.filter((entry) => entry && typeof entry === "object")
        : [];
      if (
        !reports.some(
          (r: { date: string; questionId: string }) =>
            r.date === state.date && r.questionId === result.questionId,
        )
      )
        reports.push({
          date: state.date,
          ...result,
          reportedAt: new Date().toISOString(),
        });
      localStorage.setItem(key, JSON.stringify(reports));
      setReported(true);
      setNotice("Saved on this device for review. Scores stay unchanged.");
    } catch {
      setNotice(
        "Feedback could not be saved because local storage is unavailable.",
      );
    }
  }
  async function share() {
    if (!game) return;
    const text = shareText(game, window.location.origin);
    setNotice("");
    setShareFallback("");
    const outcome = await shareResults(text);
    if (dateRef.current !== game.date) return;
    if (outcome === "shared") setNotice("Results shared.");
    if (outcome === "copied")
      setNotice("Results copied. Send them to your group chat.");
    if (outcome === "manual") setShareFallback(text);
  }
  const result = game?.results[game.index];
  const tier = resultTier(result);
  const current = game ? dailyQuestions(game.date)[game.index] : null;
  const seconds = game
    ? Math.min(25, Math.max(0, Math.ceil((game.deadline - now) / 1000)))
    : 25;
  const number = ready ? String(challengeNumber(date)).padStart(3, "0") : "…";
  const until = ready
    ? Math.max(0, Date.parse(date + "T00:00:00Z") + 86400000 - now)
    : 0;
  const resetTime = new Date(until).toISOString().slice(11, 19);
  return (
    <div
      className={`site-shell ${ready && (welcomeOpen || !game) ? "welcome-shell" : ""}`}
    >
      <header>
        <Link className="wordmark" href="/" aria-label="Slangillion home">
          SLANG<span>ILLION</span>
          <i>
            <Arrow down />
          </i>
        </Link>
        <div className="header-right">
          <span className="live-dot" /> DAILY DROP <b>#{number}</b>
          {ready && !welcomeOpen && game && (
            <button
              className="avatar-control"
              aria-label={`Change character, current ${getCharacter(selectedCharacter).name}`}
              onClick={() => setSelectorOpen(true)}
            >
              <Image
                src={characterArt(selectedCharacter, true)}
                width={56}
                height={44}
                unoptimized
                alt=""
              />
              <span>{getCharacter(selectedCharacter).name}</span>
              <span aria-hidden="true">⌄</span>
            </button>
          )}
        </div>
      </header>
      <main>
        {!ready ? (
          <div className="loading">Finding the entrance…</div>
        ) : !game || welcomeOpen ? (
          <Welcome
            selected={selectedCharacter}
            onSelect={selectCharacter}
            onPlay={start}
            status={
              game?.phase === "complete" ? "complete" : game ? "resume" : "new"
            }
            number={number}
          />
        ) : game.phase === "answer" ? (
          <section className="game-panel game-entry">
            <div className="game-companion">
              <CharacterArt id={selectedCharacter} />
              <span>
                {getCharacter(selectedCharacter).name}{" "}
                <small>IS ON THE DESCENT</small>
              </span>
            </div>
            <div className="game-top">
              <span>
                DAILY #{number} <i>/</i> ROUND {game.index + 1} OF 7
              </span>
              <strong>
                {total(game)} <small>PTS</small>
              </strong>
            </div>
            <Progress index={game.index} />
            <div className={`timer ${seconds <= 5 ? "urgent" : ""}`}>
              <svg viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="26" />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  style={{
                    strokeDasharray: 164,
                    strokeDashoffset: 164 * (1 - seconds / 25),
                  }}
                />
              </svg>
              <strong>{seconds}</strong>
              <span>SECONDS</span>
            </div>
            <div className="eyebrow">NAME A SLANG EXPRESSION FOR</div>
            <h1 className="prompt">{current?.label}</h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                lock();
              }}
            >
              <label htmlFor="answer" className="sr-only">
                Your slang expression
              </label>
              <input
                ref={inputRef}
                id="answer"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setAnswerError("");
                  setReported(false);
                  if (notice === "Enter an expression before submitting.")
                    setNotice("");
                }}
                aria-invalid={!!answerError}
                aria-describedby={answerError ? "answer-error" : undefined}
                maxLength={80}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Go beyond the obvious…"
              />
              {answerError && (
                <p id="answer-error" className="rejection" role="alert">
                  {answerError}
                </p>
              )}
              <button className="primary" type="submit">
                Lock it in{" "}
                <span>
                  <Arrow down />
                </span>
              </button>
            </form>
            {answerError && (
              <button
                className="text-button"
                onClick={report}
                disabled={reported}
              >
                {reported ? "Feedback saved ✓" : "My answer should count"}
              </button>
            )}
            <p className="hint">ONE LOCKED ANSWER. KEEP DIGGING.</p>
          </section>
        ) : game.phase === "reveal" ? (
          <section
            className={`game-panel reveal tier-${tier || 0}`}
            style={
              {
                "--tier": tier ? TIERS[tier - 1].color : "#858591",
              } as React.CSSProperties
            }
          >
            <div className="game-top">
              <span>
                ROUND {game.index + 1} OF 7 <i>/</i> {current?.label}
              </span>
              <strong>
                {total(game)} <small>PTS</small>
              </strong>
            </div>
            <Progress index={game.index} />
            <div className="reveal-environment">
              <Environment tier={tier || 1} />
              <CharacterArt
                id={selectedCharacter}
                className="reveal-character"
              />
            </div>
            <div className="reveal-copy" aria-live="polite">
              <div className="eyebrow">
                {result?.timedOut
                  ? "TIME’S UP"
                  : tier
                    ? "ANSWER LOCKED"
                    : "NOT IN OUR ANSWER BANK"}
              </div>
              <h1 ref={headingRef} tabIndex={-1}>
                {result?.canonical || result?.answer || "Silence."}
              </h1>
              <h2>
                {tier
                  ? `${TIERS[tier - 1].icon} ${TIERS[tier - 1].name}`
                  : "No score this round"}
              </h2>
              <p className="points">
                +{result?.points} <span>POINTS</span>
              </p>
              {!tier && (
                <p className="rejection">
                  {result?.timedOut
                    ? "The 25-second deadline passed."
                    : "We couldn’t match this expression to the prompt. Our curated bank isn’t exhaustive."}
                </p>
              )}
            </div>
            <button className="primary" onClick={next}>
              {game.index === 6 ? "See my results" : "Next round"}{" "}
              <span>→</span>
            </button>
            {!tier && !result?.timedOut && (
              <button
                className="text-button"
                onClick={report}
                disabled={reported}
              >
                {reported ? "Feedback saved ✓" : "My answer should count"}
              </button>
            )}
          </section>
        ) : (
          <section className="game-panel results">
            <div className="results-companion">
              <CharacterArt id={selectedCharacter} />
              <span>{getCharacter(selectedCharacter).name}</span>
            </div>
            <div className="eyebrow">
              DAILY #{number} / THE DESCENT IS COMPLETE
            </div>
            <h1 ref={headingRef} tabIndex={-1}>
              You went <em>deep.</em>
            </h1>
            <div className="final-score">
              {total(game)}
              <span>/700</span>
            </div>
            <div className="distribution" aria-label="Rarity distribution">
              {TIERS.map((t, i) => {
                const count = game.results.filter(
                  (r) => resultTier(r) === i + 1,
                ).length;
                return (
                  <div
                    key={t.name}
                    style={{ "--tier": t.color } as React.CSSProperties}
                    title={`${t.name}: ${count}`}
                  >
                    <div style={{ height: 12 + count * 14 }} />
                    <span>
                      {t.icon} {count}
                    </span>
                    <small>{t.name}</small>
                  </div>
                );
              })}
            </div>
            <div className="result-list">
              {game.results.map((r, i) => (
                <div key={r.questionId}>
                  <span className="result-index">0{i + 1}</span>
                  <div>
                    <small>{r.questionId}</small>
                    <strong title={r.answer}>
                      {r.canonical || r.answer || "No answer"}
                    </strong>
                  </div>
                  <span
                    className="result-tier"
                    style={{ color: tierInfo(r)?.color ?? "#999" }}
                  >
                    {r.tier
                      ? tierInfo(r)?.name
                      : r.timedOut
                        ? "Time’s up"
                        : "Unmatched"}
                  </span>
                  <b>+{r.points}</b>
                </div>
              ))}
            </div>
            <button className="primary" onClick={share}>
              Share your depth{" "}
              <span>
                <Arrow />
              </span>
            </button>
            {shareFallback && (
              <label className="share-fallback">
                Copy your results
                <textarea
                  readOnly
                  value={shareFallback}
                  onFocus={(e) => e.target.select()}
                />
              </label>
            )}
            <p className="reset">
              NEXT DAILY DROP IN <strong>{resetTime}</strong>
              <br />
              <small>Resets at 00:00 UTC. Come back for a fresh descent.</small>
            </p>
            <p className="editorial">
              Rarity tiers are provisional editorial estimates.
            </p>
          </section>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
      </main>
      {selectorOpen && (
        <CharacterDialog
          selected={selectedCharacter}
          onSelect={selectCharacter}
          onClose={() => setSelectorOpen(false)}
        />
      )}
      <footer>
        <span>
          SLANG IS A LANGUAGE. <b>DEPTH IS A FLEX.</b>
        </span>
        <span>
          7 ROUNDS <i>✦</i> 25 SECONDS <i>✦</i> 700 POSSIBLE POINTS
        </span>
      </footer>
    </div>
  );
}
function Progress({ index }: { index: number }) {
  return (
    <div className="progress" aria-label={`Round ${index + 1} of 7`}>
      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          className={i < index ? "done" : i === index ? "active" : ""}
        />
      ))}
    </div>
  );
}
