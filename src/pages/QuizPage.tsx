import { useState } from "react";
import { words, categories } from "../data/words";
import {
  saveQuizResult,
  getProgress,
  recordWordError,
  excludeWord,
  getExcludedIds,
} from "../data/storage";
import QuizCard from "../components/QuizCard";

type QuizState = "setup" | "playing" | "results";
type QuizMode = "new" | "errors" | "all";

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("setup");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [quizMode, setQuizMode] = useState<QuizMode>("new");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizWords, setQuizWords] = useState<typeof words>([]);
  const [answered, setAnswered] = useState(0);

  const startQuiz = () => {
    const progress = getProgress();
    const excluded = new Set(getExcludedIds());

    const inCategory = (w: (typeof words)[number]) =>
      selectedCategory === "all" ? true : w.category === selectedCategory;

    // Always drop excluded ("known") words
    let pool = words.filter((w) => inCategory(w) && !excluded.has(w.id));

    if (quizMode === "new") {
      pool = pool.filter((w) => !progress.learnedWords.includes(w.id));
    } else if (quizMode === "errors") {
      const errorIds = Object.keys(progress.wordErrors).map(Number);
      pool = pool.filter((w) => errorIds.includes(w.id));
    }

    // Fallback if the chosen filter empties the pool
    if (pool.length === 0) {
      pool = words.filter((w) => inCategory(w) && !excluded.has(w.id));
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, pool.length));
    setQuizWords(selected);
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(0);
    setState("playing");
  };

  const finish = (finalScore: number, total: number) => {
    saveQuizResult(finalScore, Math.max(total, 1), selectedCategory);
    setState("results");
  };

  const handleAnswer = (correct: boolean) => {
    const current = quizWords[currentQuestion];
    if (!correct && current) recordWordError(current.id);
    const newScore = correct ? score + 1 : score;
    const newAnswered = answered + 1;
    setScore(newScore);
    setAnswered(newAnswered);

    const next = currentQuestion + 1;
    if (next >= quizWords.length) {
      finish(newScore, newAnswered);
    } else {
      setCurrentQuestion(next);
    }
  };

  // Remove the current word from the quiz (mark as known) and move on
  const handleExclude = () => {
    const current = quizWords[currentQuestion];
    if (!current) return;
    excludeWord(current.id);
    const remaining = quizWords.filter((_, i) => i !== currentQuestion);
    setQuizWords(remaining);
    if (currentQuestion >= remaining.length) {
      if (remaining.length === 0 && answered === 0) {
        // Nothing answered — just go back to setup
        setState("setup");
      } else {
        finish(score, answered);
      }
    }
    // else: same index now points to the next word
  };

  const totalAnswered = answered;
  const scorePercent = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  if (state === "setup") {
    return (
      <div className="px-5 pt-8 pb-4 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Квиз</h1>
        <p className="text-slate-400 text-sm mb-6">Проверь знание слов</p>

        {/* Quiz mode */}
        <div className="mb-5">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Режим</label>
          <div className="flex gap-2">
            {([
              { key: "new" as QuizMode, label: "Новые", emoji: "🆕" },
              { key: "errors" as QuizMode, label: "Ошибки", emoji: "❌" },
              { key: "all" as QuizMode, label: "Все", emoji: "📖" },
            ]).map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => setQuizMode(key)}
                className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                  quizMode === key
                    ? "bg-brand-500 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Категория</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`p-3 rounded-xl text-center text-xs font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-brand-500 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700/50"
              }`}
            >
              🌍 Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl text-center text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-brand-500 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div className="mb-8">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Вопросов</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  questionCount === num
                    ? "bg-brand-500 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700/50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-lg transition-all active:scale-[0.98] shadow-soft"
        >
          Начать квиз
        </button>
      </div>
    );
  }

  if (state === "playing" && quizWords[currentQuestion]) {
    return (
      <div className="px-5 pt-8 pb-4">
        <QuizCard
          key={quizWords[currentQuestion].id}
          word={quizWords[currentQuestion]}
          onAnswer={handleAnswer}
          onExclude={handleExclude}
          questionNum={currentQuestion + 1}
          totalQuestions={quizWords.length}
        />
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-4 animate-slide-up flex flex-col items-center">
      <div className="w-full max-w-sm text-center">
        <div className="text-7xl mb-4">
          {scorePercent >= 90 ? "🏆" : scorePercent >= 70 ? "🎉" : scorePercent >= 50 ? "👍" : "💪"}
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">
          {scorePercent >= 90 ? "Превосходно!" : scorePercent >= 70 ? "Отлично!" : scorePercent >= 50 ? "Хорошо!" : "Продолжай учить!"}
        </h2>
        <div className="mt-6 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/40">
          <div className="text-5xl font-bold text-brand-400 mb-1">{score}/{totalAnswered}</div>
          <p className="text-sm text-slate-400">правильных ответов</p>
          <div className="mt-4 w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                scorePercent >= 70 ? "bg-emerald-500" : scorePercent >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{scorePercent}%</p>
        </div>
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setState("setup")}
            className="flex-1 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium active:scale-95 transition-all"
          >
            Настройки
          </button>
          <button
            onClick={startQuiz}
            className="flex-1 py-3.5 rounded-2xl bg-brand-500 text-white font-medium active:scale-95 transition-all"
          >
            Ещё раз
          </button>
        </div>
      </div>
    </div>
  );
}
