export interface Country {
  id: string;
  name: string;
  city: string;
  coverColor: string;
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
  flagFind: ChoiceQuestion[];
  foodFind: ChoiceQuestion[];
  cultureFind: ChoiceQuestion[];
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
  { type: 'flag_find', label: '활동 1', subLabel: '클릭형 4지선다' },
  { type: 'food_find', label: '활동 2', subLabel: '클릭형 4지선다' },
  { type: 'culture_find', label: '활동 3', subLabel: '클릭형 4지선다' },
  { type: 'landmark_find', label: '활동 4', subLabel: '클릭형 4지선다' },
  { type: 'ox_quiz', label: '활동 5 (OX)', subLabel: 'OX 퀴즈' },
];
