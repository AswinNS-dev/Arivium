import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken, me, restoreAuthState } from '../../services/authApi';
import { useAuthStore } from '../../store/authStore';
import styles from './RequireAuth.module.css';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const restore = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      restoreAuthState();

      try {
        await me();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    restore();
  }, []);

  if (isChecking) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
