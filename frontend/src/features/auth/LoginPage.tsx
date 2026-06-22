import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '../../services/authApi';
import styles from './Auth.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <span className={styles.authLogo}>Arivium</span>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSubtitle}>Enter your details to access your account.</p>
        </div>

        <form className={styles.authForm} onSubmit={handleLogin}>
          <Input 
            label="Email Address"
            type="email" 
            placeholder="you@example.com" 
            leftIcon={<Mail size={18} />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required 
          />
          
          <Input 
            label="Password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            leftIcon={<Lock size={18} />}
            rightIcon={
              <button 
                type="button" 
                className={styles.iconButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required 
          />

          <div className={styles.actionTextRight}>
            <Link to="/forgot-password" className={styles.textLinkRight}>
              Forgot password?
            </Link>
          </div>

          {error && <p className={styles.authError}>{error}</p>}

          <Button type="submit" variant="primary" isLoading={isLoading} className={styles.fullWidthButton}>
            Log In
          </Button>
        </form>

        <div className={styles.authFooter}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
