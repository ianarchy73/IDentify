import { useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Toast from './components/toast/Toast';
import { ToastProvider } from './components/toast/ToastContext';
import IdentityVerification from './components/verification/IdentityVerification';
import Dashboard from './View/Dashboard';
import Investigation from './View/Investigation';
import ImageCheck from './View/ImageCheck';
import Monitoring from './View/Monitoring';
import Cases from './View/Cases';
import Reports from './View/Reports';
import Settings from './View/Settings';
import {
  createEmptyIdentityVerification,
  isVerificationOverdue,
  type IdentityVerificationState,
  type Screen,
} from './types';
import './App.css';

type Stage = 'login' | 'verify' | 'app';

const TITLES: Record<Screen, string> = {
  dashboard: 'Dashboard',
  investigate: 'Investigate',
  image: 'Image Check',
  monitoring: 'Monitoring',
  cases: 'Cases',
  reports: 'Reports',
  settings: 'Settings',
};

function AppShell() {
  const [stage, setStage] = useState<Stage>('login');
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [identity, setIdentity] = useState<IdentityVerificationState>(
    createEmptyIdentityVerification(),
  );

  if (stage === 'login') {
    return <Login onLogin={() => setStage('verify')} />;
  }

  if (stage === 'verify') {
    return (
      <IdentityVerification
        isRenewal={identity.status === 'verified'}
        initial={identity}
        onVerified={(next) => {
          setIdentity(next);
          setStage('app');
        }}
      />
    );
  }

  // Monthly re-check: even mid-session, an expired verification drops the
  // user back into the verification flow instead of the app. This is what
  // limits how long a hijacked account/extension session stays trusted.
  if (isVerificationOverdue(identity)) {
    return (
      <IdentityVerification
        isRenewal
        initial={identity}
        onVerified={(next) => {
          setIdentity(next);
          setStage('app');
        }}
      />
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <Dashboard onNavigate={setScreen} />;
      case 'investigate':
        return <Investigation onNavigate={setScreen} />;
      case 'image':
        return <ImageCheck />;
      case 'monitoring':
        return <Monitoring />;
      case 'cases':
        return <Cases onNavigate={setScreen} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return (
          <Settings
            identity={identity}
            onRequestReverify={() => setStage('verify')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Sidebar active={screen} onNavigate={setScreen} />
      <main className="main">
        <TopBar title={TITLES[screen]} />
        <div className="page">{renderScreen()}</div>
      </main>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}