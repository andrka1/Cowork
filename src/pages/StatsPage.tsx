import { useNavigate } from "react-router-dom";
import { getProgress, getStreak, getWeakWordIds } from "../data/storage";
import { words, categories } from "../data/words";
import ProgressRing from "../components/ProgressRing";

export default function StatsPage() {
  const navigate = useNavigate();
  const progress = getProgress();
  const streak = getStreak();
  const totalWords = words.length;
  const learnedCount = progress.learnedWords.length;
  const learnedPercent = Math.round((learnedCount / totalWords) * 100);

  const recentQuizzes = progress.quizResults.slice(-5).reverse();
  const avgScore =
    progress.quizResults.length > 0
      ? Math.round(
          progress.quizResults.reduce((acc, r) => acc + (r.correct / r.total) * 100, 0) /
            progress.quizResults.length
        )
      : 0;

  const grammarRuns = progress.grammarResults.length;
  const grammarAvg =
    grammarRuns > 0
      ? Math.round(
          progress.grammarResults.reduce((acc, r) => acc + (r.correct / r.total) * 100, 0) /
            grammarRuns
        )
      : 0;
  const excludedCount = progress.excludedWords.length;
  const weakCount = getWeakWordIds().length;

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-2">Прогресс</h1>
      <p className="text-slate-400 text-sm mb-8">Твоя статистика обучения</p>

      {/* Main ring */}
      <div className="flex items-center justify-center mb-8">
        <ProgressRing progress={learnedPercent} size={160} strokeWidth={10}>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{learnedCount}</div>
            <div className="text-xs text-slate-400">из {totalWords} слов</div>
          </div>
        </ProgressRing>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-center">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-xl font-bold text-white">{streak}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {streak === 1 ? "день" : streak >= 2 && streak <= 4 ? "дня" : "дней"}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-center">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-xl font-bold text-white">{progress.quizResults.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">квизов</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-xl font-bold text-white">{avgScore}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">средний</div>
        </div>
      </div>

      {/* Weak words review shortcut */}
      {weakCount > 0 && (
        <button
          onClick={() => navigate("/quiz")}
          className="w-full mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Слабые слова</div>
              <div className="text-[11px] text-amber-200/80">
                {weakCount} требуют повторения
              </div>
            </div>
          </div>
          <span className="text-xs text-amber-300">Повторить →</span>
        </button>
      )}

      {/* Grammar + hidden words */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => navigate("/grammar")}
          className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">⏳</span>
            <span className="text-xs text-slate-500">→</span>
          </div>
          <div className="text-sm font-semibold text-white">Грамматика</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {grammarRuns > 0 ? `${grammarRuns} тренировок · ${grammarAvg}%` : "ещё не начато"}
          </div>
        </button>
        <button
          onClick={() => navigate("/words")}
          className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl">🙈</span>
            <span className="text-xs text-slate-500">→</span>
          </div>
          <div className="text-sm font-semibold text-white">Скрытые слова</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{excludedCount} скрыто из {totalWords}</div>
        </button>
      </div>

      {/* Category breakdown */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">По категориям</h2>
        <div className="space-y-3">
          {categories.map((cat) => {
            const catWords = words.filter((w) => w.category === cat.id);
            const learned = catWords.filter((w) => progress.learnedWords.includes(w.id)).length;
            const percent = catWords.length ? Math.round((learned / catWords.length) * 100) : 0;
            return (
              <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-white font-medium">{cat.name}</span>
                    <span className="text-xs text-slate-400">{learned}/{catWords.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent quizzes */}
      {recentQuizzes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Последние квизы</h2>
          <div className="space-y-2">
            {recentQuizzes.map((quiz, i) => {
              const percent = Math.round((quiz.correct / quiz.total) * 100);
              const catInfo = categories.find((c) => c.id === quiz.category);
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span>{catInfo?.emoji || "🌍"}</span>
                    <span className="text-sm text-slate-300">{catInfo?.name || "Все"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{quiz.correct}/{quiz.total}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        percent >= 70
                          ? "bg-emerald-500/20 text-emerald-400"
                          : percent >= 50
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {learnedCount === 0 && progress.quizResults.length === 0 && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-slate-400 text-sm">
            Начни учить слова и проходить квизы,
            <br />
            чтобы видеть свой прогресс здесь!
          </p>
        </div>
      )}
    </div>
  );
}
