// Unified progress tracking: spaced repetition + word of day + TTS (v2)
// merged with word exclusion + grammar results (IELTS upgrade)

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
}

const STORAGE_KEY = "lingua_mini_progress";

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
};

export function getProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultProgress };
    const parsed = JSON.parse(stored);
    // Migration: ensure all fields exist for older saves
    return { ...defaultProgress, ...parsed };
  } catch {
    return { ...defaultProgress };
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

// ---- Text-to-Speech pronunciation ----

export function speak(text: string, lang: string = "en-US"): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const englishVoice =
    voices.find((v) => v.lang.startsWith("en") && v.name.includes("Google")) ||
    voices.find((v) => v.lang.startsWith("en"));
  if (englishVoice) utterance.voice = englishVoice;

  window.speechSynthesis.speak(utterance);
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
