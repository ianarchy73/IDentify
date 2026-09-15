import { useState } from 'react';
import { IconLogo } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin: _onLogin }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithEmail, loginWithFacebook, signupWithEmail, isLoading, error, clearError } = useAuth();

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setName('');
    setPassword('');
    clearError();
  };

  const handleEmailSubmit = async () => {
    clearError();
    if (mode === 'signup') {
      await signupWithEmail(name, email, password);
    } else {
      await loginWithEmail(email, password);
    }
  };

  return (
    <div className="login">
      <div className="loginbox">
        <div className="brand">
          <IconLogo size={26} className="brand-logo" />
          <span><b>ID</b>entify</span>
        </div>
        <h1>{mode === 'signup' ? 'Create your account.' : 'Protect your digital identity.'}</h1>
        <p>
          {mode === 'signup'
            ? 'Create an account with your email to start protecting your identity.'
            : 'Detect potential impersonation, preserve evidence, and prepare a response from one place.'}
        </p>

        {error && (
          <div style={{ color: '#dc2626', marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {mode === 'login' && <p style={{ marginTop: 16, fontSize: 13 }}>Demo access: demo@identify.app / identify123</p>}

        {mode === 'login' && (
          <>
            <button type="button" className="btn primary" style={{ width: '100%', marginTop: 16 }} onClick={() => void loginWithFacebook()} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Continue with Facebook'}
            </button>
            <div className="sep">OR</div>
          </>
        )}

        {mode === 'signup' && (
          <input className="input" placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} disabled={isLoading} />
        )}
        <input className="input" placeholder="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} />
        <input className="input" style={{ marginTop: 10 }} placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void handleEmailSubmit()} disabled={isLoading} />

        <button type="button" className="btn" style={{ width: '100%', marginTop: 10 }} onClick={handleEmailSubmit} disabled={isLoading || !email || !password || (mode === 'signup' && !name)}>
          {isLoading ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') : (mode === 'signup' ? 'Create account' : 'Sign in')}
        </button>

        <button type="button" className="login-switch" onClick={switchMode} disabled={isLoading}>
          {mode === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </div>
    </div>
  );
}
