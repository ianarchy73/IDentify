import { useState } from 'react';
import { useToast } from '../components/toast/ToastContext';

export default function Settings() {
  const showToast = useToast();
  const [name, setName] = useState('Ian Florida');
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [evidenceTimestamps, setEvidenceTimestamps] = useState(true);

  return (
    <section id="settings" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Settings</h1>
          <div className="sub">
            Manage your identity profile and protection preferences.
          </div>
        </div>
      </div>

      <div className="card formcard">
        <h3 style={{ marginTop: 0 }}>Identity profile</h3>
        <div className="row">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Connected account</label>
            <input
              className="input"
              value="Facebook · Connected (prototype)"
              readOnly
            />
          </div>
        </div>

        <h3 style={{ marginTop: 25 }}>Protection</h3>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0' }}>
          <input
            type="checkbox"
            checked={monitoringEnabled}
            onChange={(e) => setMonitoringEnabled(e.target.checked)}
          />
          Monitoring enabled
        </label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0' }}>
          <input
            type="checkbox"
            checked={evidenceTimestamps}
            onChange={(e) => setEvidenceTimestamps(e.target.checked)}
          />
          Evidence timestamps
        </label>

        <button className="btn primary" onClick={() => showToast('Settings saved')}>
          Save changes
        </button>
      </div>
    </section>
  );
}
