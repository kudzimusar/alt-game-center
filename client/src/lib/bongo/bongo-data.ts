export interface BongoQuestion {
  sentence: string;
  correct: string;
  grammar: string;
}

export interface BongoWeek {
  week: number;
  title: string;
  grammarFocus: string;
  questions: BongoQuestion[];
}

export interface BongoGrade {
  grade: string;
  emoji: string;
  label: string;
  description: string;
  textbook: string;
  weeks: BongoWeek[];
}

import { grade1 } from "./bongo-grade1";
import { grade2 } from "./bongo-grade2";
import { grade3 } from "./bongo-grade3";

export const bongoBingoData: BongoGrade[] = [
  grade1 as unknown as BongoGrade,
  grade2 as unknown as BongoGrade,
  grade3 as unknown as BongoGrade,
];

export const BINGO_WORDS = [
  "ABLE", "ALSO", "ALWAYS", "AMONG", "ANOTHER", "AROUND", "ASKED",
  "BECAUSE", "BEFORE", "BEING", "BELIEVE", "BETTER", "BETWEEN", "BOTH",
  "CALLED", "CAME", "COULD", "DURING", "EACH", "EITHER",
  "ENJOY", "EVER", "EVERY", "FELT", "FINALLY", "FIRST", "FOUND",
  "FROM", "GAVE", "GIVEN", "GOING", "GREAT", "GROUP", "GROWN",
  "HEARD", "HELLO", "HELPED", "HIMSELF", "HOWEVER", "IDEAS", "IMPORTANT",
  "INSTEAD", "INTO", "JUST", "KEEP", "KEPT", "KNOWN", "LARGE", "LATER",
  "LEARN", "LEFT", "LIKE", "LOCAL", "LONG", "MADE", "MAKES",
  "MIGHT", "MORE", "MOST", "MUCH", "MUST", "NEVER", "NEXT",
  "OFTEN", "ONCE", "ONLY", "OTHER", "OVER", "PART", "PEOPLE",
  "PLACE", "POINT", "QUITE", "REALLY", "RIGHT", "SAID", "SAME",
  "SEEM", "SHALL", "SHOULD", "SINCE", "SMALL", "SOME", "STILL",
  "SUCH", "SURE", "TAKE", "THAN", "THAT", "THEIR", "THEM",
  "THEN", "THERE", "THESE", "THEY", "THING", "THINK", "THOSE",
  "THROUGH", "TIME", "TODAY", "TOGETHER", "TOLD", "TOOK", "TOWARD",
  "UNDER", "UNTIL", "UPON", "USED", "VERY", "WANT", "WELL",
  "WERE", "WHAT", "WHEN", "WHERE", "WHICH", "WHILE", "WITH",
  "WORD", "WOULD", "YEAR", "YOUR",
];
