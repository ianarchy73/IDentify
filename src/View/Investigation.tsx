import { useState } from 'react';
import { useToast } from '../components/toast/ToastContext';
import CustomSelect from '../components/modals/Dropdown';
import type { Screen } from '../types';

const REASON_OPTIONS = [
  'Possible impersonation',
  'Unauthorized image use',
  'Suspicious account',
];

interface InvestigationProps {
  onNavigate?: (screen: Screen) => void;
}

export default function Investigation({ onNavigate }: InvestigationProps) {
  const showToast = useToast();
  const [profileUrl, setProfileUrl] = useState('');
  const [reason, setReason] = useState('Possible impersonation');
  const [caseLabel, setCaseLabel] = useState('Possible impersonation');
  const [result, setResult] = useState(false);

  const runInvestigation = () => {
    if (!profileUrl) setProfileUrl('facebook.com/example.profile');
    setResult(true);
    showToast('Analysis complete');
  };

  return (
    <section id="investigate" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Investigate profile</h1>
          <div className="sub">
            Analyze a suspected Facebook account against your identity baseline.
          </div>
        </div>
      </div>

      <div className="card formcard">
        <label className="label">Facebook profile URL</label>
        <input
          className="input"
          placeholder="https://facebook.com/example.profile"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
        />

        <div className="row" style={{ marginTop: 16 }}>
          <div>
            <label className="label">Reason for investigation</label>
            <CustomSelect value={reason} onChange={setReason} options={REASON_OPTIONS} />
          </div>
          <div>
            <label className="label">Case label</label>
            <input
              className="input"
              value={caseLabel}
              onChange={(e) => setCaseLabel(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn primary"
          style={{ marginTop: 18 }}
          onClick={runInvestigation}
        >
          Analyze profile
        </button>
      </div>

      {result && (
        <div className="result">
          <div className="risk">
            <div>
              <div className="small">Overall impersonation risk</div>
              <div className="risknum">HIGH</div>
              <div className="small">Based on simulated identity signals</div>
            </div>
            <button className="btn primary" onClick={() => onNavigate?.('cases')}>
              Create case
            </button>
          </div>
          <div className="meter">
            <i></i>
          </div>
          <div className="signals">
            <div className="signal">
              <b>Profile image similarity</b>
              <span>94% similarity detected</span>
            </div>
            <div className="signal">
              <b>Name similarity</b>
              <span>High similarity</span>
            </div>
            <div className="signal">
              <b>Public information</b>
              <span>Multiple matching signals</span>
            </div>
            <div className="signal">
              <b>Account behavior</b>
              <span>Requires manual review</span>
            </div>
          </div>
          <div className="casebox">
            <b>AI assessment</b>
            <p className="small">
              The submitted profile contains several signals consistent with
              possible impersonation of the established identity. Review the
              evidence before reporting.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
