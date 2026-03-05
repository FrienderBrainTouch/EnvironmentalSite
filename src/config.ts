import type { ActivityType } from './types/data';
import { ACTIVITY_LIST } from './types/data';

export const MOCK_PASSWORD = '1234';

// 인터랙션 타입 정의
export type InteractionKind = 'multi_choice' | 'ox' | 'order' | 'order_rounds' | 'match' | 'drag_bucket' | 'drag_bucket_rounds';

export interface OrderConfig {
  type: 'order';
  items: string[]; // 올바른 순서
  /** 결과 확인 후 표시할 설명 */
  explanation?: string;
}

/** 여러 라운드로 구성된 순서 맞추기 (10문제 이상) */
export interface OrderRoundsConfig {
  type: 'order_rounds';
  roundsKey: 'energyOrderRounds';
  question?: string;
}

export interface MatchPair {
  left: string;
  right: string;
  /** 결과 확인 후 표시할 설명 (해당 짝에 대한 설명) */
  explanation?: string;
}

export interface MatchConfig {
  type: 'match';
  pairs: MatchPair[];
}

/** 여러 라운드로 구성된 선 잇기(매칭): 라운드당 4~5쌍, 라운드 끝나면 결과화면 */
export interface MatchRoundsConfig {
  type: 'match_rounds';
  roundsKey: 'carbonMatchRounds' | 'greenMatchRounds' | 'climateMatchRounds' | 'oceanMatchRounds';
  question?: string;
}

export interface DragBucketBucket {
  id: string;
  label: string;
}

export interface DragBucketItem {
  id: string;
  label: string;
  bucketId: string;
  /** 결과 확인 후 표시할 설명 */
  explanation?: string;
}

export interface DragBucketConfig {
  type: 'drag_bucket';
  buckets: DragBucketBucket[];
  items: DragBucketItem[];
  /** 활동별 안내 문구 (없으면 기본 문구 사용) */
  question?: string;
}

/** 여러 라운드로 구성된 분리수거 드래그 (라운드별 4~5개 물품, 정답 체크 시 색 구분·하단 설명) */
export interface DragBucketRoundsConfig {
  type: 'drag_bucket_rounds';
  buckets: DragBucketBucket[];
  /** questions JSON 내 해당 키에서 라운드 배열 로드 */
  roundsKey:
    | 'dragByCategoryRounds'
    | 'dragRecyclableRounds'
    | 'energySaveWasteRounds'
    | 'carbonReduceRounds'
    | 'greenVillageRounds'
    | 'climateActionRounds'
    | 'oceanTrashRounds';
  question?: string;
}

export type ActivityInteractionConfig =
  | { type: 'multi_choice' }
  | { type: 'ox' }
  | OrderConfig
  | OrderRoundsConfig
  | MatchConfig
  | MatchRoundsConfig
  | DragBucketConfig
  | DragBucketRoundsConfig;

export interface ActivityDisplay {
  label: string;
  subLabel: string;
}

// 콘텐츠별 활동명·설명
export const ACTIVITY_DISPLAY_CONFIG: Record<
  string,
  Partial<Record<ActivityType, ActivityDisplay>>
> = {
  recycle: {
    ox_quiz: { label: 'OX 퀴즈', subLabel: '문제와 O·X 선택 후 정답과 설명 확인' },
    flag_find: { label: '4지 선다', subLabel: '문제와 항목 선택 후 정답과 설명 확인' },
    food_find: { label: '분리수거 통에 넣기', subLabel: '유리·종이·플라스틱·캔 등에 드래그하여 분류' },
    culture_find: { label: '분리수거 가능 / 일반쓰레기', subLabel: '드래그하여 분류 후 정답 확인' },
  },
  energy_trip: {
    ox_quiz: { label: 'OX 퀴즈', subLabel: '문제와 O·X 선택 후 정답과 설명 확인' },
    food_find: { label: '4지 선다', subLabel: '전기를 사용하는 물건·에너지 상식 (정답과 설명 확인)' },
    flag_find: { label: '에너지 사용 상황 맞추기', subLabel: '문장을 읽고 알맞은 설명을 선택하는 방식 (클릭 선택)' },
    landmark_find: { label: '절약 행동 / 낭비 행동', subLabel: '드래그하여 분류 후 정답 확인 (10문제 이상)' },
  },
  carbon_neutral: {
    ox_quiz: { label: 'OX 퀴즈', subLabel: '문제와 O·X 선택 후 정답과 설명 확인' },
    flag_find: { label: '4지 선다', subLabel: '탄소 줄이기 행동 찾기 (정답과 설명 확인)' },
    food_find: { label: '탄소 줄이기/늘리기 분류', subLabel: '드래그하여 분류 후 정답 확인 (10문제 이상)' },
    culture_find: { label: '탄소중립 행동 연결하기', subLabel: '행동과 결과 매칭 (10쌍)' },
  },
  green_village: {
    ox_quiz: { label: 'OX 퀴즈', subLabel: '문제와 O·X 선택 후 정답과 설명 확인' },
    flag_find: { label: '4지 선다', subLabel: '친환경 에너지·재생에너지 골라보기 (정답과 설명 확인)' },
    food_find: { label: '에너지 연결하기', subLabel: '에너지와 발전소·개념 선 잇기 (라운드별 결과화면)' },
    culture_find: { label: '절약/낭비 분류', subLabel: '드래그하여 분류 후 정답 확인 (10문제 이상)' },
  },
  climate_action: {
    ox_quiz: { label: 'OX 퀴즈', subLabel: '문제와 O·X 선택 후 정답과 설명 확인' },
    flag_find: { label: '4지 선다', subLabel: '기후변화 원인 찾기 (정답과 설명 확인)' },
    food_find: { label: '기후변화 결과 맞추기', subLabel: '원인과 결과 선 잇기 (라운드별 결과화면)' },
    culture_find: { label: '환경 보호/나쁜 행동 분류', subLabel: '드래그하여 분류 후 정답 확인 (10문제 이상)' },
  },
  ocean_rescue: {
    ox_quiz: { label: 'OX 퀴즈', subLabel: '문제와 O·X 선택 후 정답과 설명 확인' },
    flag_find: { label: '4지 선다', subLabel: '바다 오염·정화 관련 문제 (정답과 설명 확인)' },
    food_find: { label: '바다 정화 활동', subLabel: '쓰레기를 통에 드래그 (10문제 이상)' },
    culture_find: { label: '바다 동물 지키기', subLabel: '상황과 행동 선 잇기 (라운드별 결과화면)' },
  },
};

