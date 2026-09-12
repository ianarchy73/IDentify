import { useRef, useState } from 'react';
import { useToast } from '../components/toast/ToastContext';
import ImageDetailModal from '../components/modals/ImageDetailModal';
import type { FlaggedImage, RiskLevel } from '../types';

const RISK_LABELS: Record<RiskLevel, string> = {
  high: 'HIGH',
  medium: 'MEDIUM',
  resolved: 'LOW',
};

// TODO: Replace with a real facial-recognition + AI/photo-editor detection
// pipeline. This mock just produces plausible results for the prototype.
function mockAnalyzeImage(): {
  risk: RiskLevel;
  faceMatchScore: number;
  manipulationNotes: string;
} {
  const roll = Math.random();
  if (roll > 0.66) {
    return {
      risk: 'high',
      faceMatchScore: 90 + Math.round(Math.random() * 9),
      manipulationNotes: 'Strong signs of AI generation or photo-editor alteration detected. Manual review recommended before reporting.',
    };
  }
  if (roll > 0.33) {
    return {
      risk: 'medium',
      faceMatchScore: 60 + Math.round(Math.random() * 25),
      manipulationNotes: 'Possible AI-generated content or photo-editor changes detected. Not conclusive on its own — worth attaching to a case for further review.',
    };
  }
  return {
    risk: 'resolved',
    faceMatchScore: 10 + Math.round(Math.random() * 30),
    manipulationNotes: 'No strong signs of AI generation or photo-editor alteration detected.',
  };
}

export default function ImageCheck() {
  const showToast = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FlaggedImage | null>(null);
  const [gallery, setGallery] = useState<FlaggedImage[]>([]);
  const [activeImage, setActiveImage] = useState<FlaggedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const analyzeImage = async () => {
    if (!selectedFile || !previewUrl) return;
    setAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const analysis = mockAnalyzeImage();

    const flagged: FlaggedImage = {
      id: `IMG-${Date.now()}`,
      fileName: selectedFile.name,
      previewUrl,
      uploadedAt: new Date().toISOString(),
      risk: analysis.risk,
      riskLabel: RISK_LABELS[analysis.risk],
      faceMatchScore: analysis.faceMatchScore,
      manipulationNotes: analysis.manipulationNotes,
      usableForTraining: analysis.risk !== 'resolved',
    };

    setResult(flagged);
    setGallery((prev) => [flagged, ...prev]);
    setAnalyzing(false);
    showToast('Image analyzed');
  };

  const handleDelete = (id: string) => {
    setGallery((prev) => prev.filter((img) => img.id !== id));
    setActiveImage(null);
    showToast('Removed from gallery');
  };

  const handleToggleTraining = (id: string) => {
    setGallery((prev) =>
      prev.map((img) => (img.id === id ? { ...img, usableForTraining: !img.usableForTraining } : img)),
    );
    setActiveImage((prev) => (prev && prev.id === id ? { ...prev, usableForTraining: !prev.usableForTraining } : prev));
  };

  return (
    <section id="image" className="screen active">
      <div className="toolbar">
        <div>
          <h1>Image check</h1>
          <div className="sub">
            Review an image for manipulation and identity-reuse indicators.
          </div>
        </div>
      </div>

      <div className="card formcard">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files)}
        />

        {previewUrl ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <img
              src={previewUrl}
              alt="Selected"
              style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{selectedFile?.name}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
                  Choose a different image
                </button>
                <button type="button" className="btn primary" onClick={analyzeImage} disabled={analyzing}>
                  {analyzing ? 'Analyzing…' : 'Analyze image'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="upload">
            Drop an image here
            <br />
            <span style={{ fontSize: 11 }}>or choose a file for this prototype</span>
            <br />
            <button className="btn" style={{ marginTop: 12 }} onClick={() => fileInputRef.current?.click()}>
              Choose image
            </button>
          </div>
        )}

        {result && (
          <div className="result">
            <div className="risk">
              <div>
                <div className="small">Analysis result</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#996000' }}>
                  {result.risk === 'high' ? 'REVIEW REQUIRED' : result.risk === 'medium' ? 'REVIEW SUGGESTED' : 'LOOKS CLEAR'}
                </div>
              </div>
              <span className={`badge ${result.risk}`}>{result.riskLabel}</span>
            </div>
            <div className="signals">
              <div className="signal">
                <b>Image reuse</b>
                <span>{result.faceMatchScore}% facial similarity to your verified identity image</span>
              </div>
              <div className="signal">
                <b>AI / Photo-Editor Manipulation Detection</b>
                <span>{result.manipulationNotes}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card formcard" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Flagged image gallery</h3>
        <div className="sub" style={{ marginBottom: 14 }}>
          Every image you've checked stays here, so it can be reused as
          reference material for future AI analysis instead of being
          re-uploaded each time.
        </div>

        {gallery.length === 0 ? (
          <div className="empty-state">No flagged images yet.</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: 12,
            }}
          >
            {gallery.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImage(img)}
                style={{
                  position: 'relative',
                  padding: 0,
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'none',
                  textAlign: 'left',
                }}
              >
                <img
                  src={img.previewUrl}
                  alt={img.fileName}
                  style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
                />
                <span
                  className={`badge ${img.risk}`}
                  style={{ position: 'absolute', top: 6, right: 6, fontSize: 10, padding: '3px 6px' }}
                >
                  {img.riskLabel}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeImage && (
        <ImageDetailModal
          image={activeImage}
          onClose={() => setActiveImage(null)}
          onDelete={() => handleDelete(activeImage.id)}
          onToggleTraining={() => handleToggleTraining(activeImage.id)}
        />
      )}
    </section>
  );
}