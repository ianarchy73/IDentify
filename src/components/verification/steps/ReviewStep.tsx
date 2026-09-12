import {
  NATIONAL_ID_LABELS,
  VERIFICATION_VALIDITY_DAYS,
  type FaceVerificationResult,
  type IdentityVerificationState,
  type NationalIdInfo,
} from '../../../types';

interface ReviewStepProps {
  nationalId: NationalIdInfo;
  face: FaceVerificationResult;
  onConfirm: (state: IdentityVerificationState) => void;
  onBack: () => void;
}

export default function ReviewStep({ nationalId, face, onConfirm, onBack }: ReviewStepProps) {
  const handleConfirm = () => {
    const now = new Date();
    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + VERIFICATION_VALIDITY_DAYS);

    onConfirm({
      status: 'verified',
      nationalId,
      face,
      verifiedAt: now.toISOString(),
      nextDueAt: nextDue.toISOString(),
    });
  };

  return (
    <div className="card formcard">
      <h3 style={{ marginTop: 0 }}>Review &amp; confirm</h3>
      <div className="sub" style={{ marginBottom: 16 }}>
        Confirm this is correct. You'll need to verify again in{' '}
        {VERIFICATION_VALIDITY_DAYS} days, so a hijacked account can't stay
        trusted indefinitely.
      </div>

      <dl style={{ fontSize: 14, margin: 0 }}>
        <dt style={{ color: 'var(--muted)', marginTop: 10 }}>ID type</dt>
        <dd style={{ margin: '2px 0 0', fontWeight: 500 }}>
          {NATIONAL_ID_LABELS[nationalId.idType]}
        </dd>

        <dt style={{ color: 'var(--muted)', marginTop: 10 }}>Name on ID</dt>
        <dd style={{ margin: '2px 0 0', fontWeight: 500 }}>{nationalId.fullNameOnId}</dd>

        <dt style={{ color: 'var(--muted)', marginTop: 10 }}>ID number</dt>
        <dd style={{ margin: '2px 0 0', fontWeight: 500 }}>{nationalId.idNumber}</dd>

        <dt style={{ color: 'var(--muted)', marginTop: 10 }}>Face match</dt>
        <dd style={{ margin: '2px 0 0', fontWeight: 500 }}>{face.matchScore}% confidence</dd>
      </dl>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
        <button type="button" className="btn" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn primary" onClick={handleConfirm}>
          Confirm identity
        </button>
      </div>
    </div>
  );
}