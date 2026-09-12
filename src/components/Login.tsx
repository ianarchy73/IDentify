import { useState } from 'react';
import { IconLogo } from './icons';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');

  return (
    <div className="login">
      <div className="loginbox">
        <div className="brand">
          <IconLogo size={26} className="brand-logo" />
          <span><b>ID</b>entify</span>
        </div>
        <h1>Protect your digital identity.</h1>
        <p>
          Detect potential impersonation, preserve evidence, and prepare a
          response from one place.
        </p>
        <button
          type="button"
          className="btn primary"
          style={{ width: '100%', marginTop: 16 }}
          onClick={onLogin}
        >
          Continue with Facebook
        </button>
        <div className="sep">OR</div>
        <input
          className="input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="button"
          className="btn"
          style={{ width: '100%', marginTop: 10 }}
          onClick={onLogin}
        >
          Sign in
        </button>
        <p style={{ fontSize: 11, marginTop: 18 }}>
          Prototype only. No real Facebook account connection occurs.
        </p>
      </div>
    </div>
  );
}
