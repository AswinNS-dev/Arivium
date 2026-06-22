import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signUp } from '../../services/authApi';
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
        </form>

        <div className={styles.authFooter}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
