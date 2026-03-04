import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import CountryList from './pages/CountryList';
import CountryActivityList from './pages/CountryActivityList';
import ActivityPlay from './pages/ActivityPlay';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/countries"
        element={
          <ProtectedRoute>
            <CountryList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/countries/:countryId"
        element={
          <ProtectedRoute>
            <CountryActivityList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/countries/:countryId/activity/:activityType"
        element={
          <ProtectedRoute>
            <ActivityPlay />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
