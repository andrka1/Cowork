// Unified progress tracking: spaced repetition + word of day + TTS (v8)
// merged with word exclusion + grammar results + app settings (accent / speed / auto-speak)
import { Capacitor } from "@capacitor/core";

export interface QuizResult {
  date: string;
  correct: number;
  total: number;
  category: string;
}

export interface GrammarResult {
  date: string;
  correct: number;
  total: number;
  topic: string; // "tenses" | "irregulars" | tense id
}

export type Accent = "en-US" | "en-GB";

export interface AppSettings {
  accent: Accent;
  rate: number; // 0.6 (slow) – 1.1 (fast)
  autoSpeak: boolean; // auto-pronounce when a flashcard appears
}

export interface UserProgress {
  learnedWords: number[];
  excludedWords: number[];
  quizResults: QuizResult[];
  grammarResults: GrammarResult[];
  irregularsLearned: string[];
  streak: number;
  lastActiveDate: string;
  totalWordsLearned: number;
  wordErrors: Record<number, number>; // wordId -> error count (spaced repetition)
  dailyGoal: number;
  wordsToday: number;
  lastWordOfDay: { id: number; date: string } | null;
  settings: AppSettings;
}

const STORAGE_KEY = "lingua_mini_progress";

const defaultSettings: AppSettings = {
  accent: "en-US",
  rate: 0.85,
  autoSpeak: true,
};

const defaultProgress: UserProgress = {
  learnedWords: [],
  excludedWords: [],
  quizResults: [],
  grammarResults: [],
  irregularsLearned: [],
  streak: 0,
  lastActiveDate: "",
  totalWordsLearned: 0,
  wordErrors: {},
  dailyGoal: 10,
  wordsToday: 0,
  lastWordOfDay: null,
  settings: { ...defaultSettings },
};

export function getProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultProgress, settings: { ...defaultSettings } };
    const parsed = JSON.parse(stored);
    // Migration: ensure all fields exist for older saves (incl. nested settings)
    return {
      ...defaultProgress,
      ...parsed,
      settings: { ...defaultSettings, ...(parsed.settings || {}) },
    };
  } catch {
    return { ...defaultProgress, settings: { ...defaultSettings } };
  }
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ---- Learned words ----

export function markWordLearned(wordId: number): void {
  const progress = getProgress();
  if (!progress.learnedWords.includes(wordId)) {
    progress.learnedWords.push(wordId);
    progress.totalWordsLearned = progress.learnedWords.length;
  }
  const today = new Date().toISOString().split("T")[0];
  if (progress.lastActiveDate !== today) {
    progress.wordsToday = 1;
  } else {
    progress.wordsToday += 1;
  }
  updateStreak(progress);
  saveProgress(progress);
}

export function unmarkWordLearned(wordId: number): void {
  const progress = getProgress();
  progress.learnedWords = progress.learnedWords.filter((id) => id !== wordId);
  progress.totalWordsLearned = progress.learnedWords.length;
  saveProgress(progress);
}

export function isWordLearned(wordId: number): boolean {
  return getProgress().learnedWords.includes(wordId);
}

// ---- Word exclusion (hide words you already know) ----

export function isWordExcluded(wordId: number): boolean {
  return getProgress().excludedWords.includes(wordId);
}

export function excludeWord(wordId: number): void {
  const progress = getProgress();
  if (!progress.excludedWords.includes(wordId)) {
    progress.excludedWords.push(wordId);
  }
  saveProgress(progress);
}

export function includeWord(wordId: number): void {
  const progress = getProgress();
  progress.excludedWords = progress.excludedWords.filter((id) => id !== wordId);
  saveProgress(progress);
}

export function toggleWordExcluded(wordId: number): boolean {
  const progress = getProgress();
  const excluded = progress.excludedWords.includes(wordId);
  if (excluded) {
    progress.excludedWords = progress.excludedWords.filter((id) => id !== wordId);
  } else {
    progress.excludedWords.push(wordId);
  }
  saveProgress(progress);
  return !excluded;
}

export function excludeMany(wordIds: number[]): void {
  const progress = getProgress();
  const set = new Set(progress.excludedWords);
  wordIds.forEach((id) => set.add(id));
  progress.excludedWords = Array.from(set);
  saveProgress(progress);
}

export function clearExcluded(): void {
  const progress = getProgress();
  progress.excludedWords = [];
  saveProgress(progress);
}

export function getExcludedIds(): number[] {
  return getProgress().excludedWords;
}

// ---- Spaced repetition (error tracking) ----

export function recordWordError(wordId: number): void {
  const progress = getProgress();
  progress.wordErrors[wordId] = (progress.wordErrors[wordId] || 0) + 1;
  saveProgress(progress);
}

