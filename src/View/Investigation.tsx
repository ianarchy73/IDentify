import { useState } from 'react';
import { useToast } from '../components/toast/ToastContext';
import CustomSelect from '../components/modals/Dropdown';
import type { InvestigationRecord, Screen } from '../types';

const REASON_OPTIONS = [
  'Possible impersonation',
  'Unauthorized use of my identity',
  'Unauthorized use of my photos',
  'Suspicious account activity',
  'Other',
];

const ANALYSIS_STEPS = [
  'Analyzing suspected profile...',
  'Comparing profile image similarity...',
  'Comparing name and public profile information...',
  'Generating impersonation risk assessment...',
];

const STEP_DELAY_MS = 550;

interface InvestigationProps {
  onNavigate?: (screen: Screen) => void;
  onAnalysisRecorded?: (record: InvestigationRecord) => void;
}

export default function Investigation({ onNavigate, onAnalysisRecorded }: InvestigationProps) {
  const showToast = useToast();
  const [profileUrl, setProfileUrl] = useState('');
  const [reason, setReason] = useState('Possible impersonation');
  const [caseLabel, setCaseLabel] = useState('Possible impersonation');
  const [result, setResult] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const runInvestigation = () => {
    const submittedUrl = profileUrl || 'facebook.com/example.profile';
    if (!profileUrl) setProfileUrl(submittedUrl);
    setResult(false);
    setAnalyzing(true);
    setStepIndex(0);

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i >= ANALYSIS_STEPS.length) {
        clearInterval(interval);
        setAnalyzing(false);
        setResult(true);
        onAnalysisRecorded?.({
          id: `INV-${Date.now()}`,
          profileUrl: submittedUrl,
          reason,
          caseLabel: caseLabel.trim() || 'Possible impersonation',
          analyzedAt: new Date().toISOString(),
          risk: 'high',
          riskLabel: 'HIGH',
          riskScore: 87,
          profileImageFinding: '94% visual similarity to the established identity image',
          nameFinding: 'Profile name closely matches the established identity',
          publicInfoFinding: '3 matching identity signals: name, photo style, and stated location',
          behaviorFinding: 'Behavioral evidence is inconclusive and requires human review',
        });
        showToast('Analysis complete');
        return;
      }
      setStepIndex(i);
    }, STEP_DELAY_MS);
  };

  return (
    <section id="investigate" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Investigate profile</h1>
          <div className="sub">
            Compare a suspected Facebook profile with the established identity.
          </div>
        </div>
      </div>

      <div className="card formcard">
        <label className="label">Suspected Facebook profile URL</label>
        <div className="sub">
          Enter the public URL of the profile you believe may be impersonating you.
        </div>
        <input
          className="input"
          placeholder="https://facebook.com/example.profile"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
        />

        <div className="row" style={{ marginTop: 16 }}>
          <div>
            <label className="label">Reason for investigation</label>
            <div className="sub">Select the concern that prompted this investigation.</div>
            <CustomSelect value={reason} onChange={setReason} options={REASON_OPTIONS} />
          </div>
          <div>
            <label className="label">Investigation case name</label>
            <div className="sub">Give this investigation a recognizable name for your records.</div>
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
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing...' : 'Analyze suspected profile'}
        </button>

        {analyzing && (
          <div className="small" style={{ marginTop: 10 }}>
            {ANALYSIS_STEPS[stepIndex]}
          </div>
        )}
      </div>

      {result && (
        <div className="result">
          <div className="risk">
            <div>
              <div className="small">Overall impersonation risk</div>
              <div className="risknum">HIGH — 87/100</div>
              <div className="small">
                Risk assessment based on simulated profile signals for this prototype.
              </div>
              <div className="small" style={{ marginTop: 6, maxWidth: 380 }}>
                Risk indicates the strength of detected impersonation signals; it does
                not independently prove fraudulent activity.
              </div>
            </div>
            <div>
              <button className="btn primary" onClick={() => onNavigate?.('cases')}>
                Create evidence case
              </button>
              <div className="small" style={{ marginTop: 8, maxWidth: 230 }}>
                Start an evidence case for this profile and its analysis results.
              </div>
            </div>
          </div>
          <div className="meter">
            <i></i>
          </div>
          <div className="signals">
            <div className="signal">
              <b>Profile image similarity</b>
              <span>94% visual similarity to the established identity image</span>
            </div>
            <div className="signal">
              <b>Name similarity</b>
              <span>High — profile name closely matches the established identity</span>
            </div>
            <div className="signal">
              <b>Public information</b>
              <span>3 identity-related fields match the established profile</span>
              <span className="small" style={{ display: 'block', marginTop: 4 }}>
                Potential matches: name, profile photo style, stated location
              </span>
            </div>
            <div className="signal">
              <b>Account behavior</b>
              <span>Behavioral evidence is inconclusive — review the profile and captured evidence manually</span>
            </div>
          </div>
          <div className="casebox">
            <b>AI investigation summary</b>
            <p className="small">
              <strong>Assessment:</strong> The suspected profile shows identity signals
              consistent with possible impersonation of the established identity.
            </p>
            <p className="small">
              <strong>Key findings:</strong>
            </p>
            <ul className="small" style={{ marginTop: -6, paddingLeft: 18 }}>
              <li>Profile image shows 94% visual similarity to the established identity image.</li>
              <li>Profile name closely matches the established identity.</li>
              <li>Public profile details show 3 matching identity signals (name, photo style, location).</li>
              <li>Available behavioral evidence is inconclusive and requires human review.</li>
            </ul>
            <p className="small">
              <strong>Recommended action:</strong> Review the captured evidence before
              submitting a report to Facebook or taking further action.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}