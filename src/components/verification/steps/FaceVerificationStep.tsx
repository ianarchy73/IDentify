import { useEffect, useRef, useState } from 'react';
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
  const [comparisonPhotoUrl, setComparisonPhotoUrl] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ matchScore: number; passed: boolean } | null>(null);
  const comparisonInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [cameraOpen]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError('Camera access was unavailable. Please allow camera access to take your selfie.');
    }
  };

  const captureSelfie = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.9));
    setResult(null);
    stopCamera();
  };

  const handleComparisonFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setComparisonPhotoUrl(URL.createObjectURL(file));
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
        Take a clear selfie with your camera. We compare it against your ID photo and
        Facebook profile photo to confirm it's really you.
      </div>

      <input
        ref={comparisonInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleComparisonFile(e.target.files)}
      />

      {cameraOpen ? (
        <div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, background: '#111' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn primary" onClick={captureSelfie}>Take selfie</button>
            <button type="button" className="btn" onClick={stopCamera}>Cancel</button>
          </div>
        </div>
      ) : previewUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={previewUrl}
            alt="Selfie preview"
            style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--line)' }}
          />
          <button type="button" className="btn" onClick={openCamera}>Retake selfie</button>
        </div>
      ) : (
        <button type="button" className="btn primary" onClick={openCamera}>Open camera</button>
      )}

      {cameraError && <div className="sub" style={{ color: 'var(--danger)', marginTop: 8 }}>{cameraError}</div>}

      <div style={{ marginTop: 18 }}>
        <label className="label">Comparison photo</label>
        <div className="sub" style={{ fontSize: 12, marginBottom: 8 }}>
          Upload another clear photo of yourself for the prototype similarity check.
        </div>
        {comparisonPhotoUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={comparisonPhotoUrl} alt="Comparison photo preview" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
            <button type="button" className="btn" onClick={() => comparisonInputRef.current?.click()}>Replace photo</button>
          </div>
        ) : (
          <button type="button" className="btn" onClick={() => comparisonInputRef.current?.click()}>Upload comparison photo</button>
        )}
      </div>

      {previewUrl && comparisonPhotoUrl && !result && (
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
              comparisonPhotoPreviewUrl: comparisonPhotoUrl,
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