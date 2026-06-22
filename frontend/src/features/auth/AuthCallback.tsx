import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { me, setAuthSession } from '../../services/authApi';
import styles from './Auth.module.css';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleCallback() {
      try {
        const hash = window.location.hash;
        if (!hash) {
          throw new Error('No authentication data found in URL');
        }

        const params = new URLSearchParams(hash.replace(/^#/, '?'));
        const accessToken = params.get('access_token');

        if (!accessToken) {
          throw new Error('Access token not found in callback URL');
        }

        // Set the token temporarily in localStorage so the 'me()' request uses it
        localStorage.setItem('arivium:authToken', accessToken);
        
        // Fetch user profile from the backend
        const user = await me();
        
        // Save the full session in authState and localStorage
        setAuthSession(accessToken, user);

        navigate('/app/dashboard');
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <span className={styles.authLogo}>Arivium</span>
          <h1 className={styles.authTitle}>Authenticating...</h1>
          <p className={styles.authSubtitle}>Please wait while we log you in.</p>
        </div>
        {error ? (
          <div className={styles.authError} style={{ marginTop: '20px' }}>
            {error}
            <button 
              onClick={() => navigate('/login')} 
              style={{
                display: 'block',
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--color-border)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
export default AuthCallback;
