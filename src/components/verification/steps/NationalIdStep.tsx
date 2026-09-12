import { useRef, useState } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  };

  const canProceed =
    idNumber.trim().length > 0 && fullNameOnId.trim().length > 0 && !!previewUrl;

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
        {previewUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <img
              src={previewUrl}
              alt="ID preview"
              style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
            />
            <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
              Replace photo
            </button>
          </div>
        ) : (
          <button type="button" className="btn" style={{ marginTop: 6 }} onClick={() => fileInputRef.current?.click()}>
            + Upload ID photo
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
        <button
          type="button"
          className="btn primary"
          disabled={!canProceed}
          onClick={() =>
            onNext({ idType, idNumber: idNumber.trim(), fullNameOnId: fullNameOnId.trim(), frontImagePreviewUrl: previewUrl })
          }
        >
          Next: Face verification
        </button>
      </div>
    </div>
  );
}