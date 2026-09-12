import { useState } from 'react';
import {
  VERIFICATION_STEPS,
  type FaceVerificationResult,
  type IdentityVerificationState,
  type NationalIdInfo,
  type VerificationStepId,
} from '../../types';
import { IconLogo } from '../icons';
import NationalIdStep from './steps/NationalIdStep';
import FaceVerificationStep from './steps/FaceVerificationStep';
import ReviewStep from './steps/ReviewStep';

const STEP_LABELS: Record<VerificationStepId, string> = {
  'national-id': 'National ID',
  face: 'Face check',
  review: 'Review',
};

interface IdentityVerificationProps {
  /** Passed when this is a monthly re-verification rather than first-time. */
  isRenewal?: boolean;
  initial: IdentityVerificationState;
  onVerified: (state: IdentityVerificationState) => void;
}

export default function IdentityVerification({
  isRenewal = false,
  initial,
  onVerified,
}: IdentityVerificationProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [nationalId, setNationalId] = useState<NationalIdInfo | null>(initial.nationalId);
  const [face, setFace] = useState<FaceVerificationResult | null>(null);

  const step = VERIFICATION_STEPS[stepIndex];
  const goTo = (i: number) => setStepIndex(Math.max(0, Math.min(i, VERIFICATION_STEPS.length - 1)));

  return (
    <div className="login" style={{ alignItems: 'flex-start', paddingTop: 60 }}>
      <div style={{ width: 440 }}>
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 18 }}>
          <IconLogo size={26} className="brand-logo" />
          <span><b>ID</b>entify</span>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: 20 }}>
          {isRenewal ? 'Time to re-verify your identity' : 'Verify your identity to continue'}
        </h1>
        <p className="sub" style={{ textAlign: 'center', marginBottom: 20 }}>
          {isRenewal
            ? 'This keeps your account protected — if it were ever hijacked, the extension would stop trusting it here.'
            : 'One-time setup: confirm a government ID and your face match your Facebook account.'}
        </p>

        <ol
          style={{
            display: 'flex',
            listStyle: 'none',
            padding: 0,
            margin: '0 0 18px',
            gap: 8,
          }}
        >
          {VERIFICATION_STEPS.map((s, i) => (
            <li
              key={s}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 12,
                padding: '6px 4px',
                borderBottom: `3px solid ${i <= stepIndex ? 'var(--blue)' : 'var(--line)'}`,
                color: i === stepIndex ? 'var(--text)' : 'var(--muted)',
                fontWeight: i === stepIndex ? 600 : 400,
              }}
            >
              {STEP_LABELS[s]}
            </li>
          ))}
        </ol>

        {step === 'national-id' && (
          <NationalIdStep
            initial={nationalId}
            onNext={(info) => {
              setNationalId(info);
              goTo(stepIndex + 1);
            }}
          />
        )}

        {step === 'face' && (
          <FaceVerificationStep
            onNext={(result) => {
              setFace(result);
              goTo(stepIndex + 1);
            }}
            onBack={() => goTo(stepIndex - 1)}
          />
        )}

        {step === 'review' && nationalId && face && (
          <ReviewStep
            nationalId={nationalId}
            face={face}
            onBack={() => goTo(stepIndex - 1)}
            onConfirm={onVerified}
          />
        )}
      </div>
    </div>
  );
}