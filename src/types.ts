export interface Option {
  id: string; // 'a', 'b', 'c', 'd'
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  originalNumber: number; // The number from the text file (e.g. Question 15)
  text: string;
  options: Option[];
}

export interface ExamSession {
  questions: Question[];
  answers: Record<number, string[]>; // questionId -> array of selected option IDs
  isSubmitted: boolean;
  startTime: number;
  endTime?: number;
  duration: number; // duration in seconds
}

export const AppScreen = {
  WELCOME: 'WELCOME',
  QUIZ: 'QUIZ',
  RESULTS: 'RESULTS',
  IMPORT: 'IMPORT'
} as const;

export type AppScreenType = typeof AppScreen[keyof typeof AppScreen];