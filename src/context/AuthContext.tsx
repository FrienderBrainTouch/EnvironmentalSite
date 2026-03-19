import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { MOCK_PASSWORD } from '../config';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_EXPIRES_AT_KEY = 'demo_auth_expires_at';
const AUTH_TTL_MS = 6 * 60 * 60 * 1000;

function readExpiresAt(): number {
  try {
    const raw = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeExpiresAt(expiresAt: number) {
  try {
    localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
  } catch {
    // ignore
  }
}

function clearExpiresAt() {
  try {
    localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => readExpiresAt() > Date.now());
  const logoutTimerRef = useRef<number | null>(null);

  const login = useCallback((password: string) => {
    if (password === MOCK_PASSWORD) {
      writeExpiresAt(Date.now() + AUTH_TTL_MS);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    clearExpiresAt();
    setIsLoggedIn(false);
  }, []);

  // 선택 사항: 앱을 켜 둔 상태에서도 만료되면 자동 로그아웃
  useEffect(() => {
    if (logoutTimerRef.current != null) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (!isLoggedIn) {
      const expiresAt = readExpiresAt();
      if (expiresAt && expiresAt <= Date.now()) clearExpiresAt();
      return;
    }

    const expiresAt = readExpiresAt();
    const remaining = expiresAt - Date.now();
    if (!expiresAt || remaining <= 0) {
      logout();
      return;
    }

    logoutTimerRef.current = window.setTimeout(() => {
      logout();
    }, remaining);

    return () => {
      if (logoutTimerRef.current != null) {
        window.clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [isLoggedIn, logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
