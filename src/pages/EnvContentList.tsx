import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Country } from '../types/data';
import styles from './EnvContentList.module.css';

export default function EnvContentList() {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/contents.json')
      .then((r) => r.json())
      .then((data: Country[]) => {
        setContents(data);
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
        <p className={styles.subtitle}>체험할 환경과학 VR 활동을 선택해 보세요</p>
      </header>
      <section className={styles.section} aria-label="콘텐츠 목록">
        <div className={styles.grid} role="list">
          {contents.map((content) => (
            <button
              key={content.id}
              type="button"
              className={styles.card}
              onClick={() => navigate(`/contents/${content.id}`)}
              aria-label={`${content.name} 활동 보기`}
              role="listitem"
            >
              <div className={styles.cover} style={{ background: content.coverColor }}>
                <span className={styles.coverTitle}>{content.name}</span>
                <span className={styles.coverCity}>{content.city}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

