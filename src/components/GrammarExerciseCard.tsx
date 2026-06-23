import { useState } from "react";
import { GrammarExercise } from "../data/grammar";
import { speak } from "../data/storage";

interface Props {
  exercise: GrammarExercise;
  questionNum: number;
  totalQuestions: number;
  onAnswer: (correct: boolean) => void;
}

export default function GrammarExerciseCard({
  exercise,
  questionNum,
  totalQuestions,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isIdentify = exercise.kind === "identify";
  const [before, after] = isIdentify
    ? [exercise.sentence, ""]
    : exercise.sentence.split("___");

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
  };

  const handleNext = () => {
    const correct = selected === exercise.answer;
    setSelected(null);
    onAnswer(correct);
  };

  const handleSpeak = () => {
    const fullSentence = isIdentify
      ? exercise.sentence
      : exercise.sentence.replace("___", exercise.options[exercise.answer]);
    speak(fullSentence, "en-US");
  };

  const optionStyle = (i: number) => {
    if (!answered)
      return "bg-slate-800/80 border-slate-700/50 text-white hover:bg-slate-700 active:scale-[0.98]";
    if (i === exercise.answer)
      return "bg-emerald-500/20 border-emerald-500 text-emerald-300";
    if (i === selected)
      return "bg-red-500/20 border-red-500 text-red-300";
    return "bg-slate-800/40 border-slate-700/30 text-slate-500";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>
            Вопрос {questionNum}/{totalQuestions}
          </span>
          <span>
            {Math.round((questionNum / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${(questionNum / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Sentence */}
      <div className="mb-6">
        <p className="text-sm text-slate-400 mb-3">
          {isIdentify ? "Определи, какое это время" : "Выбери правильную форму"}
        </p>
        {isIdentify ? (
          <div className="text-xl font-medium text-white leading-relaxed">
            {exercise.sentence}
          </div>
        ) : (
          <div className="text-xl font-medium text-white leading-relaxed">
            {before}
            <span className="inline-block mx-1 px-3 py-1 rounded-lg bg-brand-500/20 text-brand-300 font-semibold">
              {answered ? exercise.options[exercise.answer] : "…"}
            </span>
            {after}
          </div>
        )}
        {exercise.hint && (
          <p className="text-sm text-amber-300/80 mt-2">💡 {exercise.hint}</p>
        )}
      </div>

      {/* Audio button */}
      <button
        onClick={handleSpeak}
        className="w-full mb-4 py-3 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium transition-all active:scale-95 flex items-center justify-center gap-2 hover:bg-slate-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        Прослушать предложение
      </button>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {exercise.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={answered}
            className={`w-full py-4 px-6 rounded-2xl border text-left font-medium transition-all duration-200 ${optionStyle(i)}`}
          >
            <span className="inline-block w-8 text-slate-400 font-mono">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        ))}
      </div>

      {/* Explanation + next */}
      {answered && (
        <div className="mt-auto">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 mb-4">
            <p className="text-sm text-slate-300">
              {selected === exercise.answer ? "✅ Верно! " : "❌ Не совсем. "}
              {exercise.explanation}
            </p>
          </div>
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold transition-all active:scale-[0.98] shadow-soft"
          >
            {questionNum >= totalQuestions ? "Завершить" : "Дальше →"}
          </button>
        </div>
      )}
    </div>
  );
}