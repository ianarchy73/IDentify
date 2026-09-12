import {
  IconInvestigate,
  IconImageCheck,
  IconCases,
  IconReports,
} from '../components/icons';
import { useAuth } from '../contexts/AuthContext';
import type { Screen } from '../types';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const displayName = user?.name || user?.email.split('@')[0] || 'there';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const providerLabel = user?.loginProvider === 'facebook' ? 'Facebook account' : 'Email account';

  return (
    <section id="dashboard" className="screen active">
      <div className="welcome">
        <h1>Good evening, {displayName}.</h1>
        <p>Here's the current status of your digital identity.</p>
      </div>

      <div className="card identity">
        <div className="idleft">
          <div className="bigavatar">{initials}</div>
          <div>
            <div className="idname">{displayName}</div>
            <div className="small">{providerLabel}</div>
            <div className="verified">
              <span className="dot"></span>Identity profile established
            </div>
          </div>
        </div>
        <button className="btn primary" onClick={() => onNavigate('settings')}>
          Manage Identity
        </button>
      </div>

      <div className="stats">
        <div className="card stat stat-danger">
          <div className="stat-top">
            <label>Active Threats</label>
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9v4m0 3.5h.01M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.6 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <strong className="red">2</strong>
          <div className="small">Requires attention</div>
        </div>

        <div className="card stat stat-brand">
          <div className="stat-top">
            <label>Open Cases</label>
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <strong>1</strong>
          <div className="small">1 investigation active</div>
        </div>

        <div className="card stat stat-brand">
          <div className="stat-top">
            <label>Images Analyzed</label>
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="m4 16 4.5-4.5a1 1 0 0 1 1.4 0L14 15.5m2-2 1.3-1.3a1 1 0 0 1 1.4 0L21 14.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" />
              </svg>
            </span>
          </div>
          <strong>14</strong>
          <div className="small">This month</div>
        </div>

        <div className="card stat stat-brand">
          <div className="stat-top">
            <label>Protection Status</label>
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3 4.5 5.5v6c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5v-6L12 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <strong className="blue-text">Active</strong>
          <div className="small">Monitoring enabled</div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="head">
            <h3>Recent investigations</h3>
            <span className="link" onClick={() => onNavigate('cases')}>
              View all
            </span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Risk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3}>
                  <div className="empty-state">
                    <strong>No investigations yet</strong>
                    <span>Start by investigating a suspicious profile.</span>
                    <button className="btn" onClick={() => onNavigate('investigate')}>
                      Start investigation
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="head">
            <h3>Quick actions</h3>
          </div>
          <div className="actions">
            <div className="action" onClick={() => onNavigate('investigate')}>
              <div className="abox">
                <IconInvestigate size={16} />
              </div>
              <div>
                <b>Investigate a profile</b>
                <p>Analyze a suspected Facebook account.</p>
              </div>
            </div>
            <div className="action" onClick={() => onNavigate('image')}>
              <div className="abox">
                <IconImageCheck size={16} />
              </div>
              <div>
                <b>Analyze an image</b>
                <p>Check an image for manipulation indicators.</p>
              </div>
            </div>
            <div className="action" onClick={() => onNavigate('cases')}>
              <div className="abox">
                <IconCases size={16} />
              </div>
              <div>
                <b>Open a case</b>
                <p>Review evidence and investigation history.</p>
              </div>
            </div>
            <div className="action" onClick={() => onNavigate('reports')}>
              <div className="abox">
                <IconReports size={16} />
              </div>
              <div>
                <b>Prepare a report</b>
                <p>Create an evidence-backed report draft.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="notice">
        <b>Protection is active.</b> Detection results are risk indicators and
        should be reviewed before taking action.
      </div>
    </section>
  );
}
