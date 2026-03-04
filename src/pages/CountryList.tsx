import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Country } from '../types/data';
import { getFlagUrl, getFlagCdnUrl } from '../utils/flagUrl';
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
        <h1 className={styles.title}>나라를 골라 보세요</h1>
        <p className={styles.subtitle}>나라를 누르면 활동 목록을 볼 수 있어요</p>
      </header>
      <section className={styles.section} aria-label="나라 목록">
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
                {country.flagCode ? (
                  <img
                    src={getFlagUrl(country.flagCode, 160)}
                    alt=""
                    className={styles.coverFlag}
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (el) el.src = getFlagCdnUrl(country.flagCode!, 160);
                    }}
                  />
                ) : null}
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
