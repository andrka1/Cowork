import { useNavigate } from "react-router-dom";
import { Category } from "../data/words";

interface Props {
  category: Category;
  learnedCount: number;
  totalCount: number;
}

export default function CategoryCard({ category, learnedCount, totalCount }: Props) {
  const navigate = useNavigate();
  const progress = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  return (
    <button
      onClick={() => navigate(`/flashcards/${category.id}`)}
      className="w-full p-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center gap-4 transition-all duration-200 hover:bg-slate-800 active:scale-[0.98] group"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-xl shadow-soft`}>
        {category.emoji}
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{category.description}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs font-medium text-brand-400">{progress}%</span>
        <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </button>
  );
}
