import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Country } from '../types/data';
import { ACTIVITY_LIST } from '../types/data';
import styles from './CountryActivityList.module.css';

export default function CountryActivityList() {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/countries.json')
      .then((r) => r.json())
      .then((data: Country[]) => {
        const found = data.find((c) => c.id === countryId);
        setCountry(found ?? null);
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

  if (!country) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.error}>콘텐츠를 찾을 수 없어요.</p>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/countries')}
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
          onClick={() => navigate('/countries')}
          aria-label="콘텐츠 목록으로 돌아가기"
        >
          뒤로
        </button>
        <div
          className={styles.banner}
          style={{ background: country.coverColor }}
        >
          <h1 className={styles.title}>{country.name}</h1>
          <p className={styles.city}>{country.city}</p>
        </div>
        <p className={styles.subtitle}>아래에서 활동을 골라 보세요!</p>
      </header>
      <main className={styles.grid}>
        {ACTIVITY_LIST.map((item) => {
          return (
            <button
              key={item.type}
              type="button"
              className={styles.card}
              onClick={() =>
                countryId && navigate(`/countries/${countryId}/activity/${item.type}`)
              }
            >
              <span className={styles.cardIcon} data-type={item.type} aria-hidden />
              <span className={styles.cardLabel}>{item.label}</span>
              <span className={styles.cardSub}>{item.subLabel}</span>
            </button>
          );
        })}
      </main>
    </div>
  );
}
