import { useToast } from '../components/toast/ToastContext';
import type { InvestigationRecord, RiskLevel } from '../types';

interface MonitoredTarget {
  id: string;
  name: string;
  url: string;
  lastChecked: string;
  risk: RiskLevel;
  label: string;
}

interface MonitoringProps {
  investigations: InvestigationRecord[];
}

const MONITORED_TARGETS: MonitoredTarget[] = [
  {
    id: '1',
    name: 'example.profile',
    url: 'facebook.com/example.profile',
    lastChecked: 'Today, 8:12 PM',
    risk: 'high',
    label: 'HIGH',
  },
  {
    id: '2',
    name: 'sample.account',
    url: 'facebook.com/sample.account',
    lastChecked: 'Yesterday',
    risk: 'medium',
    label: 'MEDIUM',
  },
];

export default function Monitoring({ investigations }: MonitoringProps) {
  const showToast = useToast();
  const monitoredTargets = [
    ...MONITORED_TARGETS,
    ...investigations.map((record) => ({
      id: record.id,
      name: record.caseLabel,
      url: record.profileUrl,
      lastChecked: new Date(record.analyzedAt).toLocaleString(),
      risk: record.risk,
      label: record.riskLabel,
    })),
  ];

  return (
    <section id="monitoring" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Monitoring</h1>
          <div className="sub">
            Re-check profiles you've already flagged, so you don't have to
            manually revisit each one.
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
          <h3>Monitored profiles</h3>
          <span className="badge resolved">ACTIVE</span>
        </div>
        <table className="table">
          <tbody>
            <tr>
              <th>Suspected profile</th>
              <th>Last checked</th>
              <th>Risk level</th>
            </tr>
            {monitoredTargets.map((t) => (
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
        Monitoring only re-checks profiles you've submitted or previously
        flagged as suspicious. It does not crawl or scan Facebook at large.
      </div>
    </section>
  );
}