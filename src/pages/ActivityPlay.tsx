import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Country } from '../types/data';
import type { CountryQuestions, ActivityType, ChoiceQuestion, OxItem, DragBucketRound, OrderRound, MatchRound } from '../types/data';
import { randomizeQuestions } from '../utils/shuffle';
import { getInteractionConfig } from '../config';
import type {
  ActivityInteractionConfig,
  OrderConfig,
  OrderRoundsConfig,
  MatchConfig,
  MatchRoundsConfig,
  DragBucketConfig,
  DragBucketRoundsConfig,
} from '../config';
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
      fetch('/data/contents.json').then((r) => r.json()),
      fetch(`/data/questions/${countryId}.json`).then((r) => {
        if (!r.ok) throw new Error('데이터를 불러올 수 없어요.');
        return r.json();
      }),
    ])
      .then(([countries, q]: [Country[], CountryQuestions]) => {
        const c = countries.find((x: Country) => x.id === countryId);
        setCountry(c ?? null);
        setQuestions(randomizeQuestions(q));
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
    if (countryId) navigate(`/contents/${countryId}`);
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
        <button type="button" className={styles.backBtn} onClick={() => navigate('/contents')}>
          콘텐츠 목록으로
        </button>
      </div>
    );
  }

  const config: ActivityInteractionConfig | null = getInteractionConfig(
    countryId,
    activityType,
  );

  // OX 퀴즈
  if (activityType === 'ox_quiz' || config?.type === 'ox') {
    const list = questions.oxQuiz as OxItem[];
    return <OxQuizPlay country={country} items={list} onBack={handleBack} />;
  }

  // 순서 맞추기 (단일)
  if (config?.type === 'order') {
    return (
      <OrderPlay
        country={country}
        config={config as OrderConfig}
        onBack={handleBack}
      />
    );
  }

  // 순서 맞추기 (여러 라운드: 전기 여행 등)
  if (config?.type === 'order_rounds') {
    const roundsConfig = config as OrderRoundsConfig;
    const rounds = questions[roundsConfig.roundsKey] as OrderRound[] | undefined;
    if (rounds?.length) {
      return (
        <OrderRoundsPlay
          country={country}
          config={roundsConfig}
          rounds={rounds}
          onBack={handleBack}
        />
      );
    }
  }

  // 매칭(연결하기)
  if (config?.type === 'match') {
    return (
      <MatchPlay
        country={country}
        config={config as MatchConfig}
        onBack={handleBack}
      />
    );
  }

  // 선 잇기(매칭) 여러 라운드: 라운드당 4~5쌍, 라운드 끝나면 결과화면
  if (config?.type === 'match_rounds') {
    const roundsConfig = config as MatchRoundsConfig;
    const rounds = questions[roundsConfig.roundsKey] as MatchRound[] | undefined;
    if (rounds?.length) {
      return (
        <MatchRoundsPlay
          country={country}
          config={roundsConfig}
          rounds={rounds}
          onBack={handleBack}
        />
      );
    }
  }

  // 드래그하여 통에 넣기 (단일)
  if (config?.type === 'drag_bucket') {
    return (
      <DragBucketPlay
        country={country}
        config={config as DragBucketConfig}
        onBack={handleBack}
      />
    );
  }

  // 드래그하여 통에 넣기 (여러 라운드: 항목별 / 분리수거 가능·일반쓰레기)
  if (config?.type === 'drag_bucket_rounds') {
    const roundsConfig = config as DragBucketRoundsConfig;
    const rounds = questions[roundsConfig.roundsKey] as DragBucketRound[] | undefined;
    if (rounds?.length) {
      return (
        <DragBucketRoundsPlay
          country={country}
          config={roundsConfig}
          rounds={rounds}
          onBack={handleBack}
        />
      );
    }
  }

  // 기본: 다문항 4지선다
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
          <div className={`${styles.resultArea} ${styles.resultAreaFullScreen}`}>
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
            {current.savingTip ? (
              <div className={styles.savingTipBlock}>
                <span className={styles.savingTipLabel}>절약</span>
                <p className={styles.savingTipText}>{current.savingTip}</p>
              </div>
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

function OrderPlay({
  country,
  config,
  onBack,
}: {
  country: Country;
  config: OrderConfig;
  onBack: () => void;
}) {
  const [items, setItems] = useState<string[]>(() => [...config.items].sort(() => Math.random() - 0.5));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      if (moved === undefined) return prev;
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  const isCorrect = checked && items.every((v, i) => v === config.items[i]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          뒤로
        </button>
        <span className={styles.countryName}>{country.name}</span>
      </header>
      <main className={styles.main}>
        <div className={styles.questionArea}>
          <p className={styles.question}>카드를 끌어 올바른 순서로 줄을 맞춰 보세요.</p>
        </div>
        <div className={styles.orderList}>
          {items.map((item, index) => (
            <button
              key={item + index}
              type="button"
              className={styles.orderItem}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              <span className={styles.orderIndex}>{index + 1}</span>
              <span>{item}</span>
            </button>
          ))}
        </div>
        <div className={styles.resultArea}>
          {!checked ? (
            <button
              type="button"
              className={styles.nextButton}
              onClick={() => setChecked(true)}
            >
              순서 확인하기
            </button>
          ) : (
            <>
              <p className={isCorrect ? styles.correctText : styles.incorrectText}>
                {isCorrect ? '정답이에요! 잘했어요.' : '순서를 다시 한 번 바꿔 보세요.'}
              </p>
              <p className={styles.explanation}>
                {config.explanation ?? (isCorrect ? '순서를 올바르게 맞추었어요.' : '카드를 끌어 올바른 순서로 다시 맞춰 보세요.')}
              </p>
            </>
          )}
          <button type="button" className={styles.backToContentBtn} onClick={onBack}>
            활동 끝내기
          </button>
        </div>
      </main>
    </div>
  );
}

function OrderRoundsPlay({
  country,
  config,
  rounds,
  onBack,
}: {
  country: Country;
  config: OrderRoundsConfig;
  rounds: OrderRound[];
  onBack: () => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const currentRound = rounds[roundIndex];
  const [items, setItems] = useState<string[]>(() =>
    rounds[0]?.items?.length ? [...rounds[0].items].sort(() => Math.random() - 0.5) : [],
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const hasNext = roundIndex + 1 < rounds.length;

  useEffect(() => {
    if (!currentRound?.items?.length) return;
    setItems([...currentRound.items].sort(() => Math.random() - 0.5));
    setChecked(false);
    setDragIndex(null);
  }, [roundIndex, currentRound?.items]);

  function handleDragStart(index: number) {
    setDragIndex(index);
    setChecked(false);
  }

  function handleDragOver(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      if (moved === undefined) return prev;
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  function handleNext() {
    if (hasNext) setRoundIndex((i) => i + 1);
  }

  if (!currentRound) return null;

  const isCorrect = checked && items.length === currentRound.items.length && items.every((v, i) => v === currentRound.items[i]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          뒤로
        </button>
        <span className={styles.countryName}>{country.name}</span>
        <span className={styles.progress}>
          {roundIndex + 1} / {rounds.length}
        </span>
      </header>
      <main className={styles.main}>
        {!checked ? (
          <>
            <div className={styles.questionArea}>
              <p className={styles.question}>
                {config.question ?? '카드를 끌어 올바른 순서로 줄을 맞춰 보세요.'}
              </p>
            </div>
            <div className={styles.orderList}>
              {items.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  className={styles.orderItem}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                >
                  <span className={styles.orderIndex}>{index + 1}</span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
            <div className={styles.resultArea}>
              <button
                type="button"
                className={styles.nextButton}
                onClick={() => setChecked(true)}
              >
                순서 확인하기
              </button>
            </div>
          </>
        ) : (
          <div className={`${styles.resultArea} ${styles.resultAreaFullScreen}`}>
            <div className={styles.resultBadge} data-correct={isCorrect}>
              {isCorrect ? '정답이에요!' : '다시 확인해 보세요'}
            </div>
            <p className={styles.explanation}>
              {currentRound.explanation ?? (isCorrect ? '순서를 올바르게 맞추었어요.' : '카드를 끌어 올바른 순서로 다시 맞춰 보세요.')}
            </p>
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

function MatchPlay({
  country,
  config,
  onBack,
}: {
  country: Country;
  config: MatchConfig;
  onBack: () => void;
}) {
  const [leftSelected, setLeftSelected] = useState<number | null>(null);
  const [rightSelected, setRightSelected] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [checked, setChecked] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const leftDotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rightDotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; correct?: boolean }>>([]);
  const [gridSize, setGridSize] = useState({ w: 0, h: 0 });

  function setMatchNoDuplicate(leftIdx: number, rightIdx: number) {
    setMatches((prev) => {
      const next = new Map(prev);
      next.delete(leftIdx);
      next.forEach((r, l) => { if (r === rightIdx) next.delete(l); });
      next.set(leftIdx, rightIdx);
      return next;
    });
  }

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const updateSize = () => {
      const grid = el.getBoundingClientRect();
      setGridSize({ w: grid.width, h: grid.height });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [config.pairs.length]);

  useEffect(() => {
    if (matches.size === 0 || !gridRef.current) {
      setLines([]);
      return;
    }
    const grid = gridRef.current.getBoundingClientRect();
    const newLines: Array<{ x1: number; y1: number; x2: number; y2: number; correct?: boolean }> = [];
    matches.forEach((rightIdx, leftIdx) => {
      const leftEl = leftDotsRef.current[leftIdx];
      const rightEl = rightDotsRef.current[rightIdx];
      if (leftEl && rightEl) {
        const l = leftEl.getBoundingClientRect();
        const r = rightEl.getBoundingClientRect();
        const x1 = l.left - grid.left + l.width / 2;
        const y1 = l.top - grid.top + l.height / 2;
        const x2 = r.left - grid.left + r.width / 2;
        const y2 = r.top - grid.top + r.height / 2;
        const correct = checked ? (config.pairs[leftIdx]?.right === config.pairs[rightIdx]?.right) : undefined;
        newLines.push({ x1, y1, x2, y2, correct });
      }
    });
    setLines(newLines);
  }, [matches, checked, config.pairs]);

  function handleLeftClick(index: number) {
    setChecked(false);
    if (rightSelected !== null) {
      setMatchNoDuplicate(index, rightSelected);
      setLeftSelected(null);
      setRightSelected(null);
    } else {
      setLeftSelected(index);
      setRightSelected(null);
    }
  }

  function handleRightClick(index: number) {
    setChecked(false);
    if (leftSelected !== null) {
      setMatchNoDuplicate(leftSelected, index);
      setLeftSelected(null);
      setRightSelected(null);
    } else {
      setRightSelected(index);
      setLeftSelected(null);
    }
  }

  function isPairCorrect(leftIndex: number, rightIndex: number) {
    const pair = config.pairs[leftIndex];
    const right = config.pairs[rightIndex];
    return pair && right && pair.right === right.right;
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          뒤로
        </button>
        <span className={styles.countryName}>{country.name}</span>
      </header>
      <main className={styles.main}>
        <div className={styles.questionArea}>
          <p className={styles.question}>점을 짝지어 연결해 보세요. (왼쪽 카드 점 → 오른쪽 카드 점)</p>
        </div>
        <div className={styles.matchGrid} ref={gridRef}>
          <div className={styles.matchLinesLayer} aria-hidden>
            <svg className={styles.matchConnectorSvg} viewBox={`0 0 ${gridSize.w || 1} ${gridSize.h || 1}`} preserveAspectRatio="none">
              {lines.map((line, i) => (
                <line
                  key={i}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  className={line.correct === true ? styles.matchLineCorrect : line.correct === false ? styles.matchLineWrong : styles.matchLine}
                />
              ))}
            </svg>
          </div>
          <div className={styles.matchColumn}>
            {config.pairs.map((p, index) => {
              const isSelected = leftSelected === index;
              const matchedRight = matches.get(index);
              const isCorrect = checked && matchedRight !== undefined && isPairCorrect(index, matchedRight);
              const isWrong = checked && matchedRight !== undefined && !isCorrect;
              return (
                <div key={`L-${p.left}-${index}`} className={styles.matchCardWrap}>
                  <button
                    type="button"
                    className={styles.matchItem}
                    data-selected={isSelected || undefined}
                    data-correct={isCorrect || undefined}
                    data-wrong={isWrong || undefined}
                    onClick={() => handleLeftClick(index)}
                  >
                    {p.left}
                  </button>
                  <span
                    role="button"
                    tabIndex={0}
                    className={styles.matchDot}
                    ref={(el) => { leftDotsRef.current[index] = el; }}
                    aria-label={`${p.left} 연결`}
                    onClick={() => handleLeftClick(index)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLeftClick(index); } }}
                  />
                </div>
              );
            })}
          </div>
          <div className={styles.matchConnector} />
          <div className={styles.matchColumn}>
            {config.pairs.map((p, index) => {
              const matchedLeft = Array.from(matches.entries()).find(([, r]) => r === index)?.[0];
              const isSelected = rightSelected === index;
              const isCorrect =
                checked && matchedLeft !== undefined && isPairCorrect(matchedLeft, index);
              const isWrong = checked && matchedLeft !== undefined && !isCorrect;
              return (
                <div key={`R-${p.right}-${index}`} className={styles.matchCardWrapRight} data-selected={isSelected || undefined}>
                  <span
                    role="button"
                    tabIndex={0}
                    className={styles.matchDot}
                    ref={(el) => { rightDotsRef.current[index] = el; }}
                    aria-label={`${p.right} 연결`}
                    onClick={() => handleRightClick(index)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRightClick(index); } }}
                  />
                  <button
                    type="button"
                    className={styles.matchItem}
                    data-selected={isSelected || undefined}
                    data-correct={isCorrect || undefined}
                    data-wrong={isWrong || undefined}
                    onClick={() => handleRightClick(index)}
                  >
                    {p.right}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.resultArea}>
          {!checked ? (
            <button
              type="button"
              className={styles.nextButton}
              onClick={() => setChecked(true)}
            >
              짝 확인하기
            </button>
          ) : (
            <>
              {config.pairs.some((p) => p.explanation) && (
                <div className={styles.explanationList}>
                  {config.pairs.map((p, i) => {
                    if (!p.explanation) return null;
                    const pairCorrect = matches.get(i) !== undefined && isPairCorrect(i, matches.get(i)!);
                    return (
                      <p
                        key={i}
                        className={styles.explanation}
                        data-correct={pairCorrect ? true : undefined}
                        data-wrong={!pairCorrect ? true : undefined}
                      >
                        <span className={styles.explanationPair}>[{p.left} → {p.right}]</span> {p.explanation}
                      </p>
                    );
                  })}
                </div>
              )}
            </>
          )}
          <button type="button" className={styles.backToContentBtn} onClick={onBack}>
            활동 끝내기
          </button>
        </div>
      </main>
    </div>
  );
}

function MatchRoundsPlay({
  country,
  config,
  rounds,
  onBack,
}: {
  country: Country;
  config: MatchRoundsConfig;
  rounds: MatchRound[];
  onBack: () => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [leftSelected, setLeftSelected] = useState<number | null>(null);
  const [rightSelected, setRightSelected] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<number, number>>(new Map());
  const [checked, setChecked] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const leftDotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rightDotsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; correct?: boolean }>>([]);
  const [gridSize, setGridSize] = useState({ w: 0, h: 0 });

  const currentRound = rounds[roundIndex];
  const hasNext = roundIndex < rounds.length - 1;

  function setMatchNoDuplicate(leftIdx: number, rightIdx: number) {
    setMatches((prev) => {
      const next = new Map(prev);
      next.delete(leftIdx);
      next.forEach((r, l) => { if (r === rightIdx) next.delete(l); });
      next.set(leftIdx, rightIdx);
      return next;
    });
  }

  useEffect(() => {
    setLeftSelected(null);
    setRightSelected(null);
    setMatches(new Map());
    setChecked(false);
  }, [roundIndex]);

  useEffect(() => {
    leftDotsRef.current = [];
    rightDotsRef.current = [];
  }, [roundIndex, currentRound?.pairs.length]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el || !currentRound) return;
    const updateSize = () => {
      const grid = el.getBoundingClientRect();
      setGridSize({ w: grid.width, h: grid.height });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [roundIndex, currentRound?.pairs.length]);

  useEffect(() => {
    if (matches.size === 0 || !gridRef.current || !currentRound) {
      setLines([]);
      return;
    }
    const grid = gridRef.current.getBoundingClientRect();
    const pairs = currentRound.pairs;
    const newLines: Array<{ x1: number; y1: number; x2: number; y2: number; correct?: boolean }> = [];
    matches.forEach((rightIdx, leftIdx) => {
      const leftEl = leftDotsRef.current[leftIdx];
      const rightEl = rightDotsRef.current[rightIdx];
      if (leftEl && rightEl) {
        const l = leftEl.getBoundingClientRect();
        const r = rightEl.getBoundingClientRect();
        const x1 = l.left - grid.left + l.width / 2;
        const y1 = l.top - grid.top + l.height / 2;
        const x2 = r.left - grid.left + r.width / 2;
        const y2 = r.top - grid.top + r.height / 2;
        const correct = checked && pairs[leftIdx]?.right === pairs[rightIdx]?.right;
        newLines.push({ x1, y1, x2, y2, correct: checked ? correct : undefined });
      }
    });
    setLines(newLines);
  }, [matches, checked, currentRound]);

  function handleLeftClick(index: number) {
    setChecked(false);
    if (rightSelected !== null) {
      setMatchNoDuplicate(index, rightSelected);
      setLeftSelected(null);
      setRightSelected(null);
    } else {
      setLeftSelected(index);
      setRightSelected(null);
    }
  }

  function handleRightClick(index: number) {
    if (!currentRound) return;
    setChecked(false);
    if (leftSelected !== null) {
      setMatchNoDuplicate(leftSelected, index);
      setLeftSelected(null);
      setRightSelected(null);
    } else {
      setRightSelected(index);
      setLeftSelected(null);
    }
  }

  function isPairCorrect(leftIndex: number, rightIndex: number) {
    const pair = currentRound?.pairs[leftIndex];
    const right = currentRound?.pairs[rightIndex];
    return pair && right && pair.right === right.right;
  }

  function handleNext() {
    setRoundIndex((i) => i + 1);
  }

  if (!currentRound) {
    return (
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <button type="button" className={styles.backBtn} onClick={onBack} aria-label="뒤로">뒤로</button>
          <span className={styles.countryName}>{country.name}</span>
        </header>
        <main className={styles.main}>
          <p className={styles.error}>문제를 불러올 수 없어요.</p>
          <button type="button" className={styles.backToContentBtn} onClick={onBack}>활동 끝내기</button>
        </main>
      </div>
    );
  }

  const pairs = currentRound.pairs;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          뒤로
        </button>
        <span className={styles.countryName}>{country.name}</span>
      </header>
      <main className={styles.main}>
        {!checked ? (
          <>
            <div className={styles.questionArea}>
              <p className={styles.question}>{config.question ?? '점을 짝지어 연결해 보세요. (왼쪽 카드 점 → 오른쪽 카드 점)'}</p>
              <p className={styles.roundIndicator}>문제 {roundIndex + 1} / {rounds.length}</p>
            </div>
            <div className={styles.matchGrid} ref={gridRef}>
              <div className={styles.matchLinesLayer} aria-hidden>
                <svg className={styles.matchConnectorSvg} viewBox={`0 0 ${gridSize.w || 1} ${gridSize.h || 1}`} preserveAspectRatio="none">
                  {lines.map((line, i) => (
                    <line
                      key={i}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      className={line.correct === true ? styles.matchLineCorrect : line.correct === false ? styles.matchLineWrong : styles.matchLine}
                    />
                  ))}
                </svg>
              </div>
              <div className={styles.matchColumn}>
                {pairs.map((p, index) => {
                  const isSelected = leftSelected === index;
                  const matchedRight = matches.get(index);
                  const isCorrect = checked && matchedRight !== undefined && isPairCorrect(index, matchedRight);
                  const isWrong = checked && matchedRight !== undefined && !isCorrect;
                  return (
                    <div key={`L-${roundIndex}-${p.left}-${index}`} className={styles.matchCardWrap}>
                      <button
                        type="button"
                        className={styles.matchItem}
                        data-selected={isSelected || undefined}
                        data-correct={isCorrect || undefined}
                        data-wrong={isWrong || undefined}
                        onClick={() => handleLeftClick(index)}
                      >
                        {p.left}
                      </button>
                      <span
                        role="button"
                        tabIndex={0}
                        className={styles.matchDot}
                        ref={(el) => { leftDotsRef.current[index] = el; }}
                        aria-label={`${p.left} 연결`}
                        onClick={() => handleLeftClick(index)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLeftClick(index); } }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className={styles.matchConnector} />
              <div className={styles.matchColumn}>
                {pairs.map((p, index) => {
                  const matchedLeft = Array.from(matches.entries()).find(([, r]) => r === index)?.[0];
                  const isSelected = rightSelected === index;
                  const isCorrect = checked && matchedLeft !== undefined && isPairCorrect(matchedLeft, index);
                  const isWrong = checked && matchedLeft !== undefined && !isCorrect;
                  return (
                    <div key={`R-${roundIndex}-${p.right}-${index}`} className={styles.matchCardWrapRight} data-selected={isSelected || undefined}>
                      <span
                        role="button"
                        tabIndex={0}
                        className={styles.matchDot}
                        ref={(el) => { rightDotsRef.current[index] = el; }}
                        aria-label={`${p.right} 연결`}
                        onClick={() => handleRightClick(index)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRightClick(index); } }}
                      />
                      <button
                        type="button"
                        className={styles.matchItem}
                        data-selected={isSelected || undefined}
                        data-correct={isCorrect || undefined}
                        data-wrong={isWrong || undefined}
                        onClick={() => handleRightClick(index)}
                      >
                        {p.right}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.resultArea}>
              <button type="button" className={styles.nextButton} onClick={() => setChecked(true)}>
                짝 확인하기
              </button>
              <button type="button" className={styles.backToContentBtn} onClick={onBack}>
                활동 끝내기
              </button>
            </div>
          </>
        ) : (
          <div className={`${styles.resultArea} ${styles.resultAreaFullScreen}`}>
            <div className={styles.resultBadge} data-correct={pairs.every((_, i) => matches.get(i) !== undefined && isPairCorrect(i, matches.get(i)!))}>
              {pairs.every((_, i) => matches.get(i) !== undefined && isPairCorrect(i, matches.get(i)!)) ? '모두 맞았어요!' : '확인해 보세요'}
            </div>
            {pairs.some((p) => p.explanation) && (
              <div className={styles.explanationList}>
                {pairs.map((p, i) => {
                  if (!p.explanation) return null;
                  const pairCorrect = matches.get(i) !== undefined && isPairCorrect(i, matches.get(i)!);
                  return (
                    <p
                      key={i}
                      className={styles.explanation}
                      data-correct={pairCorrect ? true : undefined}
                      data-wrong={!pairCorrect ? true : undefined}
                    >
                      <span className={styles.explanationPair}>[{p.left} → {p.right}]</span> {p.explanation}
                    </p>
                  );
                })}
              </div>
            )}
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

function DragBucketPlay({
  country,
  config,
  onBack,
}: {
  country: Country;
  config: DragBucketConfig;
  onBack: () => void;
}) {
  const [assigned, setAssigned] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    config.items.forEach((item) => {
      initial[item.id] = null;
    });
    return initial;
  });
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function handleDragStart(id: string) {
    setDragItem(id);
    setChecked(false);
  }

  function handleBucketDrop(bucketId: string) {
    if (!dragItem) return;
    setAssigned((prev) => ({
      ...prev,
      [dragItem as string]: bucketId,
    }));
    setDragItem(null);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function isItemCorrect(itemId: string) {
    const target = config.items.find((i) => i.id === itemId);
    if (!target) return false;
    return assigned[itemId] === target.bucketId;
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          뒤로
        </button>
        <span className={styles.countryName}>{country.name}</span>
      </header>
      <main className={styles.main}>
        <div className={styles.questionArea}>
          <p className={styles.question}>{config.question ?? '물건을 끌어 알맞은 통에 넣어 보세요.'}</p>
        </div>
        <div className={styles.dragLayout}>
          <div className={styles.dragItemColumn}>
            {config.items.map((item) => {
              const bucketId = assigned[item.id];
              const placed = bucketId !== null;
              const correct = checked && placed && isItemCorrect(item.id);
              const wrong = checked && placed && !correct;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={styles.dragItem}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  data-placed={placed || undefined}
                  data-correct={correct || undefined}
                  data-wrong={wrong || undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className={styles.bucketColumn}>
            {config.buckets.map((bucket) => (
              <div key={bucket.id} className={styles.bucketWrapper}>
                <div
                  className={styles.bucketDropZone}
                  onDragOver={handleDragOver}
                  onDrop={() => handleBucketDrop(bucket.id)}
                >
                  <span className={styles.bucketLabel}>{bucket.label}</span>
                </div>
                <div className={styles.bucketItems}>
                  {config.items
                    .filter((item) => assigned[item.id] === bucket.id)
                    .map((item) => {
                      const correct = checked && isItemCorrect(item.id);
                      const wrong = checked && !isItemCorrect(item.id);
                      return (
                        <div
                          key={item.id}
                          className={styles.bucketItemBadge}
                          data-correct={correct || undefined}
                          data-wrong={wrong || undefined}
                        >
                          {item.label}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.resultArea}>
          {!checked ? (
            <button
              type="button"
              className={styles.nextButton}
              onClick={() => setChecked(true)}
            >
              정답 확인하기
            </button>
          ) : (
            <>
              <p className={styles.resultHint}>분류 결과를 확인했어요.</p>
              {config.items.some((i) => i.explanation) && (
                <div className={styles.explanationList}>
                  {config.items.map((item) =>
                    item.explanation ? (
                      <p key={item.id} className={styles.explanation}>
                        <span className={styles.explanationPair}>{item.label}</span> {item.explanation}
                      </p>
                    ) : null
                  )}
                </div>
              )}
            </>
          )}
          <button type="button" className={styles.backToContentBtn} onClick={onBack}>
            활동 끝내기
          </button>
        </div>
      </main>
    </div>
  );
}

function DragBucketRoundsPlay({
  country,
  config,
  rounds,
  onBack,
}: {
  country: Country;
  config: DragBucketRoundsConfig;
  rounds: DragBucketRound[];
  onBack: () => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [assigned, setAssigned] = useState<Record<string, string | null>>({});
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const currentRound = rounds[roundIndex];
  const hasNext = roundIndex + 1 < rounds.length;

  // 라운드 전환 시 해당 라운드 물품 assigned 초기화 및 정답 숨김
  useEffect(() => {
    const round = rounds[roundIndex];
    if (!round?.items?.length) return;
    const initial: Record<string, string | null> = {};
    round.items.forEach((item) => {
      initial[item.id] = null;
    });
    setAssigned((prev) => ({ ...prev, ...initial }));
    setChecked(false);
  }, [roundIndex, rounds]);

  function handleDragStart(id: string) {
    setDragItem(id);
    setChecked(false);
  }

  function handleBucketDrop(bucketId: string) {
    if (!dragItem) return;
    setAssigned((prev) => ({ ...prev, [dragItem]: bucketId }));
    setDragItem(null);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function isItemCorrect(itemId: string) {
    const item = currentRound?.items.find((i) => i.id === itemId);
    return item ? assigned[itemId] === item.bucketId : false;
  }

  function handleNext() {
    if (hasNext) {
      setRoundIndex((i) => i + 1);
    }
  }

  if (!currentRound) return null;

  const round = currentRound;
  const allCorrect =
    round.items.length > 0 && round.items.every((item) => isItemCorrect(item.id));

  const correctItems = round.items.filter((item) => isItemCorrect(item.id));
  const wrongItems = round.items.filter(
    (item) => assigned[item.id] != null && assigned[item.id] !== undefined && !isItemCorrect(item.id),
  );
  const unplacedItems = round.items.filter(
    (item) => assigned[item.id] == null || assigned[item.id] === undefined,
  );

  function getItemStatus(item: (typeof round.items)[0]) {
    if (assigned[item.id] == null || assigned[item.id] === undefined) return 'unplaced' as const;
    return isItemCorrect(item.id) ? ('correct' as const) : ('wrong' as const);
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          뒤로
        </button>
        <span className={styles.countryName}>{country.name}</span>
        <span className={styles.progress}>
          {roundIndex + 1} / {rounds.length}
        </span>
      </header>
      <main className={styles.main}>
        {!checked ? (
          <>
            <div className={styles.questionArea}>
              <p className={styles.question}>
                {config.question ?? '물건을 끌어 알맞은 통에 넣어 보세요.'}
              </p>
            </div>
            <div className={styles.dragLayout}>
              <div className={styles.dragItemColumn}>
                {currentRound.items.map((item) => {
                  const bucketId = assigned[item.id];
                  const placed = bucketId !== null && bucketId !== undefined;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.dragItem}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      data-placed={placed || undefined}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div className={styles.bucketColumn}>
                {config.buckets.map((bucket) => (
                  <div key={bucket.id} className={styles.bucketWrapper}>
                    <div
                      className={styles.bucketDropZone}
                      onDragOver={handleDragOver}
                      onDrop={() => handleBucketDrop(bucket.id)}
                    >
                      <span className={styles.bucketLabel}>{bucket.label}</span>
                    </div>
                    <div className={styles.bucketItems}>
                      {currentRound.items
                        .filter((item) => assigned[item.id] === bucket.id)
                        .map((item) => (
                          <div key={item.id} className={styles.bucketItemBadge}>
                            {item.label}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.resultArea}>
              <button
                type="button"
                className={styles.nextButton}
                onClick={() => setChecked(true)}
              >
                정답 확인하기
              </button>
            </div>
          </>
        ) : (
          <div className={`${styles.resultArea} ${styles.resultAreaFullScreen}`}>
            <div className={styles.resultBadge} data-correct={allCorrect}>
              {allCorrect ? '정답이에요!' : '다시 확인해 보세요'}
            </div>
            <p className={styles.resultHint}>분류 결과를 확인했어요.</p>
            <div className={styles.resultSummary}>
              {correctItems.length > 0 && (
                <>
                  <p className={styles.resultSummaryTitle}>정답 항목</p>
                  <div className={styles.resultSummaryItems}>
                    {correctItems.map((item) => (
                      <span
                        key={item.id}
                        className={`${styles.resultSummaryItem} ${styles.resultSummaryItemCorrect}`}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {wrongItems.length > 0 && (
                <>
                  <p className={styles.resultSummaryTitle}>틀린 항목</p>
                  <div className={styles.resultSummaryItems}>
                    {wrongItems.map((item) => (
                      <span
                        key={item.id}
                        className={`${styles.resultSummaryItem} ${styles.resultSummaryItemWrong}`}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {unplacedItems.length > 0 && (
                <>
                  <p className={styles.resultSummaryTitle}>드래그 안 한 항목</p>
                  <div className={styles.resultSummaryItems}>
                    {unplacedItems.map((item) => (
                      <span
                        key={item.id}
                        className={`${styles.resultSummaryItem} ${styles.resultSummaryItemUnplaced}`}
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
            {(round.explanation || round.items.some((i) => i.explanation)) && (
              <div className={styles.explanationList}>
                {round.explanation && (
                  <p className={styles.explanation}>{round.explanation}</p>
                )}
                {round.items.map((item) => {
                  const status = getItemStatus(item);
                  if (!item.explanation) return null;
                  return (
                    <p
                      key={item.id}
                      className={styles.explanation}
                      data-correct={status === 'correct' ? true : undefined}
                      data-wrong={status === 'wrong' || status === 'unplaced' ? true : undefined}
                    >
                      <span className={styles.explanationPair}>{item.label}</span>{' '}
                      {item.explanation}
                    </p>
                  );
                })}
              </div>
            )}
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
          <div className={`${styles.resultArea} ${styles.resultAreaFullScreen}`}>
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
