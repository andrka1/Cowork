import { useNavigate } from "react-router-dom";
import { tenses, grammarExercises } from "../data/grammar";
import { irregularVerbs, irregularPlurals } from "../data/irregulars";
import { getProgress } from "../data/storage";

export default function GrammarPage() {
  const navigate = useNavigate();
  const progress = getProgress();
  const grammarDone = progress.grammarResults.length;

  const cards = [
    {
      to: "/grammar/tenses",
      emoji: "⏳",
      title: "Времена",
      subtitle: `${tenses.length} времён · ${grammarExercises.length} упражнений`,
      color: "from-blue-500 to-indigo-600",
    },
    {
      to: "/grammar/irregulars",
      emoji: "🔁",
      title: "Неправильные глаголы",
      subtitle: `${irregularVerbs.length} глаголов · тренировка`,
      color: "from-violet-500 to-fuchsia-600",
    },
    {
      to: "/grammar/exceptions",
      emoji: "⭐",
      title: "Слова-исключения",
      subtitle: `${irregularPlurals.length} исключений во мн. числе`,
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-2">Грамматика</h1>
      <p className="text-slate-400 text-sm mb-6">
        Времена и исключения для уровня B2 / IELTS 5.5+
      </p>

      <div className="flex flex-col gap-3">
        {cards.map((c) => (
          <button
            key={c.to}
            onClick={() => navigate(c.to)}
            className={`w-full p-5 rounded-2xl bg-gradient-to-br ${c.color} text-white text-left transition-all active:scale-[0.98] shadow-soft flex items-center gap-4`}
          >
            <span className="text-3xl">{c.emoji}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-xs text-white/80 mt-0.5">{c.subtitle}</p>
            </div>
            <span className="text-white/70 text-xl">→</span>
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="text-sm text-white font-medium">
            Пройдено тренировок: {grammarDone}
          </p>
          <p className="text-xs text-slate-400">
            Регулярная практика грамматики ускоряет прогресс
          </p>
        </div>
      </div>
    </div>
  );
}
