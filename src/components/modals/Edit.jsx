import { useEffect, useRef, useState } from 'react';

const RISK_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'resolved', label: 'Resolved' },
];

const STATUS_OPTIONS = ['Investigating', 'Evidence collected', 'Closed'];

export default function EditCaseModal({ caseItem, onClose, onSave }) {
  const [title, setTitle] = useState(caseItem?.title ?? '');
  const [url, setUrl] = useState(caseItem?.url ?? '');
  const [risk, setRisk] = useState(caseItem?.risk ?? 'high');
  const [riskOpen, setRiskOpen] = useState(false);
  const riskRef = useRef(null);
  const [status, setStatus] = useState(caseItem?.status ?? STATUS_OPTIONS[0]);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (riskRef.current && !riskRef.current.contains(e.target)) {
        setRiskOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!caseItem) return null;

  const riskLabel = RISK_OPTIONS.find((r) => r.value === risk)?.label ?? '';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      ...caseItem,
      title: title.trim() || caseItem.title,
      url: url.trim() || caseItem.url,
      risk,
      riskLabel: riskLabel.toUpperCase(),
      status,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel modal-panel--no-scroll"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>Edit {caseItem.id}</h3>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path
                d="M6 18 17.94 6M18 18 6.06 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label className="label" htmlFor="edit-case-title">
              Case title
            </label>
            <input
              id="edit-case-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <label className="label" htmlFor="edit-case-url">
              Profile URL
            </label>
            <input
              id="edit-case-url"
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <label className="label">Risk level</label>
            <div className="custom-select" ref={riskRef} style={{ marginBottom: 16 }}>
              <div
                className={`cs-trigger ${riskOpen ? 'open' : ''}`}
                onClick={() => setRiskOpen((o) => !o)}
              >
                <span>{riskLabel}</span>
                <svg className="cs-arrow" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={`cs-options ${riskOpen ? 'show' : ''}`}>
                {RISK_OPTIONS.map((r) => (
                  <div
                    key={r.value}
                    className={`cs-option ${risk === r.value ? 'selected' : ''}`}
                    onClick={() => {
                      setRisk(r.value);
                      setRiskOpen(false);
                    }}
                  >
                    {r.label}
                  </div>
                ))}
              </div>
            </div>

            <label className="label" htmlFor="edit-case-status">
              Status
            </label>
            <div className="custom-select" ref={statusRef}>
              <div
                className={`cs-trigger ${statusOpen ? 'open' : ''}`}
                onClick={() => setStatusOpen((o) => !o)}
              >
                <span>{status}</span>
                <svg className="cs-arrow" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={`cs-options ${statusOpen ? 'show' : ''}`}>
                {STATUS_OPTIONS.map((s) => (
                  <div
                    key={s}
                    className={`cs-option ${status === s ? 'selected' : ''}`}
                    onClick={() => {
                      setStatus(s);
                      setStatusOpen(false);
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}