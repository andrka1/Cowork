import { Word, Category } from "./types";
import { categories } from "./categories";
import { basicsWords } from "./words-basics";
import { travelWords } from "./words-travel";
import { foodWords } from "./words-food";
import { workWords } from "./words-work";
import { emotionsWords } from "./words-emotions";
import { natureWords, techWords, homeWords } from "./words-more";
import { bodyWords, timeWords, shoppingWords, educationWords, peopleWords, cityWords } from "./words-extra";
import { verbsWords, adjectivesWords } from "./words-verbs-adj";
import { musicWords, phrasalVerbWords, slangWords } from "./words-music";
import { ieltsExtraWords } from "./words-ielts";

export type { Word, Category };
export { categories };

export const words: Word[] = [
  ...basicsWords,
  ...travelWords,
  ...foodWords,
  ...workWords,
  ...emotionsWords,
  ...natureWords,
  ...techWords,
  ...homeWords,
  ...bodyWords,
  ...timeWords,
  ...shoppingWords,
  ...educationWords,
  ...peopleWords,
  ...cityWords,
  ...verbsWords,
  ...adjectivesWords,
  ...musicWords,
  ...phrasalVerbWords,
  ...slangWords,
  ...ieltsExtraWords,
];
