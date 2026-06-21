import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { tenses } from "../data/grammar";
import { saveGrammarResult, speak } from "../data/storage";

const SESSION = 8;

interface Sentence {
  en: string;
  ru: string;
}
interface Token {
  id: number;
  text: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const allSentences: Sentence[] = tenses.flatMap((t) => t.examples);

export default function SentenceBuilderPage() {
  const navigate = useNavigate();
  const deck = useMemo<Sentence[]>(
    () => shuffle(allSentences).slice(0, SESSION),
    []
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const sentence = deck[index];
  const tokens = useMemo<Token[]>(
    () => shuffle(sentence.en.split(" ").map((text, id) => ({ id, text }))),
    [sentence]
  );

  const selectedTokens = selected
    .map((id) => tokens.find((t) => t.id === id))
    .filter((t): t is Token => Boolean(t));
  const assembled = selectedTokens.map((t) => t.text).join(" ");
  const isCorrect = assembled === sentence.en;
  const available = tokens.filter((t) => !selected.includes(t.id));

  const progressPct = Math.round((index / deck.length) * 100);
  const barStyle = { width: progressPct + "%" };

  const pick = (id: number) => {
    if (checked) return;
    setSelected((s) => [...s, id]);
  };
  const unpick = (id: number) => {
    if (checked) return;
    setSelected((s) => s.filter((x) => x !== id));
  };

  const check = () => {
    if (checked || selected.length === 0) return;
    setChecked(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (index + 1 >= deck.length) {
      saveGrammarResult(correctCount, deck.length, "sentence-builder");
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected([]);
    setChecked(false);
  };

  if (finished) {
    const pct = Math.round((correctCount / deck.length) * 100);
    return (
      <div className="px-5 pt-8 pb-4 animate-fade-in min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">{pct >= 75 ? "🎉" : "💪"}</div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Готово!</h1>
        <div className="text-5xl font-display font-bold text-pink-400 my-4">
          {correctCount}/{deck.length}
        </div>
        <p className="text-slate-400 text-sm mb-8">Собрано верно</p>
        <button onClick={() => navigate(0)} className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white font-semibold text-lg active:scale-[0.97] transition-all shadow-soft mb-3">
          Ещё раз
        </button>
        <button onClick={() => navigate("/grammar")} className="w-full max-w-xs py-3 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium active:scale-[0.97] transition-all">
          К грамматике
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in min-h-[80vh] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate("/grammar")} className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300">←</button>
        <h1 className="flex-1 text-lg font-display font-bold text-white">Конструктор предложений</h1>
        <span className="text-sm text-slate-400">{index + 1}/{deck.length}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-6">
        <div className="h-full rounded-full bg-pink-500 transition-all duration-300" style={barStyle} />
      </div>

      <div className="flex-1 flex flex-col">
        <p className="text-xs uppercase tracking-widest text-pink-400 mb-2">Собери перевод</p>
        <div className="rounded-2xl bg-slate-800/60 p-4 mb-4">
          <p className="text-lg text-white">{sentence.ru}</p>
        </div>

        {/* Assembled answer */}
        <div className={"min-h-[60px] rounded-2xl border-2 border-dashed p-3 mb-4 flex flex-wrap gap-2 items-start transition-all " + (checked ? (isCorrect ? "border-emerald-500/60 bg-emerald-500/5" : "border-red-500/60 bg-red-500/5") : "border-slate-700/50")}>
          {selectedTokens.length === 0 && (
            <span className="text-slate-600 text-sm">Нажимай на слова ниже…</span>
          )}
          {selectedTokens.map((t) => (
            <button key={t.id} onClick={() => unpick(t.id)} disabled={checked} className="px-3 py-2 rounded-lg bg-pink-500/20 text-pink-100 text-sm font-medium border border-pink-500/30 active:scale-95 transition-all">
              {t.text}
            </button>
          ))}
        </div>

        {/* Available tokens */}
        <div className="flex flex-wrap gap-2 mb-4">
          {available.map((t) => (
            <button key={t.id} onClick={() => pick(t.id)} disabled={checked} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700/50 active:scale-95 transition-all">
              {t.text}
            </button>
          ))}
        </div>

        {checked && (
          <div className={"p-3 rounded-xl text-sm mb-2 " + (isCorrect ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-slate-800/80 border border-slate-700/40 text-slate-300")}>
            {isCorrect ? (
              <span>Верно! 🎉</span>
            ) : (
              <span>Правильно: <span className="text-emerald-400 font-semibold">{sentence.en}</span></span>
            )}
            <button onClick={() => speak(sentence.en)} className="ml-2 text-pink-300">🔊 Прослушать</button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!checked && selected.length > 0 && (
          <button onClick={() => setSelected([])} className="px-4 py-4 rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium active:scale-[0.97] transition-all">
            Сброс
          </button>
        )}
        {!checked ? (
          <button onClick={check} disabled={selected.length === 0} className="flex-1 py-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white font-semibold text-lg active:scale-[0.97] transition-all shadow-soft disabled:opacity-40">
            Проверить
          </button>
        ) : (
          <button onClick={next} className="flex-1 py-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold text-lg active:scale-[0.97] transition-all shadow-soft">
            {index + 1 >= deck.length ? "Завершить" : "Дальше"}
          </button>
        )}
      </div>
    </div>
  );
}
