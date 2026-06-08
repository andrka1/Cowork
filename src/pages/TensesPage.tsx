import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tenses, grammarExercises, GrammarExercise } from "../data/grammar";
import { saveGrammarResult } from "../data/storage";
import GrammarExerciseCard from "../components/GrammarExerciseCard";

type View = "theory" | "setup" | "playing" | "results";

export default function TensesPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("theory");
  const [selectedTenses, setSelectedTenses] = useState<string[]>(["all"]);
  const [count, setCount] = useState(10);
  const [items, setItems] = useState<GrammarExercise[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const isAllSelected = selectedTenses.includes("all");

  const toggleTense = (tenseId: string) => {
    if (tenseId === "all") {
      setSelectedTenses(["all"]);
      return;
    }
    setSelectedTenses((prev) => {
      const withoutAll = prev.filter((id) => id !== "all");
      if (withoutAll.includes(tenseId)) {
        const next = withoutAll.filter((id) => id !== tenseId);
        return next.length === 0 ? ["all"] : next;
      }
      return [...withoutAll, tenseId];
    });
  };

  const start = () => {
    const pool = isAllSelected
      ? grammarExercises
      : grammarExercises.filter((e) => selectedTenses.includes(e.tenseId));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setItems(shuffled.slice(0, Math.min(count, shuffled.length)));
    setCurrent(0);
    setScore(0);
    setView("playing");
  };

  const handleAnswer = (correct: boolean) => {
    const finalScore = correct ? score + 1 : score;
    if (correct) setScore(finalScore);
    const next = current + 1;
    if (next >= items.length) {
      saveGrammarResult(
        finalScore,
        items.length,
        isAllSelected ? "tenses" : selectedTenses.join(",")
      );
      setView("results");
    } else {
      setCurrent(next);
    }
  };

  const percent = items.length ? Math.round((score / items.length) * 100) : 0;

  // ---------- THEORY ----------
  if (view === "theory") {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-5 pb-28">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/grammar")}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">Времена</h1>
        </div>

        <p className="text-slate-400 mb-4">
          {tenses.length} времён английского
        </p>

        <button
          onClick={() => setView("setup")}
          className="w-full mb-5 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold transition-all active:scale-[0.98] shadow-soft"
        >
          Практика времён 🚀
        </button>

        {tenses.map((t) => (
          <div
            key={t.id}
            className="mb-4 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/40"
          >
            <h3 className="text-lg font-semibold text-brand-300 mb-1">
              {t.name}
            </h3>
            <p className="text-sm text-slate-400 mb-2">{t.nameRu}</p>
            <p className="text-sm font-mono text-emerald-300 mb-2">
              {t.formula}
            </p>
            <p className="text-sm text-slate-300 mb-2">{t.usage}</p>
            <p className="text-xs text-amber-300/80 mb-3">
              Маркеры: {t.markers}
            </p>
            <div className="space-y-1">
              {t.examples.map((ex, i) => (
                <p key={i} className="text-sm text-slate-300">
                  {ex.en} — {ex.ru}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---------- SETUP ----------
  if (view === "setup") {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-5 pb-28">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setView("theory")}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">Практика времён</h1>
        </div>

        <p className="text-sm text-slate-400 mb-3">Времена (выбери одно или несколько)</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => toggleTense("all")}
            className={`p-3 rounded-xl text-xs font-medium transition-all ${
              isAllSelected
                ? "bg-brand-500 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            🎲 Все
          </button>
          {tenses.map((t) => {
            const selected = selectedTenses.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTense(t.id)}
                className={`p-3 rounded-xl text-xs font-medium transition-all text-left ${
                  selected
                    ? "bg-brand-500 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }`}
              >
                {t.nameRu}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-slate-400 mb-3">Количество вопросов</p>
        <div className="flex gap-2 mb-6">
          {[5, 10, 15, 20, 30].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                count === n
                  ? "bg-brand-500 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700/50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          onClick={start}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold transition-all active:scale-[0.98] shadow-soft"
        >
          Начать 🚀
        </button>
      </div>
    );
  }

  // ---------- PLAYING ----------
  if (view === "playing" && items[current]) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-5 pb-28">
        <GrammarExerciseCard
          exercise={items[current]}
          questionNum={current + 1}
          totalQuestions={items.length}
          onAnswer={handleAnswer}
        />
      </div>
    );
  }

  // ---------- RESULTS ----------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-5 pb-28 flex flex-col items-center justify-center text-center">
      <div className="text-6xl mb-4">
        {percent >= 90 ? "🏆" : percent >= 70 ? "🎉" : percent >= 50 ? "👍" : "💪"}
      </div>
      <h2 className="text-2xl font-bold mb-2">
        {percent >= 70 ? "Отличная грамматика!" : "Продолжай тренироваться!"}
      </h2>
      <p className="text-slate-400 mb-6">
        {score}/{items.length} правильных ответов
      </p>

      <div className="w-full max-w-xs h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${
            percent >= 70 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-slate-400 mb-8">{percent}% верно</p>

      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={() => setView("setup")}
          className="flex-1 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium transition-all active:scale-95"
        >
          Настройки
        </button>
        <button
          onClick={start}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold transition-all active:scale-95 shadow-soft"
        >
          Ещё раз 🔄
        </button>
      </div>
    </div>
  );
}