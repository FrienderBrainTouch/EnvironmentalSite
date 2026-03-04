import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Country } from '../types/data';
import styles from './CountryList.module.css';

export default function CountryList() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/countries.json')
      .then((r) => r.json())
      .then((data: Country[]) => {
        setCountries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.loading}>잠시만 기다려 주세요...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>환경과학 VR 콘텐츠</h1>
        <p className={styles.subtitle}>체험할 콘텐츠를 선택해 보세요</p>
      </header>
      <section className={styles.section} aria-label="콘텐츠 목록">
        <div className={styles.grid} role="list">
          {countries.map((country) => (
            <button
              key={country.id}
              type="button"
              className={styles.card}
              onClick={() => navigate(`/countries/${country.id}`)}
              aria-label={`${country.name} 활동 보기`}
              role="listitem"
            >
              <div className={styles.cover} style={{ background: country.coverColor }}>
                <span className={styles.coverTitle}>{country.name}</span>
                <span className={styles.coverCity}>{country.city}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
