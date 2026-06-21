import { useState, useEffect } from "react";
import { Word } from "../data/words";
import {
  markWordLearned,
  unmarkWordLearned,
  isWordLearned,
  speak,
  getSettings,
} from "../data/storage";

interface Props {
  word: Word;
  onNext: () => void;
  onPrev: () => void;
  onExclude: () => void;
  index: number;
  total: number;
}

export default function FlashCard({ word, onNext, onPrev, onExclude, index, total }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState(isWordLearned(word.id));
  const [animating, setAnimating] = useState(false);

  // Auto-pronounce the word when the card appears (if enabled in settings).
  useEffect(() => {
    if (getSettings().autoSpeak) {
      const t = setTimeout(() => speak(word.en), 200);
      return () => clearTimeout(t);
    }
  }, [word.id]);

  const handleFlip = () => setFlipped(!flipped);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(word.en);
  };

  const handleLearned = () => {
    if (learned) {
      unmarkWordLearned(word.id);
      setLearned(false);
    } else {
      markWordLearned(word.id);
      setLearned(true);
      setAnimating(true);
      setTimeout(() => {
        setAnimating(false);
        setFlipped(false);
        onNext();
      }, 600);
    }
  };

  const handleNext = () => {
    setFlipped(false);
    setLearned(isWordLearned(word.id));
    setTimeout(onNext, 150);
  };

  const handlePrev = () => {
    setFlipped(false);
    setLearned(isWordLearned(word.id));
    setTimeout(onPrev, 150);
  };

  const handleExclude = () => {
    setFlipped(false);
    setTimeout(onExclude, 120);
  };

  const levelClass =
    word.level === "A1"
      ? "bg-emerald-500/20 text-emerald-400"
      : word.level === "A2"
      ? "bg-blue-500/20 text-blue-400"
      : word.level === "B1"
      ? "bg-amber-500/20 text-amber-400"
      : "bg-red-500/20 text-red-400";

  return (
    <div className="flex flex-col items-center gap-4 w-full animate-fade-in">
      {/* Top bar: counter + level + hide */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-semibold text-brand-400">{index + 1}</span>
          <span>/</span>
          <span>{total}</span>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${levelClass}`}>
            {word.level}
          </span>
          {learned && <span className="text-emerald-400 text-xs">выучено</span>}
        </div>
        <button
          onClick={handleExclude}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700/50 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-all active:scale-95"
          title="Скрыть слово, которое уже знаешь"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          Скрыть
        </button>
      </div>

      {/* Card */}
      <div className="card-flip w-full aspect-[3/4] max-h-[400px] cursor-pointer" onClick={handleFlip}>
        <div className={`card-flip-inner w-full h-full relative ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-front absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-card flex flex-col items-center justify-center p-8">
            <span className="text-xs uppercase tracking-widest text-slate-500 mb-4">Английский</span>
            <h2 className="text-4xl font-display font-bold text-white mb-3 text-center">{word.en}</h2>
            <p className="text-lg text-slate-400 font-mono mb-4">{word.transcription}</p>
            <button
              onClick={handleSpeak}
              className="mt-2 w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 hover:bg-brand-500/30 active:scale-90 transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            <div className="mt-4 px-4 py-2 rounded-full bg-slate-700/40 text-xs text-slate-500">
              Нажми чтобы перевернуть
            </div>
          </div>

          {/* Back */}
          <div className="card-back absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 border border-brand-500/30 shadow-soft flex flex-col items-center justify-center p-6 overflow-y-auto">
            <span className="text-xs uppercase tracking-widest text-brand-200 mb-3">Перевод</span>
            <h2 className="text-3xl font-display font-bold text-white mb-3 text-center">{word.ru}</h2>
            <div className="bg-white/10 rounded-2xl p-4 w-full">
              <p className="text-sm text-brand-100 text-center italic">\"{word.example}\"</p>
            </div>
            {word.note && (
              <div className="mt-3 bg-amber-400/15 border border-amber-300/30 rounded-2xl p-3 w-full">
                <p className="text-xs text-amber-100 text-center">\uD83D\uDCA1 {word.note}</p>
              </div>
            )}
            <button
              onClick={handleSpeak}
              className="mt-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 active:scale-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={handlePrev}
          className="flex-1 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium transition-all active:scale-95"
        >
          \u2190
        </button>
        <button
          onClick={handleLearned}
          className={`flex-[2] py-3.5 rounded-2xl font-medium transition-all active:scale-95 ${
            animating
              ? "bg-emerald-500 text-white scale-105"
              : learned
              ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
              : "bg-brand-500 text-white hover:bg-brand-600"
          }`}
        >
          {animating ? "\u2713 Выучил!" : learned ? "Убрать из выученных" : "Знаю \u2713"}
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium transition-all active:scale-95"
        >
          \u2192
        </button>
      </div>
    </div>
  );
}
