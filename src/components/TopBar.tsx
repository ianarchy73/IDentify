import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const displayName = user?.name || user?.email?.split('@')[0] || 'Account';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <header className="top">
      <h2>{title}</h2>
      <div className="profile" ref={profileRef}>
        <button
          type="button"
          className="profile-trigger"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={`Open profile menu for ${displayName}`}
          onClick={() => setIsOpen((open) => !open)}
        >
          <div className="avatar">{initials || 'A'}</div>
        </button>
        {isOpen && (
          <div className="profile-menu" role="menu">
            <div className="profile-menu-user">
              <strong>{displayName}</strong>
              {user?.email && <span>{user.email}</span>}
            </div>
            <button
              type="button"
              className="profile-menu-item"
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? 'Signing out...' : 'Log out'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
