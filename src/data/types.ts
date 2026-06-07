export interface Word {
  id: number;
  en: string;
  ru: string;
  transcription: string;
  example: string;
  category: string;
  level: "A1" | "A2" | "B1" | "B2";
  note?: string; // подсказка/объяснение (идиомы, фразовые глаголы, сложные слова)
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}
