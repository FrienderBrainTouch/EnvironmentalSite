import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Country } from '../types/data';
import type { ActivityType } from '../types/data';
import { getActivityDisplay, getActivityOrder } from '../config';
import styles from './EnvContentActivityList.module.css';

export default function EnvContentActivityList() {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/contents.json')
      .then((r) => r.json())
      .then((data: Country[]) => {
        const found = data.find((c) => c.id === countryId);
        setContent(found ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [countryId]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.loading}>잠시만 기다려 주세요...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.error}>콘텐츠를 찾을 수 없어요.</p>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/contents')}
        >
          뒤로
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/contents')}
          aria-label="콘텐츠 목록으로 돌아가기"
        >
          뒤로
        </button>
        <div
          className={styles.banner}
          style={{ background: content.coverColor }}
        >
          <h1 className={styles.title}>{content.name}</h1>
          <p className={styles.city}>{content.city}</p>
        </div>
        <p className={styles.subtitle}>아래에서 활동을 골라 보세요!</p>
      </header>
      <main className={styles.grid}>
        {getActivityOrder(countryId ?? undefined).map((activityType: ActivityType) => {
          const display = getActivityDisplay(countryId ?? undefined, activityType);
          return (
            <button
              key={activityType}
              type="button"
              className={styles.card}
              onClick={() =>
                countryId && navigate(`/contents/${countryId}/activity/${activityType}`)
              }
            >
              <span className={styles.cardIcon} data-type={activityType} aria-hidden />
              <span className={styles.cardLabel}>{display?.label ?? activityType}</span>
              <span className={styles.cardSub}>{display?.subLabel ?? ''}</span>
            </button>
          );
        })}
      </main>
    </div>
  );
}

