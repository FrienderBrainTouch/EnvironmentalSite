import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!password.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    if (login(password)) {
      navigate('/countries', { replace: true });
    } else {
      setError('비밀번호가 맞지 않아요. 다시 입력해 주세요.');
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <h1 className={styles.title}>환경 · 세계 나라</h1>
          <p className={styles.subtitle}>나라별 활동을 풀어 보세요</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button}>
            들어가기
          </button>
        </form>
      </div>
    </div>
  );
}
