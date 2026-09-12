import { useEffect, useState } from 'react';
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
  const [facebookError, setFacebookError] = useState<string | null>(null);
  const { loginWithEmail, signupWithEmail, loginWithFacebook, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId || window.FB) return;

    window.fbAsyncInit = () => {
      window.FB?.init({ appId, cookie: true, xfbml: true, version: 'v21.0' });
    };
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    document.body.appendChild(script);
  }, []);

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setName('');
    setPassword('');
    clearError();
    setFacebookError(null);
  };

  const handleEmailSubmit = async () => {
    clearError();
    if (mode === 'signup') {
      await signupWithEmail(name, email, password);
    } else {
      await loginWithEmail(email, password);
    }
  };

  const handleFacebookLogin = () => {
    clearError();
    setFacebookError(null);
    if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
      setFacebookError('Facebook login is not configured.');
      return;
    }
    if (!window.FB) {
      setFacebookError('Facebook login is still loading. Please try again.');
      return;
    }

    window.FB.login((response) => {
      if (response.status !== 'connected' || !response.authResponse) {
        setFacebookError('Facebook login was cancelled or denied.');
        return;
      }
      const { accessToken, userID } = response.authResponse;
      window.FB?.api('/me', { fields: 'id,name,email' }, (profile) => {
        void loginWithFacebook(accessToken, userID, profile.email, profile.name);
      });
    }, { scope: 'public_profile,email', auth_type: 'reauthorize' });
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

        {(error || facebookError) && (
          <div style={{ color: '#dc2626', marginBottom: 16, fontSize: 14 }}>
            {error || facebookError}
          </div>
        )}

        {mode === 'login' && (
          <button type="button" className="btn primary" style={{ width: '100%', marginTop: 16 }} onClick={handleFacebookLogin} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Continue with Facebook'}
          </button>
        )}

        {mode === 'login' && <div className="sep">OR</div>}

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
