import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { words } from "../data/words";
import { Word } from "../data/types";
import {
  getExcludedIds,
  getWeakWordIds,
  recordWordCorrect,
  recordWordError,
  markWordLearned,
  saveQuizResult,
} from "../data/storage";

const PAIR_COUNT = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Item = { id: number; text: string };

export default function MatchingPage() {
  const navigate = useNavigate();
  const [round, setRound] = useState(0);

  const deck = useMemo<Word[]>(() => {
    const excluded = new Set(getExcludedIds());
    const pool = words.filter((w) => !excluded.has(w.id));
    const weak = new Set(getWeakWordIds());
    const weakWords = pool.filter((w) => weak.has(w.id));
    const rest = pool.filter((w) => !weak.has(w.id));
    const ordered = [...shuffle(weakWords), ...shuffle(rest)];
    return ordered.slice(0, PAIR_COUNT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const leftCol = useMemo<Item[]>(
    () => shuffle(deck.map((w) => ({ id: w.id, text: w.en }))),
    [deck]
  );
  const rightCol = useMemo<Item[]>(
    () => shuffle(deck.map((w) => ({ id: w.id, text: w.ru }))),
    [deck]
  );

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);

  // Timer ticks until the board is solved.
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [finished, round]);

  // Evaluate a pair once both sides are picked.
  useEffect(() => {
    if (selectedLeft === null || selectedRight === null) return;
    setMoves((m) => m + 1);
    if (selectedLeft === selectedRight) {
      const id = selectedLeft;
      setMatched((prev) => [...prev, id]);
      recordWordCorrect(id);
      markWordLearned(id);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      recordWordError(selectedLeft);
      setWrongIds([selectedLeft, selectedRight]);
      const t = setTimeout(() => {
        setWrongIds([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 650);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeft, selectedRight]);

  // Finish when every pair is matched.
  useEffect(() => {
    if (deck.length > 0 && matched.length === deck.length) {
      setFinished(true);
      saveQuizResult(deck.length, deck.length, "match");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  const restart = () => {
    setRound((r) => r + 1);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatched([]);
    setWrongIds([]);
    setMoves(0);
    setSeconds(0);
    setFinished(false);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const stateOf = (id: number, side: "L" | "R") => {
    if (matched.includes(id)) return "matched";
    const sel = side === "L" ? selectedLeft : selectedRight;
    if (wrongIds.includes(id) && sel === id) return "wrong";
    if (sel === id) return "active";
    return "idle";
  };

  const cls = (state: string) => {
    if (state === "matched")
      return "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 opacity-50 pointer-events-none";
    if (state === "wrong") return "bg-red-500/20 border-red-500 text-red-200";
    if (state === "active") return "bg-brand-500/25 border-brand-500 text-white";
    return "bg-slate-800 border-slate-700/50 text-slate-200 active:scale-[0.97]";
  };

  const locked = wrongIds.length > 0;

  // ---- Empty state ----
  if (deck.length < 2) {
    return (
      <div className="px-5 pt-16 text-center animate-fade-in">
        <div className="text-5xl mb-4">🧩</div>
        <p className="text-slate-400">Слишком мало слов для игры.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 rounded-2xl bg-brand-500 text-white font-medium active:scale-95 transition-all"
        >
          На главную
        </button>
      </div>
    );
  }

  // ---- Finished screen ----
  if (finished) {
    const perfect = moves === deck.length;
    return (
      <div className="px-5 pt-12 pb-4 animate-fade-in flex flex-col items-center text-center">
        <div className="text-6xl mb-4">{perfect ? "🏆" : "🎉"}</div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Все пары собраны!</h1>
        <p className="text-slate-400 mb-1">
          Время <span className="text-brand-400 font-bold">{fmt(seconds)}</span> · ходов{" "}
          <span className="text-brand-400 font-bold">{moves}</span>
        </p>
        <p className="text-xs text-slate-500 mb-8">
          {perfect ? "Идеально — без ошибок!" : "Меньше ходов — выше точность"}
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

  // ---- Active board ----
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
          <h1 className="text-lg font-display font-bold text-white">Пары</h1>
          <p className="text-xs text-slate-400">Соедини слово с переводом</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-5 px-1 text-sm">
        <span className="text-slate-400">⏱ {fmt(seconds)}</span>
        <span className="text-slate-400">
          <span className="text-emerald-400 font-semibold">{matched.length}</span>/{deck.length} пар
        </span>
        <span className="text-slate-400">Ходов: {moves}</span>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {leftCol.map((it) => {
            const st = stateOf(it.id, "L");
            return (
              <button
                key={`l-${it.id}`}
                disabled={locked || st === "matched"}
                onClick={() => setSelectedLeft((cur) => (cur === it.id ? null : it.id))}
                className={`py-3.5 px-3 rounded-2xl border text-sm font-medium transition-all ${cls(st)}`}
              >
                {it.text}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {rightCol.map((it) => {
            const st = stateOf(it.id, "R");
            return (
              <button
                key={`r-${it.id}`}
                disabled={locked || st === "matched"}
                onClick={() => setSelectedRight((cur) => (cur === it.id ? null : it.id))}
                className={`py-3.5 px-3 rounded-2xl border text-sm font-medium transition-all ${cls(st)}`}
              >
                {it.text}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={restart}
        className="w-full mt-6 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        Перемешать заново
      </button>
    </div>
  );
}
