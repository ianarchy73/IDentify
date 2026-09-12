import { useEffect, useState } from 'react';
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
  type FlaggedImage,
  type IdentityVerificationState,
  type InvestigationRecord,
  type Screen,
} from './types';
import './App.css';

type Stage = 'login' | 'verify' | 'app';

const AUTH_STORAGE_KEY = 'identify-authenticated';
const IDENTITY_STORAGE_KEY = 'identify-identity-verification';
const INVESTIGATIONS_STORAGE_KEY = 'identify-investigations';
const IMAGE_ANALYSES_STORAGE_KEY = 'identify-image-analyses';

function loadIdentity(): IdentityVerificationState {
  try {
    const stored = localStorage.getItem(IDENTITY_STORAGE_KEY);
    return stored ? JSON.parse(stored) as IdentityVerificationState : createEmptyIdentityVerification();
  } catch {
    return createEmptyIdentityVerification();
  }
}

function loadInitialStage(identity: IdentityVerificationState): Stage {
  if (localStorage.getItem(AUTH_STORAGE_KEY) !== 'true') return 'login';
  return identity.status === 'verified' ? 'app' : 'verify';
}

function loadStoredList<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T[] : [];
  } catch {
    return [];
  }
}

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
  const [identity, setIdentity] = useState<IdentityVerificationState>(loadIdentity);
  const [stage, setStage] = useState<Stage>(() => loadInitialStage(identity));
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>(() =>
    loadStoredList<InvestigationRecord>(INVESTIGATIONS_STORAGE_KEY),
  );
  const [imageAnalyses, setImageAnalyses] = useState<FlaggedImage[]>(() =>
    loadStoredList<FlaggedImage>(IMAGE_ANALYSES_STORAGE_KEY),
  );

  useEffect(() => {
    localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
  }, [identity]);

  useEffect(() => {
    localStorage.setItem(INVESTIGATIONS_STORAGE_KEY, JSON.stringify(investigations));
  }, [investigations]);

  useEffect(() => {
    localStorage.setItem(IMAGE_ANALYSES_STORAGE_KEY, JSON.stringify(imageAnalyses));
  }, [imageAnalyses]);

  if (stage === 'login') {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem(AUTH_STORAGE_KEY, 'true');
          setStage('verify');
        }}
      />
    );
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
        return (
          <Investigation
            onNavigate={setScreen}
            onAnalysisRecorded={(record) => setInvestigations((previous) => [record, ...previous])}
          />
        );
      case 'image':
        return (
          <ImageCheck
            savedGallery={imageAnalyses}
            onGalleryChange={setImageAnalyses}
          />
        );
      case 'monitoring':
        return <Monitoring investigations={investigations} />;
      case 'cases':
        return <Cases onNavigate={setScreen} investigations={investigations} imageAnalyses={imageAnalyses} />;
      case 'reports':
        return <Reports investigations={investigations} imageAnalyses={imageAnalyses} />;
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
      <Sidebar
        active={screen}
        onNavigate={setScreen}
        onLogout={() => {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(IDENTITY_STORAGE_KEY);
          localStorage.removeItem(INVESTIGATIONS_STORAGE_KEY);
          localStorage.removeItem(IMAGE_ANALYSES_STORAGE_KEY);
          setIdentity(createEmptyIdentityVerification());
          setInvestigations([]);
          setImageAnalyses([]);
          setScreen('dashboard');
          setStage('login');
        }}
      />
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