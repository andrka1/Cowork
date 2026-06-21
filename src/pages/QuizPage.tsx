import { useEffect, useMemo, useState } from "react";
import { words, categories } from "../data/words";
import {
  saveQuizResult,
  getProgress,
  recordWordError,
  recordWordCorrect,
  getWeakWordIds,
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
  const [listening, setListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizWords, setQuizWords] = useState<typeof words>([]);
  const [answered, setAnswered] = useState(0);

  // How many words are available for each mode in the chosen category.
  const modeCounts = useMemo<Record<QuizMode, number>>(() => {
    const progress = getProgress();
    const excluded = new Set(getExcludedIds());
    const weak = new Set(getWeakWordIds());
    const inCategory = (w: (typeof words)[number]) =>
      selectedCategory === "all" ? true : w.category === selectedCategory;
    const base = words.filter((w) => inCategory(w) && !excluded.has(w.id));
    return {
      new: base.filter((w) => !progress.learnedWords.includes(w.id)).length,
      errors: base.filter((w) => weak.has(w.id)).length,
      all: base.length,
    };
  }, [selectedCategory, state]);

  // Keep the selected mode valid when the category (and thus counts) change.
  useEffect(() => {
    if (modeCounts[quizMode] === 0) {
      if (modeCounts.new > 0) setQuizMode("new");
      else if (modeCounts.all > 0) setQuizMode("all");
    }
  }, [modeCounts, quizMode]);

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
      const weakOrder = getWeakWordIds(); // most-failed first
      const weakSet = new Set(weakOrder);
      pool = pool
        .filter((w) => weakSet.has(w.id))
        .sort((a, b) => weakOrder.indexOf(a.id) - weakOrder.indexOf(b.id));
    }

    // Fallback if the chosen filter empties the pool
    if (pool.length === 0) {
      pool = words.filter((w) => inCategory(w) && !excluded.has(w.id));
    }

    // Errors mode keeps the weak-first order; other modes are shuffled.
    const ordered =
      quizMode === "errors" ? pool : [...pool].sort(() => Math.random() - 0.5);
    const selected = ordered.slice(0, Math.min(questionCount, ordered.length));
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
    if (current) {
      if (correct) recordWordCorrect(current.id);
      else recordWordError(current.id);
    }
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
              { key: "new" as QuizMode, label: "Новые", emoji: "\uD83C\uDD95" },
              { key: "errors" as QuizMode, label: "Ошибки", emoji: "\u274C" },
              { key: "all" as QuizMode, label: "Все", emoji: "\uD83D\uDCD6" },
            ]).map(({ key, label, emoji }) => {
              const count = modeCounts[key];
              const disabled = count === 0;
              return (
                <button
                  key={key}
                  onClick={() => setQuizMode(key)}
                  disabled={disabled}
                  className={`flex-1 py-3 rounded-xl text-xs font-medium transition-all ${
                    quizMode === key
                      ? "bg-brand-500 text-white"
                      : "bg-slate-800 text-slate-400 border border-slate-700/50"
                  } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {emoji} {label}
                  <span className="block text-[10px] opacity-70 mt-0.5">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Listening mode (IELTS) */}
        <button
          onClick={() => setListening((v) => !v)}
          className="w-full mb-5 flex items-center justify-between p-4 rounded-xl bg-slate-800 border border-slate-700/50"
        >
          <div className="text-left">
            <p className="text-sm font-medium text-white">\uD83C\uDFA7 Аудирование</p>
            <p className="text-xs text-slate-400 mt-0.5">Слушай слово и выбирай перевод (IELTS Listening)</p>
          </div>
          <span
            className={`relative w-12 h-7 rounded-full transition-all flex-shrink-0 ${
              listening ? "bg-brand-500" : "bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                listening ? "left-6" : "left-1"
              }`}
            />
          </span>
        </button>

        {/* Category */}
        <div className="mb-5">
          <label className="text-sm font-medium text-slate-300 mb-3 block">Категория</label>