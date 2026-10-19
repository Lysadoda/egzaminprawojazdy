// src/lib/types.ts

export type QuestionType = 'ABC' | 'YN';

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: Record<string, string>; // Optional because YN questions don't have this
  correct: string;
  media: string | null;
  points: number;
  kategorie: string;
}

export type ExplanationsDB = Record<string, string>;