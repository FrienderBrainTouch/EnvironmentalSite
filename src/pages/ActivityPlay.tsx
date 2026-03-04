import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Country } from '../types/data';
import type { CountryQuestions, ActivityType, ChoiceQuestion, OxItem } from '../types/data';
import styles from './ActivityPlay.module.css';

function toDataKey(type: ActivityType): keyof CountryQuestions {
  const map: Record<ActivityType, keyof CountryQuestions> = {
    flag_find: 'flagFind',
    food_find: 'foodFind',
    culture_find: 'cultureFind',
    landmark_find: 'landmarkFind',
    ox_quiz: 'oxQuiz',
  };
  return map[type];
}

export default function ActivityPlay() {
  const { countryId, activityType } = useParams<{ countryId: string; activityType: ActivityType }>();
  const navigate = useNavigate();
  const [country, setCountry] = useState<Country | null>(null);
  const [questions, setQuestions] = useState<CountryQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!countryId || !activityType) return;
    Promise.all([
      fetch('/data/countries.json').then((r) => r.json()),
      fetch(`/data/questions/${countryId}.json`).then((r) => {
        if (!r.ok) throw new Error('데이터를 불러올 수 없어요.');
        return r.json();
      }),
    ])
      .then(([countries, q]: [Country[], CountryQuestions]) => {
        const c = countries.find((x: Country) => x.id === countryId);
        setCountry(c ?? null);
        setQuestions(q);
        setError('');
      })
      .catch(() => {
        setCountry(null);
        setQuestions(null);
        setError('문제 데이터를 불러올 수 없어요.');
      })
      .finally(() => setLoading(false));
  }, [countryId, activityType]);

  const handleBack = useCallback(() => {
    if (countryId) navigate(`/countries/${countryId}`);
  }, [navigate, countryId]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.loading}>잠시만 기다려 주세요...</p>
      </div>
    );
  }

  if (error || !country || !questions || !activityType) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.error}>{error || '활동을 찾을 수 없어요.'}</p>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/countries')}>
          나라 목록으로
        </button>
      </div>
    );
  }

  if (activityType === 'flag_find' || activityType === 'food_find' || activityType === 'culture_find' || activityType === 'landmark_find') {
    const list = questions[toDataKey(activityType)] as ChoiceQuestion[];
    return (
      <MultiChoicePlay
        country={country}
        questions={list}
        onBack={handleBack}
      />
    );
  }

  if (activityType === 'ox_quiz') {
    const list = questions.oxQuiz as OxItem[];
    return (
      <OxQuizPlay
        country={country}
        items={list}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.error}>알 수 없는 활동이에요.</p>
      <button type="button" className={styles.backBtn} onClick={handleBack}>
        뒤로
      </button>
    </div>
  );
}

function MultiChoicePlay({
  country,
  questions: list,
  onBack,
}: {
  country: Country;
  questions: ChoiceQuestion[];
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const currentItem = list[index];
  const isCorrect = currentItem ? selected === currentItem.correctAnswer : false;
  const hasNext = index + 1 < list.length;

  function handleSelect(opt: string) {
    if (showResult) return;
    setSelected(opt);
    setShowResult(true);
  }

  function handleNext() {
    if (index + 1 < list.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowResult(false);
    }
  }

  if (!currentItem) return null;
  const current = currentItem;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          뒤로
        </button>
        <span className={styles.countryName}>{country.name}</span>
        <span className={styles.progress}>
          {index + 1} / {list.length}
        </span>
      </header>
      <main className={styles.main}>
        <div className={styles.questionArea}>
          <p className={styles.question}>
            {current.question ?? `${index + 1}번. 정답을 골라보세요`}
          </p>
        </div>
        {!showResult ? (
          <div className={styles.optionList}>
            {current.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={styles.optionButton}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.resultArea}>
            <div className={styles.resultBadge} data-correct={isCorrect}>
              {isCorrect ? '정답이에요!' : '다시 생각해 보세요'}
            </div>
            <p className={styles.answerLine}>
              <span className={styles.answerLabel}>정답</span>
              <span className={styles.answerText}>{current.correctAnswer}</span>
            </p>
            {current.explanation ? (
              <p className={styles.explanation}>{current.explanation}</p>
            ) : null}
            <div className={styles.resultButtons}>
              {hasNext ? (
                <button type="button" className={styles.nextButton} onClick={handleNext}>
                  다음 문제
                </button>
              ) : (
                <p className={styles.finished}>모든 문제를 풀었어요!</p>
              )}
              <button type="button" className={styles.backToContentBtn} onClick={onBack}>
                활동 끝내기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function OxQuizPlay({
  country,
  items,
  onBack,
}: {
  country: Country;
  items: OxItem[];
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<'O' | 'X' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const currentItem = items[index];
  const isCorrect = currentItem ? selected === currentItem.correctAnswer : false;
  const hasNext = index + 1 < items.length;

  function handleAnswer(choice: 'O' | 'X') {
    if (showResult) return;
    setSelected(choice);
    setShowResult(true);
  }

  function handleNext() {
    if (index + 1 < items.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowResult(false);
    }
  }

  if (!currentItem) return null;
  const current = currentItem;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          뒤로
        </button>
        <span className={styles.countryName}>{country.name}</span>
        <span className={styles.progress}>
          {index + 1} / {items.length}
        </span>
      </header>
      <main className={styles.main}>
        <div className={styles.questionArea}>
          <p className={styles.question}>
            {index + 1}번 · {current.question}
          </p>
        </div>
        {!showResult ? (
          <div className={styles.oxSplit}>
            <button
              type="button"
              className={styles.oxHalf}
              data-side="o"
              onClick={() => handleAnswer('O')}
              aria-label="O"
            >
              <span className={styles.oxLetter}>O</span>
            </button>
            <button
              type="button"
              className={styles.oxHalf}
              data-side="x"
              onClick={() => handleAnswer('X')}
              aria-label="X"
            >
              <span className={styles.oxLetter}>X</span>
            </button>
          </div>
        ) : (
          <div className={styles.resultArea}>
            <div className={styles.resultBadge} data-correct={isCorrect}>
              {isCorrect ? '정답이에요!' : '다시 생각해 보세요'}
            </div>
            <p className={styles.answerLine}>
              <span className={styles.answerLabel}>정답</span>
              <span className={styles.answerText}>{current.correctAnswer}</span>
            </p>
            {current.explanation ? (
              <p className={styles.explanation}>{current.explanation}</p>
            ) : null}
            <div className={styles.resultButtons}>
              {hasNext ? (
                <button type="button" className={styles.nextButton} onClick={handleNext}>
                  다음 문제
                </button>
              ) : (
                <p className={styles.finished}>모든 문제를 풀었어요!</p>
              )}
              <button type="button" className={styles.backToContentBtn} onClick={onBack}>
                활동 끝내기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
