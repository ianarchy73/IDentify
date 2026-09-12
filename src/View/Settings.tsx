import { useState } from 'react';
import { useToast } from '../components/toast/ToastContext';
import { NATIONAL_ID_LABELS, VERIFICATION_VALIDITY_DAYS, type IdentityVerificationState } from '../types';

interface SettingsProps {
  identity: IdentityVerificationState;
  onRequestReverify: () => void;
}

export default function Settings({ identity, onRequestReverify }: SettingsProps) {
  const showToast = useToast();
  const [name, setName] = useState('Ian Florida');
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [evidenceTimestamps, setEvidenceTimestamps] = useState(true);

  const statusLabel =
    identity.status === 'verified'
      ? 'Verified'
      : identity.status === 'pending'
      ? 'Verification pending'
      : identity.status === 'expired'
      ? 'Verification expired'
      : 'Not verified';

  const statusBadgeClass = identity.status === 'verified' ? 'resolved' : 'high';

  return (
    <section id="settings" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Settings</h1>
          <div className="sub">
            Manage your established identity and protection preferences.
          </div>
        </div>
      </div>

      <div className="card formcard">
        <h3 style={{ marginTop: 0 }}>Identity verification</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span className={`badge ${statusBadgeClass}`}>{statusLabel}</span>
          {identity.nationalId && (
            <span className="sub">
              {NATIONAL_ID_LABELS[identity.nationalId.idType]} on file
            </span>
          )}
        </div>
        {identity.verifiedAt && (
          <div className="sub">
            Last verified {new Date(identity.verifiedAt).toLocaleDateString()} · next check due{' '}
            {identity.nextDueAt ? new Date(identity.nextDueAt).toLocaleDateString() : '—'}
          </div>
        )}
        <div className="sub" style={{ marginTop: 4 }}>
          This is your established identity — the baseline every suspected profile
          gets compared against. Re-verification is required every{' '}
          {VERIFICATION_VALIDITY_DAYS} days so a hijacked account can't keep using
          the extension as you indefinitely.
        </div>
        <button type="button" className="btn" style={{ marginTop: 14 }} onClick={onRequestReverify}>
          Re-verify now
        </button>
      </div>

      <div className="card formcard" style={{ marginTop: 20 }}>
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