// 콘텐츠별 · 활동별 인터랙션 설정
// key: contentId (contents.json의 id와 일치)
// ActivityType: flag_find, food_find, culture_find, landmark_find, ox_quiz
export const INTERACTION_CONFIG: Record<
  string,
  Partial<Record<ActivityType, ActivityInteractionConfig>>
> = {
  // 1. 똑똑한 재활용 (자원순환·분리배출 체험 VR): 1=OX, 2=4지선다, 3=항목별 드래그, 4=가능/일반 드래그
  recycle: {
    ox_quiz: { type: 'ox' },
    flag_find: { type: 'multi_choice' },
    food_find: {
      type: 'drag_bucket_rounds',
      roundsKey: 'dragByCategoryRounds',
      question: '왼쪽 물품을 끌어 오른쪽 분리수거 항목에 넣어 보세요.',
      buckets: [
        { id: 'paper', label: '종이' },
        { id: 'plastic', label: '플라스틱' },
        { id: 'can', label: '캔' },
        { id: 'glass', label: '유리' },
        { id: 'general', label: '일반쓰레기' },
      ],
    },
    culture_find: {
      type: 'drag_bucket_rounds',
      roundsKey: 'dragRecyclableRounds',
      question: '왼쪽 물품을 끌어 분리수거 가능 / 일반쓰레기에 넣어 보세요.',
      buckets: [
        { id: 'recycle', label: '분리수거 가능' },
        { id: 'general', label: '일반 쓰레기' },
      ],
    },
  },

  // 2. 에너지가 집에 오기까지 여행 (전기 여행·절약 체험 VR): 1=OX, 2=4지선다, 3=에너지 사용 상황 맞추기, 4=절약/낭비 드래그
  energy_trip: {
    ox_quiz: { type: 'ox' },
    food_find: { type: 'multi_choice' },
    flag_find: { type: 'multi_choice' },
    landmark_find: {
      type: 'drag_bucket_rounds',
      roundsKey: 'energySaveWasteRounds',
      question: '왼쪽 행동을 끌어 절약 행동 / 낭비 행동에 넣어 보세요.',
      buckets: [
        { id: 'save', label: '절약 행동' },
        { id: 'waste', label: '낭비 행동' },
      ],
    },
  },

  // 3. 탄소를 줄이는 탄소중립 생활 (4활동: OX, 4지선다, 드래그 라운드, 매칭)
  carbon_neutral: {
    ox_quiz: { type: 'ox' },
    flag_find: { type: 'multi_choice' },
    food_find: {
      type: 'drag_bucket_rounds',
      roundsKey: 'carbonReduceRounds',
      question: '왼쪽 행동을 끌어 탄소 줄이는 행동 / 탄소 늘리는 행동에 넣어 보세요.',
      buckets: [
        { id: 'good', label: '탄소 줄이는 행동' },
        { id: 'bad', label: '탄소 늘리는 행동' },
      ],
    },
    culture_find: {
      type: 'match_rounds',
      roundsKey: 'carbonMatchRounds',
      question: '점을 짝지어 연결해 보세요. (왼쪽 카드 점 → 오른쪽 카드 점)',
    },
    landmark_find: {
      type: 'order',
      items: ['불 끄기', '걷거나 자전거 타기', '일회용품 줄이기', '분리배출하기'],
      explanation: '불을 끄면 전기 사용이 줄고, 걸거나 자전거를 타면 자동차 연료를 아껴 탄소를 줄일 수 있어요. 일회용품을 줄이고 분리배출을 하면 지구를 지키는 데 도움이 됩니다.',
    },
  },

  // 4. 친환경 에너지 발전소 (4활동: OX, 4지선다, 선 잇기 라운드, 드래그 라운드) — 탄소중립과 동일 구조
  green_village: {
    ox_quiz: { type: 'ox' },
    flag_find: { type: 'multi_choice' },
    food_find: {
      type: 'match_rounds',
      roundsKey: 'greenMatchRounds',
      question: '점을 짝지어 연결해 보세요. (왼쪽 카드 점 → 오른쪽 카드 점)',
    },
    culture_find: {
      type: 'drag_bucket_rounds',
      roundsKey: 'greenVillageRounds',
      question: '왼쪽 행동을 끌어 절약 행동 / 낭비 행동에 넣어 보세요.',
      buckets: [
        { id: 'save', label: '절약 행동' },
        { id: 'waste', label: '낭비 행동' },
      ],
    },
    landmark_find: {
      type: 'order',
      items: ['집 지붕에 태양광 달기', '언덕에 풍력 발전기 세우기', '강가에 수력 발전소 만들기'],
    },
  },

  // 5. 기후변화와 환경 문제 (4활동: OX, 4지선다, 선 잇기 라운드, 드래그 라운드) — 탄소중립과 동일 구조
  climate_action: {
    ox_quiz: { type: 'ox' },
    flag_find: { type: 'multi_choice' },
    food_find: {
      type: 'match_rounds',
      roundsKey: 'climateMatchRounds',
      question: '점을 짝지어 연결해 보세요. (원인과 결과)',
    },
    culture_find: {
      type: 'drag_bucket_rounds',
      roundsKey: 'climateActionRounds',
      question: '왼쪽 행동을 끌어 환경 보호 행동 / 환경에 나쁜 행동에 넣어 보세요.',
      buckets: [
        { id: 'good', label: '환경 보호 행동' },
        { id: 'bad', label: '환경에 나쁜 행동' },
      ],
    },
    landmark_find: {
      type: 'order',
      items: ['전기 절약하기', '일회용품 줄이기', '걷기·자전거 타기', '분리배출하기'],
    },
  },

  // 6. 바다를 지키는 해양환경 (4활동: OX, 4지선다, 드래그 라운드, 선 잇기 라운드) — 탄소중립과 동일 구조
  ocean_rescue: {
    ox_quiz: { type: 'ox' },
    flag_find: { type: 'multi_choice' },
    food_find: {
      type: 'drag_bucket_rounds',
      roundsKey: 'oceanTrashRounds',
      question: '쓰레기는 쓰레기통에, 놔두어도 되는 것은 오른쪽에 넣어 보세요.',
      buckets: [
        { id: 'trash', label: '쓰레기통' },
        { id: 'natural', label: '놔두어도 되는 것' },
      ],
    },
    culture_find: {
      type: 'match_rounds',
      roundsKey: 'oceanMatchRounds',
      question: '점을 짝지어 연결해 보세요. (상황과 올바른 행동)',
    },
    landmark_find: {
      type: 'drag_bucket',
      buckets: [
        { id: 'pickup', label: '주워야 할 것' },
        { id: 'natural', label: '놔두어도 되는 것' },
      ],
      items: [
        { id: 'beach_bottle', label: '플라스틱 병', bucketId: 'pickup' },
        { id: 'beach_can', label: '캔', bucketId: 'pickup' },
        { id: 'shell', label: '조개껍데기', bucketId: 'natural' },
        { id: 'stone', label: '돌멩이', bucketId: 'natural' },
      ],
    },
  },
};