// Correct answer eases off the weak-word counter (spaced repetition).
// Once it reaches zero the word leaves the "weak" list entirely.
export function recordWordCorrect(wordId: number): void {
  const progress = getProgress();
  const current = progress.wordErrors[wordId];
  if (current === undefined) return;
  if (current <= 1) {
    delete progress.wordErrors[wordId];
  } else {
    progress.wordErrors[wordId] = current - 1;
  }
  saveProgress(progress);
}

export function getWordErrors(): Record<number, number> {
  return getProgress().wordErrors;
}

// Ids of words that still have outstanding errors (weak spots),
// ordered most-failed first so reviews target the hardest words.
export function getWeakWordIds(): number[] {
  const errors = getProgress().wordErrors;
  return Object.keys(errors)
    .map(Number)
    .filter((id) => errors[id] > 0)
    .sort((a, b) => errors[b] - errors[a]);
}

// ---- Quiz & grammar results ----

export function saveQuizResult(correct: number, total: number, category: string): void {
  const progress = getProgress();
  progress.quizResults.push({
    date: new Date().toISOString().split("T")[0],
    correct,
    total,
    category,
  });
  updateStreak(progress);
  saveProgress(progress);
}

export function saveGrammarResult(correct: number, total: number, topic: string): void {
  const progress = getProgress();
  progress.grammarResults.push({
    date: new Date().toISOString().split("T")[0],
    correct,
    total,
    topic,
  });
  updateStreak(progress);
  saveProgress(progress);
}

export function markIrregularLearned(verbId: string): void {
  const progress = getProgress();
  if (!progress.irregularsLearned.includes(verbId)) {
    progress.irregularsLearned.push(verbId);
  }
  updateStreak(progress);
  saveProgress(progress);
}

// ---- Streak ----

function updateStreak(progress: UserProgress): void {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (progress.lastActiveDate === today) return;

  if (progress.lastActiveDate === yesterday) {
    progress.streak += 1;
  } else if (progress.lastActiveDate !== today) {
    progress.streak = 1;
  }

  progress.lastActiveDate = today;
}

export function getStreak(): number {
  const progress = getProgress();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (progress.lastActiveDate === today || progress.lastActiveDate === yesterday) {
    return progress.streak;
  }
  return 0;
}

// ---- App settings (accent / speed / auto-speak) ----

export function getSettings(): AppSettings {
  return getProgress().settings;
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const progress = getProgress();
  progress.settings = { ...progress.settings, ...partial };
  saveProgress(progress);
  return progress.settings;
}

export function setDailyGoal(goal: number): void {
  const progress = getProgress();
  progress.dailyGoal = goal;
  saveProgress(progress);
}

// ===================== Text-to-Speech pronunciation =====================
// How audio works (3 layers, tried in order):
//   1) BUNDLED offline MP3 shipped inside the app at /audio/<slug>.mp3
//      (generated at build time by scripts/gen-audio.mjs). Works with NO internet.
//      This is the reason the APK grows in size — the audio is really inside it.
//   2) ONLINE stream (StreamElements / Google TTS) for anything not bundled.
//   3) Browser speechSynthesis (web only — it is dead inside the Android WebView).

let cachedVoices: SpeechSynthesisVoice[] = [];
let currentAudio: HTMLAudioElement | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const v = window.speechSynthesis.getVoices();
  if (v && v.length) cachedVoices = v;
  return cachedVoices;
}

// Call once at startup to prime the voice list (web only).
export function primeVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => loadVoices();
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = cachedVoices.length ? cachedVoices : loadVoices();
  if (!voices.length) return undefined;
  const langLower = lang.toLowerCase();
  const region = langLower.split("-")[1];
  const preferred = ["google", "natural", "premium", "siri", "microsoft", "daniel", "samantha"];
  const norm = (l: string) => l.toLowerCase().replace("_", "-");
  const exact = voices.filter((v) => norm(v.lang) === langLower);
  const sameRegion = region ? voices.filter((v) => norm(v.lang).includes(region)) : [];
  const anyEnglish = voices.filter((v) => norm(v.lang).startsWith("en"));
  const byQuality = (list: SpeechSynthesisVoice[]) =>
    list.find((v) => preferred.some((n) => v.name.toLowerCase().includes(n))) || list[0];
  return byQuality(exact) || byQuality(sameRegion) || byQuality(anyEnglish);
}

// MUST stay identical to slugify() in scripts/gen-audio.mjs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Resolve the bundled audio file URL relative to the current document so it
// works with Vite's base: "./" inside the Capacitor WebView.
function localAudioUrl(text: string): string {
  const slug = slugify(text);
  if (!slug) return "";
  try {
    return new URL("audio/" + slug + ".mp3", window.location.href).href;
  } catch {
    return "audio/" + slug + ".mp3";
  }
}

