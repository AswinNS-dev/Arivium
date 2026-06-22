import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signUp, getGoogleOAuthUrl } from '../../services/authApi';
import styles from './Auth.module.css';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signUp(name, email, password);
      navigate('/onboarding');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <span className={styles.authLogo}>Arivium</span>
          <h1 className={styles.authTitle}>Create an account</h1>
          <p className={styles.authSubtitle}>Start your journey to becoming job-ready.</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSignup}>
          <Input 
            label="Full Name"
            type="text" 
            placeholder="John Doe" 
            leftIcon={<User size={18} />}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required 
          />

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
            placeholder="Create a strong password" 
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

          {error && <p className={styles.authError}>{error}</p>}

          <Button type="submit" variant="primary" isLoading={isLoading} className={styles.fullWidthButton}>
            Sign Up
          </Button>

          <div className={styles.divider}>or</div>

          <Button 
            type="button" 
            variant="outline" 
            className={styles.fullWidthButton}
            onClick={() => window.location.href = getGoogleOAuthUrl()}
          >
            <svg style={{ marginRight: '8px' }} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </form>

        <div className={styles.authFooter}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
