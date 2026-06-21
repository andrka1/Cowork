import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { irregularVerbs, IrregularVerb } from "../data/irregulars";
import { saveGrammarResult, markIrregularLearned, speak } from "../data/storage";

const SESSION = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, "");
}

// Accept the full string or any slash-separated variant (e.g. "was/were").
function matches(input: string, correct: string): boolean {
  const inp = normalize(input);
  if (!inp) return false;
  if (inp === normalize(correct)) return true;
  return correct.split("/").map((v) => normalize(v)).some((v) => v === inp);
}

export default function VerbFormsPage() {
  const navigate = useNavigate();
  const deck = useMemo<IrregularVerb[]>(
    () => shuffle(irregularVerbs).slice(0, SESSION),
    []
  );

  const [index, setIndex] = useState(0);
  const [past, setPast] = useState("");
  const [part, setPart] = useState("");
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const verb = deck[index];
  const pastOk = verb ? matches(past, verb.past) : false;
  const partOk = verb ? matches(part, verb.participle) : false;
  const bothOk = pastOk && partOk;

  const progressPct = Math.round((index / deck.length) * 100);
  const barStyle = { width: progressPct + "%" };

  const check = () => {
    if (checked) return;
    setChecked(true);
    if (bothOk) {
      setCorrectCount((c) => c + 1);
      markIrregularLearned(verb.id);
    }
  };

  const next = () => {
    if (index + 1 >= deck.length) {
      saveGrammarResult(correctCount, deck.length, "verb-forms");
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setPast("");
    setPart("");
    setChecked(false);
  };

  if (finished) {
    const pct = Math.round((correctCount / deck.length) * 100);
    return (
      <div className="px-5 pt-8 pb-4 animate-fade-in min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? "🎉" : "💪"}</div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Готово!</h1>
        <div className="text-5xl font-display font-bold text-emerald-400 my-4">
          {correctCount}/{deck.length}
        </div>
        <p className="text-slate-400 text-sm mb-8">Правильных форм глаголов</p>
        <button onClick={() => navigate(0)} className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold text-lg active:scale-[0.97] transition-all shadow-soft mb-3">
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
        <h1 className="flex-1 text-lg font-display font-bold text-white">Формы глаголов</h1>
        <span className="text-sm text-slate-400">{index + 1}/{deck.length}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-6">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={barStyle} />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="rounded-3xl bg-slate-800/60 p-6 mb-4 text-center">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-2">Инфинитив (V1)</p>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-3xl font-display font-bold text-white">{verb.base}</h2>
            <button onClick={() => speak(verb.base)} className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 active:scale-90 transition-all">🔊</button>
          </div>
          <p className="text-sm text-slate-400">{verb.ru}</p>
        </div>

        <label className="text-xs text-slate-400 mb-1 block">Прошедшее (V2 — Past Simple)</label>
        <input value={past} onChange={(e) => setPast(e.target.value)} disabled={checked} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="например, went" className={"w-full mb-3 px-4 py-3 rounded-xl bg-slate-800 border text-white text-lg outline-none transition-all " + (checked ? (pastOk ? "border-emerald-500" : "border-red-500") : "border-slate-700/50 focus:border-emerald-500")} />

        <label className="text-xs text-slate-400 mb-1 block">Причастие (V3 — Past Participle)</label>
        <input value={part} onChange={(e) => setPart(e.target.value)} disabled={checked} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="например, gone" className={"w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border text-white text-lg outline-none transition-all " + (checked ? (partOk ? "border-emerald-500" : "border-red-500") : "border-slate-700/50 focus:border-emerald-500")} />

        {checked && !bothOk && (
          <div className="mb-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/40 text-sm">
            <p className="text-slate-300">Правильно: <span className="text-emerald-400 font-semibold">{verb.base} — {verb.past} — {verb.participle}</span></p>
          </div>
        )}
        {checked && bothOk && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-300">Верно! 🎉</div>
        )}
      </div>

      {!checked ? (
        <button onClick={check} disabled={!past && !part} className="w-full py-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold text-lg active:scale-[0.97] transition-all shadow-soft disabled:opacity-40">
          Проверить
        </button>
      ) : (
        <button onClick={next} className="w-full py-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-semibold text-lg active:scale-[0.97] transition-all shadow-soft">
          {index + 1 >= deck.length ? "Завершить" : "Дальше"}
        </button>
      )}
    </div>
  );
}
