import { useNavigate } from "react-router-dom";
import { categories, words } from "../data/words";
import { getProgress, getStreak, getWordOfDay, getExcludedIds, speak } from "../data/storage";
import CategoryCard from "../components/CategoryCard";
import ProgressRing from "../components/ProgressRing";

export default function HomePage() {
  const navigate = useNavigate();
  const progress = getProgress();
  const streak = getStreak();
  const totalWords = words.length;
  const learnedPercent = Math.round((progress.learnedWords.length / totalWords) * 100);
  const excluded = new Set(getExcludedIds());
  const newWordsCount = words.filter(
    (w) => !progress.learnedWords.includes(w.id) && !excluded.has(w.id)
  ).length;

  const wordOfDayId = getWordOfDay(words);
  const wordOfDay = words.find((w) => w.id === wordOfDayId);

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Lingua <span className="text-brand-400">Mini</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Учи английский каждый день</p>
        </div>
        <button
          onClick={() => navigate("/settings")}
          aria-label="Настройки"
          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40">
        <ProgressRing progress={learnedPercent} size={72} strokeWidth={6}>
          <span className="text-sm font-bold text-brand-400">{learnedPercent}%</span>
        </ProgressRing>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Выучено</span>
            <span className="text-sm font-semibold text-white">
              {progress.learnedWords.length}/{totalWords}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-lg">\uD83D\uDD25</span>
              <span className="text-sm font-bold text-white">{streak}</span>
              <span className="text-xs text-slate-500">дн.</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">\uD83C\uDD95</span>
              <span className="text-sm font-bold text-white">{newWordsCount}</span>
              <span className="text-xs text-slate-500">новых</span>
            </div>
          </div>
        </div>
      </div>

      {/* Word of the day */}
      {wordOfDay && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-medium">
              Слово дня
            </span>
            <button
              onClick={() => speak(wordOfDay.en)}
              className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 active:scale-90 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-1">{wordOfDay.en}</h3>
          <p className="text-sm text-slate-400 font-mono mb-1">{wordOfDay.transcription}</p>
          <p className="text-base text-indigo-200">{wordOfDay.ru}</p>
          <p className="text-xs text-slate-500 mt-2 italic">\"{wordOfDay.example}\"</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          onClick={() => navigate("/flashcards")}
          className="p-5 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white text-left transition-all active:scale-[0.97] shadow-soft"
        >
          <div className="text-2xl mb-2">\uD83D\uDCDA</div>
          <h3 className="font-semibold text-sm">Карточки</h3>
          <p className="text-xs text-brand-200 mt-0.5">{newWordsCount} новых слов</p>
        </button>
        <button
          onClick={() => navigate("/quiz")}
          className="p-5 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white text-left transition-all active:scale-[0.97] shadow-soft"
        >
          <div className="text-2xl mb-2">\uD83E\uDDE0</div>
          <h3 className="font-semibold text-sm">Квиз</h3>
          <p className="text-xs text-orange-200 mt-0.5">Проверь себя</p>
        </button>
      </div>

      {/* Grammar */}
      <button
        onClick={() => navigate("/grammar")}
        className="w-full mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-left transition-all active:scale-[0.98] shadow-soft flex items-center gap-4"
      >
        <div className="text-2xl">\u23F3</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Грамматика</h3>
          <p className="text-xs text-white/80 mt-0.5">Времена \u00B7 неправильные глаголы \u00B7 исключения</p>
        </div>
        <span className="text-white/70 text-xl">\u2192</span>
      </button>

      {/* Categories */}
      <div className="mb-4">
        <h2 className="text-lg font-display font-bold text-white mb-4">Категории</h2>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const catWords = words.filter((w) => w.category === cat.id);
            const learned = catWords.filter((w) => progress.learnedWords.includes(w.id)).length;
            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                learnedCount={learned}
                totalCount={catWords.length}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
