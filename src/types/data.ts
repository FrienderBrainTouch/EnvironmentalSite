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
  /** 에너지 사용 상황 맞추기 등: 절약 관련 설명 (별도 블록으로 표시) */
  savingTip?: string;
}

export interface OxItem {
  question: string;
  correctAnswer: 'O' | 'X';
  /** 정답 확인 후 표시할 설명 */
  explanation?: string;
}

/** 순서 맞추기 한 라운드 (올바른 순서 + 선택적 설명) */
export interface OrderRound {
  items: string[];
  explanation?: string;
}

/** 분리수거 드래그 한 라운드 (물품 목록 + 선택적 전체 설명) */
export interface DragBucketRound {
  items: Array<{ id: string; label: string; bucketId: string; explanation?: string }>;
  explanation?: string;
}

/** 선 잇기(매칭) 한 라운드 (4~5쌍 + 선택적 설명) */
export interface MatchRound {
  pairs: Array<{ left: string; right: string; explanation?: string }>;
  explanation?: string;
}

export interface CountryQuestions {
  flagFind: ChoiceQuestion[];
  foodFind: ChoiceQuestion[];
  cultureFind: ChoiceQuestion[];
  landmarkFind: ChoiceQuestion[];
  oxQuiz: OxItem[];
  /** 자원순환: 항목별(유리·종이·플라스틱·캔 등) 드래그 라운드들 */
  dragByCategoryRounds?: DragBucketRound[];
  /** 자원순환: 분리수거 가능 / 일반쓰레기 드래그 라운드들 */
  dragRecyclableRounds?: DragBucketRound[];
  /** 전기 여행·절약: 절약 행동 / 낭비 행동 드래그 라운드들 */
  energySaveWasteRounds?: DragBucketRound[];
  /** 전기 여행·절약: 전기의 여행 순서 맞추기 라운드들 */
  energyOrderRounds?: OrderRound[];
  /** 탄소중립: 탄소 줄이기/늘리기 행동 드래그 라운드들 */
  carbonReduceRounds?: DragBucketRound[];
  /** 재생에너지: 절약/낭비 행동 드래그 라운드들 */
  greenVillageRounds?: DragBucketRound[];
  /** 기후변화: 환경 보호/나쁜 행동 드래그 라운드들 */
  climateActionRounds?: DragBucketRound[];
  /** 해양환경: 쓰레기통 드래그 라운드들 */
  oceanTrashRounds?: DragBucketRound[];
  /** 탄소중립: 선 잇기(매칭) 라운드들 (라운드당 4~5쌍) */
  carbonMatchRounds?: MatchRound[];
  /** 재생에너지: 에너지 연결하기 선 잇기 라운드들 (라운드당 4~5쌍) */
  greenMatchRounds?: MatchRound[];
  /** 기후변화: 원인·결과 맞추기 선 잇기 라운드들 (라운드당 4~5쌍) */
  climateMatchRounds?: MatchRound[];
  /** 해양환경: 바다생물 지키기 선 잇기 라운드들 (라운드당 4~5쌍) */
  oceanMatchRounds?: MatchRound[];
}

export type ActivityType =
  | 'flag_find'
  | 'food_find'
  | 'culture_find'
  | 'landmark_find'
  | 'ox_quiz';

export const ACTIVITY_LIST: { type: ActivityType; label: string; subLabel: string }[] = [
  { type: 'flag_find', label: '활동 1', subLabel: '' },
  { type: 'food_find', label: '활동 2', subLabel: '' },
  { type: 'culture_find', label: '활동 3', subLabel: '' },
  { type: 'landmark_find', label: '활동 4', subLabel: '' },
  { type: 'ox_quiz', label: '활동 5', subLabel: '' },
];
