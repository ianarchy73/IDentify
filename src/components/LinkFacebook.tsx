import { useEffect, useState } from 'react';
import { IconLogo } from './icons';
import { useAuth } from '../contexts/AuthContext';

export default function LinkFacebook() {
  const [error, setError] = useState<string | null>(null);
  const { user, linkFacebook, isLoading } = useAuth();

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

  const handleLink = () => {
    setError(null);
    if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
      setError('Facebook linking is not configured.');
      return;
    }
    if (!window.FB) {
      setError('Facebook login is still loading. Please try again.');
      return;
    }

    window.FB.login((response) => {
      if (response.status !== 'connected' || !response.authResponse) {
        setError('Facebook linking was cancelled or denied.');
        return;
      }
      const { accessToken, userID } = response.authResponse;
      window.FB?.api('/me', { fields: 'id,name,email' }, (profile) => {
        void linkFacebook(accessToken, userID, profile.email, profile.name);
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
        <h1>Link your Facebook account.</h1>
        <p>
          Connect Facebook to activate identity protection and access your dashboard.
        </p>
        {error && <div style={{ color: '#dc2626', marginBottom: 16, fontSize: 14 }}>{error}</div>}
        <button type="button" className="btn primary" style={{ width: '100%', marginTop: 16 }} onClick={handleLink} disabled={isLoading}>
          {isLoading ? 'Linking...' : 'Link Facebook account'}
        </button>
        <p style={{ fontSize: 11, marginTop: 18 }}>
          Signed in as {user?.email}. Your account will not access features until Facebook is linked.
        </p>
      </div>
    </div>
  );
}
