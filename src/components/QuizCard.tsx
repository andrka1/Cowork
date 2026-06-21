import { useState, useMemo, useEffect } from "react";
import { Word, words } from "../data/words";
import { speak, getExcludedIds } from "../data/storage";

interface Props {
  word: Word;
  onAnswer: (correct: boolean) => void;
  onExclude: () => void;
  questionNum: number;
  totalQuestions: number;
  listening?: boolean;
}

export default function QuizCard({ word, onAnswer, onExclude, questionNum, totalQuestions, listening = false }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // In listening mode, play the word automatically when the question appears.
  useEffect(() => {
    if (listening) {
      const t = setTimeout(() => speak(word.en), 300);
      return () => clearTimeout(t);
    }
  }, [word.id, listening]);

  const options = useMemo(() => {
    const excluded = new Set(getExcludedIds());
    // Distractors from the SAME category first (no answers from other topics)
    let pool = words.filter(
      (w) => w.id !== word.id && w.category === word.category && !excluded.has(w.id)
    );
    // Fall back to same level, then any word, if the category is too small
    if (pool.length < 3) {
      const sameLevel = words.filter(
        (w) => w.id !== word.id && w.level === word.level && !excluded.has(w.id)
      );
      pool = pool.concat(sameLevel);
    }
    if (pool.length < 3) {
      pool = pool.concat(words.filter((w) => w.id !== word.id));
    }

    // Unique translations, not equal to the answer
    const seen = new Set<string>([word.ru]);
    const others: string[] = [];
    for (const w of pool.sort(() => Math.random() - 0.5)) {
      if (!seen.has(w.ru)) {
        seen.add(w.ru);
        others.push(w.ru);
      }
      if (others.length >= 3) break;
    }

    return [...others, word.ru].sort(() => Math.random() - 0.5);
  }, [word]);

  const handleSpeak = () => speak(word.en);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
    const isCorrect = option === word.ru;
    speak(word.en);
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelected(null);
      setShowResult(false);
    }, 1500);
  };

  const handleExclude = () => {
    if (showResult) return;
    onExclude();
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return "bg-slate-800/80 border-slate-700/50 text-white active:scale-[0.98]";
    }
    if (option === word.ru) {
      return "bg-emerald-500/20 border-emerald-500 text-emerald-300";
    }
    if (option === selected && option !== word.ru) {
      return "bg-red-500/20 border-red-500 text-red-300";
    }
    return "bg-slate-800/40 border-slate-700/30 text-slate-500";
  };

  const levelClass =
    word.level === "A1"
      ? "bg-emerald-500/20 text-emerald-400"
      : word.level === "A2"
      ? "bg-blue-500/20 text-blue-400"
      : word.level === "B1"
      ? "bg-amber-500/20 text-amber-400"
      : "bg-red-500/20 text-red-400";

  // Hide the written word while listening, until the answer is revealed.
  const hideWord = listening && !showResult;

  return (
    <div className="flex flex-col items-center gap-5 w-full animate-slide-up">
      {/* Progress + level */}
      <div className="w-full">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
          <span>Вопрос {questionNum}/{totalQuestions}</span>
          <span className={`px-2 py-0.5 rounded-full ${levelClass}`}>{word.level}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${(questionNum / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 p-7 text-center relative">
        {/* Hide / remove word during the quiz */}
        <button
          onClick={handleExclude}
          disabled={showResult}
          className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-600/50 text-[11px] text-slate-300 hover:text-white active:scale-95 transition-all disabled:opacity-40"
          title="Я знаю это слово — убрать из квиза"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          Знаю
        </button>

        <span className="text-xs uppercase tracking-widest text-slate-500 mb-3 block">
          {hideWord ? "🎧 Послушай и выбери перевод" : "Переведи слово"}
        </span>

        {hideWord ? (
          <button
            onClick={handleSpeak}
            className="mx-auto w-20 h-20 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 hover:bg-brand-500/30 active:scale-90 transition-all"
          >
            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        ) : (
          <>
            <h2 className="text-3xl font-display font-bold text-white mb-2">{word.en}</h2>
            <p className="text-sm text-slate-400 font-mono mb-3">{word.transcription}</p>
            <button
              onClick={handleSpeak}
              className="mx-auto w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 hover:bg-brand-500/30 active:scale-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </>
        )}
        {hideWord && (
          <p className="text-xs text-slate-500 mt-3">Нажми, чтобы прослушать ещё раз</p>
        )}

        {/* Show explanation after answering, if available */}
        {showResult && word.note && (
          <p className="mt-4 text-xs text-amber-200/90 bg-amber-400/10 border border-amber-300/20 rounded-xl p-2">
            💡 {word.note}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 w-full">
        {options.map((option, i) => (
          <button
            key={`${option}-${i}`}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            className={`w-full py-4 px-6 rounded-2xl border text-left font-medium transition-all duration-200 ${getOptionStyle(option)}`}
          >
            <span className="text-slate-500 mr-3 font-mono text-sm">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
