import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { irregularVerbs, irregularPlurals } from "../data/irregulars";
import { GrammarExercise } from "../data/grammar";
import { saveGrammarResult } from "../data/storage";
import GrammarExerciseCard from "../components/GrammarExerciseCard";

type Tab = "verbs" | "plurals" | "practice";
type PracticeView = "setup" | "playing" | "results";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Build multiple-choice questions from the irregular verb list.
function buildQuestions(n: number): GrammarExercise[] {
  const verbs = shuffle(irregularVerbs).slice(0, n);
  return verbs.map((v, idx) => {
    const askParticiple = Math.random() > 0.5;
    const correct = askParticiple ? v.participle : v.past;
    const field = askParticiple ? "participle" : "past";

    const distractors: string[] = [];
    const seen = new Set<string>([correct]);
    for (const other of shuffle(irregularVerbs)) {
      const val = other[field as "past" | "participle"];
      if (!seen.has(val)) {
        seen.add(val);
        distractors.push(val);
      }
      if (distractors.length >= 3) break;
    }

    const options = shuffle([correct, ...distractors]);
    return {
      id: idx + 1,
      tenseId: "irregulars",
      sentence: `${v.base} → ___`,
      hint: `${v.ru} · ${askParticiple ? "Past Participle (V3)" : "Past Simple (V2)"}`,
      options,
      answer: options.indexOf(correct),
      explanation: `${v.base} – ${v.past} – ${v.participle}`,
    };
  });
}

export default function IrregularsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<Tab>(
    location.pathname.includes("exceptions") ? "plurals" : "verbs"
  );

  // practice state
  const [pv, setPv] = useState<PracticeView>("setup");
  const [count, setCount] = useState(10);
  const [items, setItems] = useState<GrammarExercise[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const start = () => {
    setItems(buildQuestions(count));
    setCurrent(0);
    setScore(0);
    setPv("playing");
  };

  const handleAnswer = (correct: boolean) => {
    const finalScore = correct ? score + 1 : score;
    if (correct) setScore(finalScore);
    const next = current + 1;
    if (next >= items.length) {
      saveGrammarResult(finalScore, items.length, "irregulars");
      setPv("results");
    } else {
      setCurrent(next);
    }
  };

  const percent = items.length ? Math.round((score / items.length) * 100) : 0;

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate("/grammar")}
          className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-white">
            Неправильные глаголы
          </h1>
          <p className="text-xs text-slate-400">и слова-исключения</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {([
          ["verbs", "Глаголы"],
          ["plurals", "Исключения"],
          ["practice", "Тренировка"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              if (key === "practice") setPv("setup");
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === key
                ? "bg-brand-500 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Verbs table */}
      {tab === "verbs" && (
        <div className="rounded-2xl overflow-hidden border border-slate-700/40">
          <div className="grid grid-cols-[1fr_1fr_1fr] bg-slate-800 text-xs font-semibold text-slate-300 px-3 py-2.5">
            <span>Infinitive</span>
            <span>Past (V2)</span>
            <span>V3 / перевод</span>
          </div>
          <div className="divide-y divide-slate-800">
            {irregularVerbs.map((v) => (
              <div
                key={v.id}
                className="grid grid-cols-[1fr_1fr_1fr] px-3 py-2.5 text-sm bg-slate-900/30"
              >
                <span className="text-white font-medium">{v.base}</span>
                <span className="text-brand-300">{v.past}</span>
                <span className="text-slate-300">
                  {v.participle}
                  <span className="block text-[11px] text-slate-500">{v.ru}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plurals / exceptions table */}
      {tab === "plurals" && (
        <div>
          <p className="text-sm text-slate-400 mb-3">
            Существительные с особым множественным числом — их нужно запомнить.
          </p>
          <div className="rounded-2xl overflow-hidden border border-slate-700/40">
            <div className="grid grid-cols-[1fr_1fr_1.2fr] bg-slate-800 text-xs font-semibold text-slate-300 px-3 py-2.5">
              <span>Singular</span>
              <span>Plural</span>
              <span>Перевод</span>
            </div>
            <div className="divide-y divide-slate-800">
              {irregularPlurals.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[1fr_1fr_1.2fr] px-3 py-2.5 text-sm bg-slate-900/30"
                >
                  <span className="text-white font-medium">{p.singular}</span>
                  <span className="text-brand-300">{p.plural}</span>
                  <span className="text-slate-400 text-[12px]">{p.ru}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Practice */}
      {tab === "practice" && pv === "setup" && (
        <div>
          <p className="text-sm text-slate-400 mb-4">
            Выбери правильную форму глагола (Past / V3).
          </p>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            Количество вопросов
          </label>
          <div className="flex gap-2 mb-8">
            {[5, 10, 15, 20].map((n) => (
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
      )}

      {tab === "practice" && pv === "playing" && items[current] && (
        <GrammarExerciseCard
          exercise={items[current]}
          questionNum={current + 1}
          totalQuestions={items.length}
          onAnswer={handleAnswer}
        />
      )}

      {tab === "practice" && pv === "results" && (
        <div className="animate-slide-up flex flex-col items-center">
          <div className="w-full max-w-sm text-center">
            <div className="text-7xl mb-4">
              {percent >= 90 ? "🏆" : percent >= 70 ? "🎉" : percent >= 50 ? "👍" : "💪"}
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              {percent >= 70 ? "Молодец!" : "Тренируйся ещё!"}
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
            <button
              onClick={start}
              className="w-full mt-8 py-3.5 rounded-2xl bg-brand-500 text-white font-medium transition-all active:scale-95"
            >
              Ещё раз 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
