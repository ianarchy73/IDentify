import { useState } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Toast from './components/toast/Toast';
import { ToastProvider } from './components/toast/ToastContext';
import Dashboard from './View/Dashboard';
import Investigation from './View/Investigation';
import ImageCheck from './View/ImageCheck';
import Monitoring from './View/Monitoring';
import Cases from './View/Cases';
import Reports from './View/Reports';
import Settings from './View/Settings';
import type { Screen } from './types';
import './App.css';

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
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState<Screen>('dashboard');

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
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
        return <Settings />;
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
