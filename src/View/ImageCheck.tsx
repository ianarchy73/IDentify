import { useState } from 'react';
import { useToast } from '../components/toast/ToastContext';

export default function ImageCheck() {
  const showToast = useToast();
  const [result, setResult] = useState(false);

  const analyzeImage = () => {
    setResult(true);
    showToast('Image analyzed');
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
        <div className="upload">
          Drop an image here
          <br />
          <span style={{ fontSize: 11 }}>or choose a file for this prototype</span>
          <br />
          <button className="btn" style={{ marginTop: 12 }} onClick={analyzeImage}>
            Choose image
          </button>
        </div>

        {result && (
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
