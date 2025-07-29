export interface Chapter {
  id: string;
  title: string;
  progress?: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  chapterId: string;
  progress: { completed: boolean; last_seen: string };
  current?: boolean;
  content: {
    body: string | Exercise[] | MCQExercise[];
    type: "text" | "exercise";
  };
}

export interface Exercise {
  type:
    | "mcq"
    | "fill_in_blanks1"
    | "fill_in_blanks2"
    | "order"
    | "match_pairs"
    | "true_or_false"
    | "spot_mistake";
  question: string | Array<string>;
  options?: string[];
  explaination: string;
  correct_answer?: number;
}

export interface MCQExercise {
  type: string;
  question: string;
  options: string[];
  explanation: string;
  correct_answer: number;
}

export interface FillInTheBlanks1Exercise {
  type: string;
  question: string[];
  options: string[];
  explanation: string;
  correct_answer: number;
}

export interface MatchPairsExercise {
  question: string;
  type: string;
  left_options: string[];
  right_options: string[];
  correct_answer: Array<{
    left: number;
    right: number;
  }>;
  explanation: string;
}

export interface TrueOrFalseExercise {
  question: string;
  type: "true_or_false";
  correct_answer: boolean;
}

export interface OrderExercise {
  question: string;
  type: "order";
  options: string[];
  correct_answer: number[];
}

export interface Course {
  id: string;
  status: string;
  name: string;
  currentChapter: { title: string };
  progress: number;
  color: string;
}
