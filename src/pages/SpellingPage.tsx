import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { words } from "../data/words";
import { Word } from "../data/types";
import {
  getExcludedIds,
  getWeakWordIds,
  recordWordError,
  recordWordCorrect,
  markWordLearned,
  saveQuizResult,
  speak,
} from "../data/storage";

const SESSION_SIZE = 12;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

type Status = "idle" | "correct" | "wrong";

export default function SpellingPage() {
  const navigate = useNavigate();
  const [round, setRound] = useState(0);

  const deck = useMemo<Word[]>(() => {
    const excluded = new Set(getExcludedIds());
    const pool = words.filter((w) => !excluded.has(w.id));
    const weak = new Set(getWeakWordIds());
    const weakWords = pool.filter((w) => weak.has(w.id));
    const rest = pool.filter((w) => !weak.has(w.id));
    const ordered = [...shuffle(weakWords), ...shuffle(rest)];
    return ordered.slice(0, SESSION_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = deck[index];

  // Focus the field whenever a new word appears.
  useEffect(() => {
    if (status === "idle" && !finished) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [index, status, finished]);

  // Save the session result once, when the round ends.
  useEffect(() => {
    if (finished && deck.length > 0) {
      saveQuizResult(correctCount, deck.length, "spelling");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (!word && !finished) {
    return (
      <div className="px-5 pt-16 text-center animate-fade-in">
        <div className="text-5xl mb-4">⌨️</div>
        <p className="text-slate-400">Нет слов для тренировки.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 rounded-2xl bg-brand-500 text-white font-medium active:scale-95 transition-all"
        >
          На главную
        </button>
      </div>
    );
  }

  const check = () => {
    if (!word) return;
    const ok = normalize(value) === normalize(word.en);
    if (ok) {
      setStatus("correct");
      setCorrectCount((c) => c + 1);
      recordWordCorrect(word.id);
      markWordLearned(word.id);
    } else {
      setStatus("wrong");
      recordWordError(word.id);
    }
    speak(word.en);
  };

  const next = () => {
    if (index + 1 >= deck.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setValue("");
    setStatus("idle");
    setRevealed(false);
  };

  const giveUp = () => {
    if (!word || status !== "idle") return;
    setStatus("wrong");
    recordWordError(word.id);
    speak(word.en);
  };

  const restart = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setValue("");
    setStatus("idle");
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (status === "idle") check();
    }
  };

  const mask = (w: string) =>
    w
      .split("")
      .map((ch, i) => (i === 0 || ch === " " ? ch : "·"))
      .join("");

  // ---- Finished screen ----
  if (finished) {
    const pct = deck.length ? Math.round((correctCount / deck.length) * 100) : 0;
    const emoji = pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "💪";
    return (
      <div className="px-5 pt-12 pb-4 animate-fade-in flex flex-col items-center text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Раунд завершён!</h1>
        <p className="text-slate-400 mb-8">
          Правильно{" "}
          <span className="text-brand-400 font-bold">{correctCount}</span> из {deck.length} ({pct}%)
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={restart}
            className="py-3.5 rounded-2xl bg-brand-500 text-white font-medium active:scale-95 transition-all"
          >
            🔁 Ещё раунд
          </button>
          <button
            onClick={() => navigate("/")}
            className="py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium active:scale-95 transition-all"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  // ---- Active screen ----
  const progressPct = Math.round((index / deck.length) * 100);
  return (
    <div className="px-5 pt-6 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-bold text-white">Письмо</h1>
          <p className="text-xs text-slate-400">Впиши слово по буквам</p>
        </div>
        <span className="text-sm text-slate-400">
          <span className="text-brand-400 font-semibold">{index + 1}</span>/{deck.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-brand-500 transition-all duration-300"
          style= width: progressPct + "%" 
        />
      </div>

      {/* Prompt */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-6 mb-5 text-center">
        <span className="text-xs uppercase tracking-widest text-slate-500">Перевод</span>
        <h2 className="text-3xl font-display font-bold text-white mt-2 mb-2">{word.ru}</h2>
        <p className="text-sm text-slate-400 font-mono mb-4">{word.transcription}</p>
        <button
          onClick={() => speak(word.en)}
          className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 inline-flex items-center justify-center text-brand-400 active:scale-90 transition-all"
          aria-label="Озвучить"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
        {revealed && status === "idle" && (
          <p className="mt-4 text-lg font-mono tracking-[0.3em] text-amber-300">{mask(word.en)}</p>
        )}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={status !== "idle"}
        placeholder="Английское слово…"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className={`w-full px-4 py-3.5 rounded-2xl bg-slate-800 border text-center text-lg text-white outline-none transition-all ${
          status === "correct"
            ? "border-emerald-500"
            : status === "wrong"
            ? "border-red-500"
            : "border-slate-700/50 focus:border-brand-500"
        }`}
      />

      {/* Feedback */}
      {status === "wrong" && (
        <p className="mt-3 text-center text-sm">
          <span className="text-slate-400">Правильно: </span>
          <span className="text-emerald-400 font-semibold">{word.en}</span>
        </p>
      )}
      {status === "correct" && (
        <p className="mt-3 text-center text-sm text-emerald-400 font-semibold">Верно! ✓</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-5">
        {status === "idle" ? (
          <>
            <button
              onClick={() => setRevealed(true)}
              className="flex-1 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium active:scale-95 transition-all"
            >
              💡 Подсказка
            </button>
            <button
              onClick={check}
              disabled={!value.trim()}
              className="flex-[2] py-3.5 rounded-2xl bg-brand-500 text-white font-medium active:scale-95 transition-all disabled:opacity-40"
            >
              Проверить
            </button>
          </>
        ) : (
          <button
            onClick={next}
            className="flex-1 py-3.5 rounded-2xl bg-brand-500 text-white font-medium active:scale-95 transition-all"
          >
            {index + 1 >= deck.length ? "Завершить" : "Дальше →"}
          </button>
        )}
      </div>

      {status === "idle" && (
        <button
          onClick={giveUp}
          className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Не знаю — показать ответ
        </button>
      )}
    </div>
  );
}
