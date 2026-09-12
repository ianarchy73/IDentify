import { useToast } from '../components/toast/ToastContext';
import type { RiskLevel } from '../types';

interface MonitoredTarget {
  id: number;
  name: string;
  url: string;
  lastChecked: string;
  risk: RiskLevel;
  label: string;
}

const MONITORED_TARGETS: MonitoredTarget[] = [
  {
    id: 1,
    name: 'example.profile',
    url: 'facebook.com/example.profile',
    lastChecked: 'Today, 8:12 PM',
    risk: 'high',
    label: 'HIGH',
  },
  {
    id: 2,
    name: 'sample.account',
    url: 'facebook.com/sample.account',
    lastChecked: 'Yesterday',
    risk: 'medium',
    label: 'REVIEW',
  },
];

export default function Monitoring() {
  const showToast = useToast();

  return (
    <section id="monitoring" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Monitoring</h1>
          <div className="sub">
            Track known or previously reported identity threats.
          </div>
        </div>
        <button
          className="btn primary"
          onClick={() => showToast('Monitoring check queued')}
        >
          Run check
        </button>
      </div>

      <div className="card">
        <div className="head">
          <h3>Monitored threats</h3>
          <span className="badge resolved">ACTIVE</span>
        </div>
        <table className="table">
          <tbody>
            <tr>
              <th>Target</th>
              <th>Last checked</th>
              <th>Status</th>
            </tr>
            {MONITORED_TARGETS.map((t) => (
              <tr key={t.id} className="clickable">
                <td>
                  <b>{t.name}</b>
                  <div className="url">{t.url}</div>
                </td>
                <td>{t.lastChecked}</td>
                <td>
                  <span className={`badge ${t.risk}`}>{t.label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="notice">
        Monitoring in this prototype represents user-submitted or known
        targets. It does not crawl the entire Facebook platform.
      </div>
    </section>
  );
}
