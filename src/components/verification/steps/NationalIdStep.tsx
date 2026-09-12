import { useEffect, useRef, useState } from 'react';
import { NATIONAL_ID_LABELS, type NationalIdInfo, type NationalIdType } from '../../../types';

interface NationalIdStepProps {
  initial: NationalIdInfo | null;
  onNext: (info: NationalIdInfo) => void;
}

export default function NationalIdStep({ initial, onNext }: NationalIdStepProps) {
  const [idType, setIdType] = useState<NationalIdType>(initial?.idType ?? 'philsys');
  const [idNumber, setIdNumber] = useState(initial?.idNumber ?? '');
  const [fullNameOnId, setFullNameOnId] = useState(initial?.fullNameOnId ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initial?.frontImagePreviewUrl ?? null,
  );
  const [holdingIdUrl, setHoldingIdUrl] = useState<string | null>(
    initial?.holdingIdPreviewUrl ?? null,
  );
  const [cameraMode, setCameraMode] = useState<'id' | 'holding-id' | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [cameraMode]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraMode(null);
  };

  const openCamera = async (mode: 'id' | 'holding-id') => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode === 'id' ? 'environment' : 'user' } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraMode(mode);
    } catch {
      setCameraError('Camera access was unavailable. You can upload a photo instead.');
    }
  };

  const captureId = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const capturedUrl = canvas.toDataURL('image/jpeg', 0.9);
    if (cameraMode === 'holding-id') setHoldingIdUrl(capturedUrl);
    else setPreviewUrl(capturedUrl);
    stopCamera();
  };

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    stopCamera();
    setPreviewUrl(URL.createObjectURL(file));
  };

  const canProceed =
    idNumber.trim().length > 0 && fullNameOnId.trim().length > 0 && !!previewUrl && !!holdingIdUrl;

  return (
    <div className="card formcard">
      <h3 style={{ marginTop: 0 }}>Verify your national ID</h3>
      <div className="sub" style={{ marginBottom: 16 }}>
        This confirms the Facebook account belongs to a real, verifiable
        person before it can be protected.
      </div>

      <div className="row">
        <div>
          <label className="label">ID type</label>
          <select
            className="input"
            value={idType}
            onChange={(e) => setIdType(e.target.value as NationalIdType)}
          >
            {(Object.keys(NATIONAL_ID_LABELS) as NationalIdType[]).map((key) => (
              <option key={key} value={key}>
                {NATIONAL_ID_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">ID number</label>
          <input
            className="input"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="e.g. 1234-5678-9012"
          />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label className="label">Full name on ID</label>
        <input
          className="input"
          value={fullNameOnId}
          onChange={(e) => setFullNameOnId(e.target.value)}
          placeholder="As printed on your ID"
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <label className="label">Front of ID</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files)}
        />
        {cameraMode === 'id' ? (
          <div style={{ marginTop: 8 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, background: '#111' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="btn primary" onClick={captureId}>Capture ID</button>
              <button type="button" className="btn" onClick={stopCamera}>Cancel</button>
            </div>
          </div>
        ) : previewUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <img
              src={previewUrl}
              alt="ID preview"
              style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
            />
            <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
              Replace photo
            </button>
            <button type="button" className="btn" onClick={() => openCamera('id')}>Retake with camera</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" className="btn primary" onClick={() => openCamera('id')}>Open camera</button>
            <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>Upload photo</button>
          </div>
        )}
        {cameraError && <div className="sub" style={{ color: 'var(--danger)', marginTop: 6 }}>{cameraError}</div>}
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="label">Photo of you holding your ID</label>
        <div className="sub" style={{ marginBottom: 8, fontSize: 12 }}>
          Take a live photo with your face beside the ID, similar to an in-person verification check.
        </div>
        {cameraMode === 'holding-id' ? (
          <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, background: '#111' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="btn primary" onClick={captureId}>Take holding-ID photo</button>
              <button type="button" className="btn" onClick={stopCamera}>Cancel</button>
            </div>
          </div>
        ) : holdingIdUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={holdingIdUrl} alt="Photo of you holding your ID" style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
            <button type="button" className="btn" onClick={() => openCamera('holding-id')}>Retake holding-ID photo</button>
          </div>
        ) : (
          <button type="button" className="btn primary" onClick={() => openCamera('holding-id')}>Open camera</button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
        <button
          type="button"
          className="btn primary"
          disabled={!canProceed}
          onClick={() =>
            onNext({
              idType,
              idNumber: idNumber.trim(),
              fullNameOnId: fullNameOnId.trim(),
              frontImagePreviewUrl: previewUrl,
              holdingIdPreviewUrl: holdingIdUrl,
            })
          }
        >
          Next: Face verification
        </button>
      </div>
    </div>
  );
}