import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { words, categories } from "../data/words";
import { getProgress, getExcludedIds, excludeWord } from "../data/storage";
import FlashCard from "../components/FlashCard";

type FilterMode = "new" | "learned" | "all";

export default function FlashcardsPage() {
  const { category } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);
  const [filterMode, setFilterMode] = useState<FilterMode>("new");
  const [excludeVersion, setExcludeVersion] = useState(0);

  const excludedIds = useMemo(() => new Set(getExcludedIds()), [excludeVersion]);

  const filteredWords = useMemo(() => {
    const progress = getProgress();
    let pool =
      selectedCategory === "all"
        ? words
        : words.filter((w) => w.category === selectedCategory);

    pool = pool.filter((w) => !excludedIds.has(w.id));

    if (filterMode === "new") {
      pool = pool.filter((w) => !progress.learnedWords.includes(w.id));
    } else if (filterMode === "learned") {
      pool = pool.filter((w) => progress.learnedWords.includes(w.id));
    }
    return pool;
  }, [selectedCategory, filterMode, excludedIds]);

  const handleNext = () => {
    if (filteredWords.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const handlePrev = () => {
    if (filteredWords.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
  };

  const handleExclude = (wordId: number) => {
    excludeWord(wordId);
    setExcludeVersion((v) => v + 1);
    setCurrentIndex((prev) => {
      const newLen = filteredWords.length - 1;
      if (newLen <= 0) return 0;
      return prev % newLen;
    });
  };

  // Category selection view
  if (!selectedCategory) {
    const progress = getProgress();
    const visibleNew = (catId: string) =>
      words.filter(
        (w) =>
          w.category === catId &&
          !excludedIds.has(w.id) &&
          !progress.learnedWords.includes(w.id)
      ).length;
    const visibleTotal = (catId: string) =>
      words.filter((w) => w.category === catId && !excludedIds.has(w.id)).length;

    return (
      <div className="px-5 pt-8 pb-4 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-white mb-2">Карточки</h1>
        <p className="text-slate-400 text-sm mb-6">Выбери категорию для изучения</p>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
                navigate(`/flashcards/${cat.id}`, { replace: true });
              }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${cat.color} text-white text-left transition-all active:scale-[0.97] shadow-soft`}
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <h3 className="font-semibold text-sm">{cat.name}</h3>
              <p className="text-xs text-white/70 mt-0.5">
                {visibleNew(cat.id)} новых / {visibleTotal(cat.id)}
              </p>
            </button>
          ))}
        </div>

        {/* All words */}
        <button
          onClick={() => {
            setSelectedCategory("all");
            setCurrentIndex(0);
          }}
          className="w-full mt-4 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-left transition-all active:scale-[0.98] hover:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <h3 className="font-semibold text-white">Все слова</h3>
              <p className="text-xs text-slate-400">
                {words.filter((w) => !excludedIds.has(w.id) && !progress.learnedWords.includes(w.id)).length} новых / {words.filter((w) => !excludedIds.has(w.id)).length}
              </p>
            </div>
          </div>
        </button>

        {/* Manage hidden words */}
        <button
          onClick={() => navigate("/words")}
          className="w-full mt-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-left transition-all active:scale-[0.98] hover:bg-slate-800 flex items-center gap-3"
        >
          <span className="text-2xl">🙈</span>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">Скрытые слова</h3>
            <p className="text-xs text-slate-400">Слова, которые ты уже знаешь</p>
          </div>
          <span className="text-xs font-medium text-brand-400 bg-brand-500/10 px-2 py-1 rounded-full">
            {excludedIds.size}
          </span>
        </button>
      </div>
    );
  }

  const currentWord = filteredWords[Math.min(currentIndex, Math.max(filteredWords.length - 1, 0))];
  const categoryInfo = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="px-5 pt-6 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => {
            setSelectedCategory(null);
            navigate("/flashcards", { replace: true });
          }}
          className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-display font-bold text-white">
            {selectedCategory === "all" ? "Все слова" : categoryInfo?.name}
          </h1>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {([
          { key: "new" as FilterMode, label: "Новые", emoji: "🆕" },
          { key: "learned" as FilterMode, label: "Выученные", emoji: "✅" },
          { key: "all" as FilterMode, label: "Все", emoji: "📖" },
        ]).map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => {
              setFilterMode(key);
              setCurrentIndex(0);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
              filterMode === key
                ? "bg-brand-500 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {filteredWords.length === 0 || !currentWord ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">{filterMode === "new" ? "🎉" : "📖"}</div>
          <p className="text-lg font-semibold text-white mb-2">
            {filterMode === "new" ? "Всё выучено!" : "Пока пусто"}
          </p>
          <p className="text-sm text-slate-400">
            {filterMode === "new"
              ? "Все слова в этой категории выучены или скрыты."
              : "Здесь пока нет таких слов."}
          </p>
          <button
            onClick={() => {
              setFilterMode("all");
              setCurrentIndex(0);
            }}
            className="mt-6 px-6 py-3 rounded-2xl bg-brand-500 text-white font-medium active:scale-95 transition-all"
          >
            Показать все слова
          </button>
        </div>
      ) : (
        <FlashCard
          key={currentWord.id}
          word={currentWord}
          onNext={handleNext}
          onPrev={handlePrev}
          onExclude={() => handleExclude(currentWord.id)}
          index={Math.min(currentIndex, filteredWords.length - 1)}
          total={filteredWords.length}
        />
      )}
    </div>
  );
}
