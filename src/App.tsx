import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import EnvContentList from './pages/EnvContentList';
import EnvContentActivityList from './pages/EnvContentActivityList';
import ActivityPlay from './pages/ActivityPlay';
import AppLayout from './components/AppLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/login" element={<Login />} />
        <Route
          path="/contents"
          element={
            <ProtectedRoute>
              <EnvContentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contents/:countryId"
          element={
            <ProtectedRoute>
              <EnvContentActivityList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contents/:countryId/activity/:activityType"
          element={
            <ProtectedRoute>
              <ActivityPlay />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
}
