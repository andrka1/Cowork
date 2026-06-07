import { useState } from "react";
import { GrammarExercise } from "../data/grammar";

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

  const [before, after] = exercise.sentence.split("___");

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
  };

  const handleNext = () => {
    const correct = selected === exercise.answer;
    setSelected(null);
    onAnswer(correct);
  };

  const optionStyle = (i: number) => {
    if (!answered)
      return "bg-slate-800/80 border-slate-700/50 text-white hover:bg-slate-700 active:scale-[0.98]";
    if (i === exercise.answer)
      return "bg-emerald-500/20 border-emerald-500 text-emerald-300";
    if (i === selected) return "bg-red-500/20 border-red-500 text-red-300";
    return "bg-slate-800/40 border-slate-700/30 text-slate-500";
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-slide-up">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Вопрос {questionNum}/{totalQuestions}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${(questionNum / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Sentence */}
      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-850 rounded-3xl border border-slate-700/50 p-7">
        <span className="text-xs uppercase tracking-widest text-slate-500 mb-3 block">
          Выбери правильную форму
        </span>
        <p className="text-xl text-white leading-relaxed">
          {before}
          <span className="inline-block min-w-[60px] mx-1 px-2 border-b-2 border-dashed border-brand-400 text-brand-400 text-center">
            {answered ? exercise.options[exercise.answer] : "…"}
          </span>
          {after}
        </p>
        {exercise.hint && (
          <p className="text-xs text-slate-500 mt-3">💡 {exercise.hint}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 w-full">
        {exercise.options.map((option, i) => (
          <button
            key={`${option}-${i}`}
            onClick={() => handleSelect(i)}
            disabled={answered}
            className={`w-full py-4 px-6 rounded-2xl border text-left font-medium transition-all duration-200 ${optionStyle(i)}`}
          >
            <span className="text-slate-500 mr-3 font-mono text-sm">
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        ))}
      </div>

      {/* Explanation + next */}
      {answered && (
        <div className="w-full animate-fade-in">
          <div
            className={`rounded-2xl p-4 text-sm ${
              selected === exercise.answer
                ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-200 border border-amber-500/30"
            }`}
          >
            {selected === exercise.answer ? "✅ Верно! " : "❌ Не совсем. "}
            {exercise.explanation}
          </div>
          <button
            onClick={handleNext}
            className="w-full mt-4 py-4 rounded-2xl bg-brand-500 text-white font-semibold transition-all active:scale-[0.98]"
          >
            {questionNum >= totalQuestions ? "Завершить" : "Дальше →"}
          </button>
        </div>
      )}
    </div>
  );
}
