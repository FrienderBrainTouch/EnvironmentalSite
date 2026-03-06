import type { CountryQuestions, ChoiceQuestion } from '../types/data';

/**
 * Fisher-Yates shuffle. Returns a new shuffled array (does not mutate).
 */
export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

function shuffleOptions(q: ChoiceQuestion): ChoiceQuestion {
  return { ...q, options: shuffle(q.options) };
}

/**
 * 옵션 순서·문항 순서를 랜덤화한 새 CountryQuestions 반환 (매 로드/진입 시 다른 순서).
 * - flagFind, cultureFind: 각 문항의 options만 Fisher–Yates로 섞음 (문항 순서 유지)
 * - foodFind, landmarkFind: 문항 배열 순서 + 각 문항의 options 순서 섞음
 * - oxQuiz: 문항 배열 순서만 섞음
 * - 그 외 라운드 데이터(dragByCategoryRounds 등)는 그대로 유지
 */
export function randomizeQuestions(q: CountryQuestions): CountryQuestions {
  return {
    ...q,
    flagFind: (q.flagFind ?? []).map(shuffleOptions),
    cultureFind: (q.cultureFind ?? []).map(shuffleOptions),
    foodFind: shuffle(q.foodFind ?? []).map(shuffleOptions),
    landmarkFind: shuffle(q.landmarkFind ?? []).map(shuffleOptions),
    oxQuiz: shuffle(q.oxQuiz ?? []),
  };
}
