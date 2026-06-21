import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSettings,
  saveSettings,
  getProgress,
  setDailyGoal,
  resetProgress,
  speak,
} from "../data/storage";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSettings());
  const [goal, setGoal] = useState(getProgress().dailyGoal);

  const update = (partial: Partial<typeof settings>) => {
    const next = saveSettings(partial);
    setSettings(next);
  };

  const accents: { key: "en-US" | "en-GB"; label: string; flag: string }[] = [
    { key: "en-US", label: "Американский", flag: "🇺🇸" },
    { key: "en-GB", label: "Британский", flag: "🇬🇧" },
  ];

  const speeds: { key: number; label: string }[] = [
    { key: 0.7, label: "Медленно" },
    { key: 0.85, label: "Обычно" },
    { key: 1.0, label: "Быстро" },
  ];

  const goals = [5, 10, 15, 20, 30];

  const handleReset = () => {
    if (window.confirm("Сбросить весь прогресс? Это действие необратимо.")) {
      resetProgress();
      setSettings(getSettings());
      setGoal(getProgress().dailyGoal);
      navigate("/");
    }
  };

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          ←
        </button>
        <h1 className="text-2xl font-display font-bold text-white">Настройки</h1>
      </div>

      {/* Pronunciation */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          🔊 Озвучка
        </h2>

        {/* Accent */}
        <label className="text-xs text-slate-400 mb-2 block">Акцент</label>
        <div className="flex gap-2 mb-4">
          {accents.map((a) => (
            <button
              key={a.key}
              onClick={() => {
                update({ accent: a.key });
                speak("pronunciation", a.key);
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                settings.accent === a.key
                  ? "bg-brand-500 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700/50"
              }`}
            >
              {a.flag} {a.label}
            </button>
          ))}
        </div>

        {/* Speed */}
        <label className="text-xs text-slate-400 mb-2 block">Скорость речи</label>
        <div className="flex gap-2 mb-4">
          {speeds.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                update({ rate: s.key });
                speak("example", settings.accent);
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                settings.rate === s.key
                  ? "bg-brand-500 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Auto-speak */}
        <button
          onClick={() => update({ autoSpeak: !settings.autoSpeak })}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800 border border-slate-700/50"
        >
          <div className="text-left">
            <p className="text-sm font-medium text-white">Автоозвучка карточек</p>
            <p className="text-xs text-slate-400 mt-0.5">Произносить слово при показе карточки</p>
          </div>
          <span
            className={`relative w-12 h-7 rounded-full transition-all ${
              settings.autoSpeak ? "bg-brand-500" : "bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                settings.autoSpeak ? "left-6" : "left-1"
              }`}
            />
          </span>
        </button>

        <button
          onClick={() => speak("This is how the voice sounds.", settings.accent)}
          className="w-full mt-3 py-3 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-sm font-medium active:scale-[0.98] transition-all"
        >
          🔊 Прослушать пример
        </button>
      </div>

      {/* Daily goal */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          🎯 Дневная цель
        </h2>
        <div className="flex gap-2">
          {goals.map((g) => (
            <button
              key={g}
              onClick={() => {
                setDailyGoal(g);
                setGoal(g);
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                goal === g
                  ? "bg-brand-500 text-white"
                  : "bg-slate-800 text-slate-400 border border-slate-700/50"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">Сколько слов учить в день</p>
      </div>

      {/* Danger zone */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Данные</h2>
        <button
          onClick={handleReset}
          className="w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium active:scale-[0.98] transition-all"
        >
          Сбросить прогресс
        </button>
      </div>
    </div>
  );
}
