import { useRef, useState } from 'react';
import type { FaceVerificationResult } from '../../../types';

interface FaceVerificationStepProps {
  onNext: (result: FaceVerificationResult) => void;
  onBack: () => void;
}

// TODO: Replace with a real liveness check + face-match API (compares the
// selfie against the uploaded ID photo and the connected Facebook profile
// photo). This mock just simulates latency and returns a plausible score.
function mockFaceMatch(): Promise<{ matchScore: number; passed: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matchScore = 88 + Math.round(Math.random() * 10); // 88-98
      resolve({ matchScore, passed: matchScore >= 85 });
    }, 1400);
  });
}

export default function FaceVerificationStep({ onNext, onBack }: FaceVerificationStepProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ matchScore: number; passed: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const runCheck = async () => {
    setChecking(true);
    const outcome = await mockFaceMatch();
    setResult(outcome);
    setChecking(false);
  };

  return (
    <div className="card formcard">
      <h3 style={{ marginTop: 0 }}>Face verification</h3>
      <div className="sub" style={{ marginBottom: 16 }}>
        Take or upload a clear selfie. We compare it against your ID photo and
        Facebook profile photo to confirm it's really you.
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files)}
      />

      {previewUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={previewUrl}
            alt="Selfie preview"
            style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--line)' }}
          />
          <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
            Retake
          </button>
        </div>
      ) : (
        <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
          + Take selfie
        </button>
      )}

      {previewUrl && !result && (
        <button type="button" className="btn primary" style={{ marginTop: 16 }} onClick={runCheck} disabled={checking}>
          {checking ? 'Checking…' : 'Run face verification'}
        </button>
      )}

      {result && (
        <div
          className={`badge ${result.passed ? 'resolved' : 'high'}`}
          style={{ display: 'inline-block', marginTop: 16 }}
        >
          {result.passed ? `Match confirmed · ${result.matchScore}%` : `Match too low · ${result.matchScore}%`}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
        <button type="button" className="btn" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={!result?.passed}
          onClick={() =>
            onNext({
              capturedAt: new Date().toISOString(),
              selfiePreviewUrl: previewUrl,
              matchScore: result?.matchScore ?? 0,
              passed: result?.passed ?? false,
            })
          }
        >
          Next: Review
        </button>
      </div>
    </div>
  );
}