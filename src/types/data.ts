export interface Country {
  id: string;
  name: string;
  city: string;
  coverColor: string;
  /** ISO 3166-1 alpha-2 (e.g. fr, kr). Used for flag image. */
  flagCode?: string;
}

export interface ChoiceQuestion {
  question?: string;
  options: string[];
  correctAnswer: string;
  /** 정답 확인 후 표시할 설명 (국기/문화/랜드마크 등) */
  explanation?: string;
}

export interface OxItem {
  question: string;
  correctAnswer: 'O' | 'X';
  /** 정답 확인 후 표시할 설명 */
  explanation?: string;
}

export interface CountryQuestions {
  flagFind: ChoiceQuestion;
  foodFind: ChoiceQuestion[];
  cultureFind: ChoiceQuestion;
  landmarkFind: ChoiceQuestion[];
  oxQuiz: OxItem[];
}

export type ActivityType =
  | 'flag_find'
  | 'food_find'
  | 'culture_find'
  | 'landmark_find'
  | 'ox_quiz';

export const ACTIVITY_LIST: { type: ActivityType; label: string; subLabel: string }[] = [
  { type: 'flag_find', label: '국기 찾기', subLabel: '국기를 찾아보세요' },
  { type: 'food_find', label: '음식 찾기', subLabel: '10문제' },
  { type: 'culture_find', label: '대표 문화', subLabel: '문화를 알아봐요' },
  { type: 'landmark_find', label: '랜드마크 찾기', subLabel: '10문제' },
  { type: 'ox_quiz', label: 'OX 퀴즈', subLabel: '10문제, 다양한 유형' },
];
