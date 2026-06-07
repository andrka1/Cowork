import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tenses, grammarExercises, GrammarExercise } from "../data/grammar";
import { saveGrammarResult } from "../data/storage";
import GrammarExerciseCard from "../components/GrammarExerciseCard";

type View = "theory" | "setup" | "playing" | "results";

export default function TensesPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("theory");
  const [tenseFilter, setTenseFilter] = useState<string>("all");
  const [count, setCount] = useState(10);
  const [items, setItems] = useState<GrammarExercise[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const start = () => {
    const pool =
      tenseFilter === "all"
        ? grammarExercises
        : grammarExercises.filter((e) => e.tenseId === tenseFilter);
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
      saveGrammarResult(finalScore, items.length, tenseFilter === "all" ? "tenses" : tenseFilter);
      setView("results");
    } else {
      setCurrent(next);
    }
  };

  const percent = items.length ? Math.round((score / items.length) * 100) : 0;

  // ---------- THEORY ----------
  if (view === "theory") {
    return (
      <div className="px-5 pt-8 pb-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/grammar")}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Времена</h1>
            <p className="text-xs text-slate-400">{tenses.length} времён английского</p>
          </div>
        </div>

        <button
          onClick={() => setView("setup")}
          className="w-full mb-5 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold transition-all active:scale-[0.98] shadow-soft"
        >
          Практика времён 🚀
        </button>

        <div className="flex flex-col gap-3">
          {tenses.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40"
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <h3 className="font-semibold text-white">{t.name}</h3>
                <span className="text-xs text-slate-400">{t.nameRu}</span>
              </div>
              <p className="text-sm font-mono text-brand-300 bg-slate-900/50 rounded-lg px-3 py-2 mb-2">
                {t.formula}
              </p>
              <p className="text-sm text-slate-300 mb-2">{t.usage}</p>
              <p className="text-xs text-slate-500 mb-2">
                <span className="text-slate-400">Маркеры:</span> {t.markers}
              </p>
              <div className="space-y-1.5">
                {t.examples.map((ex, i) => (
                  <div key={i} className="text-sm">
                    <span className="text-white">{ex.en}</span>
                    <span className="text-slate-500"> — {ex.ru}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------- SETUP ----------
  if (view === "setup") {
    return (
      <div className="px-5 pt-8 pb-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setView("theory")}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white"
          >
            ←
          </button>
          <h1 className="text-xl font-display font-bold text-white">Практика времён</h1>
        </div>

        <label className="text-sm font-medium text-slate-300 mb-3 block">Время</label>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setTenseFilter("all")}
            className={`p-3 rounded-xl text-xs font-medium transition-all ${
              tenseFilter === "all"
                ? "bg-brand-500 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            🎲 Смешанная
          </button>
          {tenses.map((t) => (
            <button
              key={t.id}
              onClick={() => setTenseFilter(t.id)}
              className={`p-3 rounded-xl text-xs font-medium transition-all text-left ${
                tenseFilter === t.id
                  ? "bg-brand-500 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700/50"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <label className="text-sm font-medium text-slate-300 mb-3 block">
          Количество вопросов
        </label>
        <div className="flex gap-2 mb-8">
          {[5, 10, 15, 30].map((n) => (
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg transition-all active:scale-[0.98] shadow-soft"
        >
          Начать 🚀
        </button>
      </div>
    );
  }

  // ---------- PLAYING ----------
  if (view === "playing" && items[current]) {
    return (
      <div className="px-5 pt-8 pb-4">
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
    <div className="px-5 pt-8 pb-4 animate-slide-up flex flex-col items-center">
      <div className="w-full max-w-sm text-center">
        <div className="text-7xl mb-4">
          {percent >= 90 ? "🏆" : percent >= 70 ? "🎉" : percent >= 50 ? "👍" : "💪"}
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          {percent >= 70 ? "Отличная грамматика!" : "Продолжай тренироваться!"}
        </h2>
        <div className="mt-6 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/40">
          <div className="text-5xl font-bold text-brand-400 mb-1">
            {score}/{items.length}
          </div>
          <p className="text-sm text-slate-400">правильных ответов</p>
          <div className="mt-4 w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                percent >= 70 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{percent}% верно</p>
        </div>
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setView("setup")}
            className="flex-1 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium transition-all active:scale-95"
          >
            Настройки
          </button>
          <button
            onClick={start}
            className="flex-1 py-3.5 rounded-2xl bg-brand-500 text-white font-medium transition-all active:scale-95"
          >
            Ещё раз 🔄
          </button>
        </div>
      </div>
    </div>
  );
}