/** 콘텐츠별 활동 노출 순서 (없으면 types/data ACTIVITY_LIST 순서 사용) */
export const ACTIVITY_ORDER_BY_CONTENT: Record<string, ActivityType[]> = {
  recycle: ['ox_quiz', 'flag_find', 'food_find', 'culture_find'],
  energy_trip: ['ox_quiz', 'food_find', 'flag_find', 'landmark_find'],
  carbon_neutral: ['ox_quiz', 'flag_find', 'food_find', 'culture_find'],
  green_village: ['ox_quiz', 'flag_find', 'food_find', 'culture_find'],
  climate_action: ['ox_quiz', 'flag_find', 'food_find', 'culture_find'],
  ocean_rescue: ['ox_quiz', 'flag_find', 'food_find', 'culture_find'],
};

export function getActivityOrder(contentId: string | undefined): ActivityType[] {
  if (!contentId) return [];
  const order = ACTIVITY_ORDER_BY_CONTENT[contentId];
  if (order?.length) return order;
  return ACTIVITY_LIST.map((a) => a.type);
}

export function getInteractionConfig(
  contentId: string | undefined,
  activityType: ActivityType | undefined,
): ActivityInteractionConfig | null {
  if (!contentId || !activityType) return null;
  const byContent = INTERACTION_CONFIG[contentId];
  if (!byContent) return null;
  return byContent[activityType] ?? null;
}

export function getActivityDisplay(
  contentId: string | undefined,
  activityType: ActivityType,
): ActivityDisplay | null {
  if (!contentId) return null;
  const byContent = ACTIVITY_DISPLAY_CONFIG[contentId];
  if (!byContent) return null;
  return byContent[activityType] ?? null;
}

