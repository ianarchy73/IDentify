import { useEffect, useState } from 'react';
import { IconLogo } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [verificationCode, setVerificationCode] = useState('');
  const [facebookError, setFacebookError] = useState<string | null>(null);
  
  const { loginWithEmail, loginWithFacebook, verifyEmail, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!appId || window.FB) {
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: true,
        version: 'v21.0',
      });
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    document.body.appendChild(script);
  }, []);

  const handleEmailLogin = async () => {
    if (!email) {
      return;
    }
    clearError();
    await loginWithEmail(email);
    setStep('verify');
  };

  const handleFacebookLogin = async () => {
    clearError();
    setFacebookError(null);

    if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
      setFacebookError('Facebook login is not configured. Add VITE_FACEBOOK_APP_ID to .env.');
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

  const handleEmailVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      return;
    }
    clearError();
    await verifyEmail(email, verificationCode);
    if (!error) {
      onLogin();
    }
  };

  return (
    <div className="login">
      <div className="loginbox">
        <div className="brand">
          <IconLogo size={26} className="brand-logo" />
          <span><b>ID</b>entify</span>
        </div>

        {step === 'login' ? (
          <>
            <h1>Protect your digital identity.</h1>
            <p>
              Detect potential impersonation, preserve evidence, and prepare a
              response from one place.
            </p>

            {(error || facebookError) && (
              <div style={{ color: '#dc2626', marginBottom: 16, fontSize: 14 }}>
                {error || facebookError}
              </div>
            )}

            <button
              type="button"
              className="btn primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={handleFacebookLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Continue with Facebook'}
            </button>

            <div className="sep">OR</div>

            <input
              className="input"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
              disabled={isLoading}
            />

            <button
              type="button"
              className="btn"
              style={{ width: '100%', marginTop: 10 }}
              onClick={handleEmailLogin}
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Sign in'}
            </button>

            <p style={{ fontSize: 11, marginTop: 18 }}>
              Continue securely with your Facebook account.
            </p>
          </>
        ) : (
          <>
            <h1>Verify Your Email</h1>
            <p>
              We've sent a verification code to <strong>{email}</strong>. 
              Enter the 6-digit code below.
            </p>

            {error && <div style={{ color: '#dc2626', marginBottom: 16, fontSize: 14 }}>{error}</div>}

            <input
              className="input"
              placeholder="000000"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailVerification()}
              disabled={isLoading}
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: 8, fontSize: 20 }}
            />

            <button
              type="button"
              className="btn primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={handleEmailVerification}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              className="btn"
              style={{ width: '100%', marginTop: 10, background: 'transparent' }}
              onClick={() => {
                setStep('login');
                setVerificationCode('');
                clearError();
              }}
              disabled={isLoading}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