// Small on-screen toast so audio problems are visible on the phone (no console there).
function toast(msg: string): void {
  try {
    if (typeof document === "undefined" || !document.body) return;
    const d = document.createElement("div");
    d.textContent = msg;
    d.style.cssText =
      "position:fixed;left:50%;bottom:90px;transform:translateX(-50%);" +
      "background:rgba(20,20,20,0.92);color:#fff;padding:10px 16px;border-radius:10px;" +
      "font-size:13px;line-height:1.3;z-index:99999;max-width:88%;text-align:center;" +
      "box-shadow:0 4px 14px rgba(0,0,0,0.35)";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 4500);
  } catch {
    // ignore
  }
}

// Online TTS MP3 URLs to try, in order: StreamElements then Google Translate.
function ttsUrls(text: string, lang: string, rate: number): string[] {
  const q = encodeURIComponent(text.slice(0, 200));
  const tl = (lang || "en-US").split("-")[0] || "en";
  const speed = rate < 0.8 ? 0.3 : 1;
  const seVoice = lang === "en-GB" ? "Brian" : "Joanna";
  const seBase = "https://api.streamelements.com/kappa/v2/speech";
  const gBase = "https://translate.google.com/translate_tts";
  return [
    seBase + "?voice=" + seVoice + "&text=" + q,
    gBase + "?ie=UTF-8&client=tw-ob&tl=" + tl + "&ttsspeed=" + speed + "&q=" + q,
  ];
}

function playUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      const audio = new Audio(url);
      currentAudio = audio;
      let settled = false;
      const done = (ok: boolean, err?: Error) => {
        if (settled) return;
        settled = true;
        if (ok) resolve();
        else reject(err || new Error("audio error"));
      };
      audio.onended = () => done(true);
      audio.onerror = () => done(false, new Error("load/play error"));
      const p = audio.play();
      if (p && typeof (p as Promise<void>).catch === "function") {
        (p as Promise<void>).catch((e) => done(false, e as Error));
      }
    } catch (e) {
      reject(e as Error);
    }
  });
}

async function speakViaAudio(text: string, lang: string, rate: number): Promise<void> {
  const urls = ttsUrls(text, lang, rate);
  let lastErr: Error | undefined;
  for (const url of urls) {
    try {
      await playUrl(url);
      return;
    } catch (e) {
      lastErr = e as Error;
    }
  }
  throw lastErr || new Error("all tts sources failed");
}

function speakViaWebSpeech(text: string, lang: string, rate: number): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const synth = window.speechSynthesis;
  if (!cachedVoices.length) loadVoices();
  if (!cachedVoices.length) return false; // no voices => WebView, cannot speak
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate || 0.85;
  utterance.pitch = 1;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  try {
    synth.cancel();
    synth.resume();
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export async function speak(text: string, langOverride?: string): Promise<void> {
  if (!text) return;
  const settings = getProgress().settings;
  const lang = langOverride || settings.accent || "en-US";
  const rate = settings.rate || 0.85;

  // 1) Bundled offline audio first — works with no internet, plays in the WebView.
  const local = localAudioUrl(text);
  if (local) {
    try {
      await playUrl(local);
      return;
    } catch {
      // not bundled (e.g. example sentences) — fall through to online/web speech
    }
  }

  // 2) Native (APK): online stream, then speechSynthesis as a last resort.
  if (Capacitor.isNativePlatform()) {
    try {
      await speakViaAudio(text, lang, rate);
    } catch (e) {
      const ok = speakViaWebSpeech(text, lang, rate);
      if (!ok) {
        const msg = e && (e as Error).message ? (e as Error).message : String(e);
        toast("🔇 Звук не загрузился (" + msg + "). Нужен интернет для слов без офлайн-озвучки.");
      }
    }
    return;
  }

  // 3) Web: prefer the built-in synthesizer, fall back to the audio stream.
  if (!speakViaWebSpeech(text, lang, rate)) {
    speakViaAudio(text, lang, rate).catch(() => {});
  }
}

// ---- Word of the day (skips learned and excluded) ----

export function getWordOfDay(words: { id: number }[]): number {
  const progress = getProgress();
  const today = new Date().toISOString().split("T")[0];

  if (progress.lastWordOfDay && progress.lastWordOfDay.date === today) {
    return progress.lastWordOfDay.id;
  }

  const available = words
    .map((w) => w.id)
    .filter(
      (id) => !progress.learnedWords.includes(id) && !progress.excludedWords.includes(id)
    );

  const seed = today.split("-").reduce((a, b) => a + parseInt(b), 0);

  if (available.length === 0) {
    return words[seed % words.length].id;
  }

  const wordId = available[seed % available.length];
  progress.lastWordOfDay = { id: wordId, date: today };
  saveProgress(progress);
  return wordId;
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Warm up the voice list as soon as this module is imported (browser only).
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  primeVoices();
}
