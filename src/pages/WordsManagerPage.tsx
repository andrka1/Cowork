import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { words, categories } from "../data/words";
import {
  getExcludedIds,
  toggleWordExcluded,
  excludeMany,
  clearExcluded,
} from "../data/storage";

type Filter = "all" | "visible" | "hidden";

export default function WordsManagerPage() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [catFilter, setCatFilter] = useState<string>("all");

  const excluded = useMemo(() => new Set(getExcludedIds()), [version]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      if (catFilter !== "all" && w.category !== catFilter) return false;
      if (filter === "hidden" && !excluded.has(w.id)) return false;
      if (filter === "visible" && excluded.has(w.id)) return false;
      if (q && !w.en.toLowerCase().includes(q) && !w.ru.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [query, filter, catFilter, excluded]);

  const toggle = (id: number) => {
    toggleWordExcluded(id);
    setVersion((v) => v + 1);
  };

  const hideAllShown = () => {
    excludeMany(filtered.map((w) => w.id));
    setVersion((v) => v + 1);
  };

  const showAll = () => {
    clearExcluded();
    setVersion((v) => v + 1);
  };

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-white">Скрытые слова</h1>
          <p className="text-xs text-slate-400">
            Скрыто {excluded.size} из {words.length} · нажми, чтобы скрыть/вернуть
          </p>
        </div>
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск слова..."
        className="w-full mt-4 mb-3 px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700/50 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
      />

      {/* Status filter */}
      <div className="flex gap-2 mb-3">
        {([
          ["all", "Все"],
          ["visible", "Видимые"],
          ["hidden", "Скрытые"],
        ] as [Filter, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === key
                ? "bg-brand-500 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
        <button
          onClick={() => setCatFilter("all")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            catFilter === "all"
              ? "bg-brand-500 text-white"
              : "bg-slate-800 text-slate-400 border border-slate-700/50"
          }`}
        >
          🌍 Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCatFilter(cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              catFilter === cat.id
                ? "bg-brand-500 text-white"
                : "bg-slate-800 text-slate-400 border border-slate-700/50"
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={hideAllShown}
          disabled={filtered.length === 0}
          className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-medium transition-all active:scale-95 disabled:opacity-40"
        >
          Скрыть показанные ({filtered.length})
        </button>
        <button
          onClick={showAll}
          disabled={excluded.size === 0}
          className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-medium transition-all active:scale-95 disabled:opacity-40"
        >
          Вернуть все скрытые
        </button>
      </div>

      {/* Word list */}
      <div className="space-y-2">
        {filtered.map((w) => {
          const isHidden = excluded.has(w.id);
          return (
            <button
              key={w.id}
              onClick={() => toggle(w.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.99] ${
                isHidden
                  ? "bg-slate-800/30 border-slate-700/30 opacity-60"
                  : "bg-slate-800/60 border-slate-700/50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate">{w.en}</span>
                  <span className="text-xs text-slate-500 shrink-0 ipa">{w.transcription}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{w.ru}</p>
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ${
                  isHidden
                    ? "bg-slate-700 text-slate-300"
                    : "bg-brand-500/15 text-brand-300"
                }`}
              >
                {isHidden ? "Вернуть" : "Скрыть"}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            Ничего не найдено
          </div>
        )}
      </div>
    </div>
  );
}
