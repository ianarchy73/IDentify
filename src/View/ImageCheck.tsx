import { useEffect, useRef, useState } from 'react';
import { useToast } from '../components/toast/ToastContext';

export default function ImageCheck() {
  const showToast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(false);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!isAnalyzing) return;

    const timer = window.setTimeout(() => {
      setIsAnalyzing(false);
      setResult(true);
      showToast('Image analyzed');
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [isAnalyzing, showToast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageFile(null);
      setPreviewUrl(null);
      setError('Please choose an actual image file before continuing.');
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setResult(false);
  };

  const analyzeImage = () => {
    if (!imageFile) {
      setError('Please choose an image file before analyzing.');
      return;
    }
    setError(null);
    setResult(false);
    setIsAnalyzing(true);
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
        <div className="upload" onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && fileInputRef.current?.click()}>
          {previewUrl ? <img className="upload-preview" src={previewUrl} alt="Selected image preview" /> : 'Choose an image to analyze'}
          <br />
          <span style={{ fontSize: 11 }}>{imageFile ? imageFile.name : 'PNG, JPG, or another image file'}</span>
          <br />
          <button type="button" className="btn" style={{ marginTop: 12 }} onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }}>
            {imageFile ? 'Choose a different image' : 'Choose image'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
        </div>

        {error && <div className="upload-error" role="alert">{error}</div>}

        {imageFile && !isAnalyzing && !result && (
          <button type="button" className="btn primary" onClick={analyzeImage}>
            Analyze image
          </button>
        )}

        {isAnalyzing && previewUrl && (
          <div className="investigation-loading image-loading" aria-live="polite">
            <div className="scan-ring" aria-hidden="true">
              <img className="scan-avatar scan-image" src={previewUrl} alt="" />
            </div>
            <div className="scan-copy">
              <strong>Analyzing image</strong>
              <span>Checking for manipulation and identity-reuse indicators...</span>
            </div>
            <div className="scan-progress" aria-hidden="true"><i /></div>
          </div>
        )}

        {result && !isAnalyzing && (
          <div className="result">
            <div className="risk">
              <div>
                <div className="small">Analysis result</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#996000' }}>
                  REVIEW REQUIRED
                </div>
              </div>
              <span className="badge medium">MEDIUM</span>
            </div>
            <div className="signals">
              <div className="signal">
                <b>Image reuse</b>
                <span>High visual similarity to reference image</span>
              </div>
              <div className="signal">
                <b>Manipulation indicators</b>
                <span>Potential edits detected. Manual review recommended.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
